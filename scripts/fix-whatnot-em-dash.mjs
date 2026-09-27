/**
 * One-time backfill: fixes the "Available on Whatnot — @morgan_3d_prints.
 * Listing ID ..." sentence (with a space on both sides of the dash) baked
 * into product descriptions by the Whatnot
 * sync (see syncWhatnotProducts in src/lib/actions/admin.ts). That sentence
 * used an em dash for every product created before the sync template was
 * fixed to use a comma instead. This script rewrites the em-dash form to the
 * comma form in the database so it matches everywhere else on the site.
 *
 * Only touches that one exact sentence inside the description — nothing
 * else in the text is changed, and products that already use the comma
 * form (or have no Whatnot sentence at all) are left untouched.
 *
 * Run: node scripts/fix-whatnot-em-dash.mjs           (dry run, default)
 *      node scripts/fix-whatnot-em-dash.mjs --apply    (writes the changes)
 *
 * Safe to run multiple times — it only matches the em-dash form, so once a
 * product is fixed, re-running the script is a no-op for it.
 */

import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient({ log: ["warn", "error"] });

const EM_DASH = String.fromCharCode(8212); // —
// The old template has a space on both sides of the dash: "Whatnot — @morgan".
const OLD_PATTERN = new RegExp(
  `Available on Whatnot ${EM_DASH} @morgan_3d_prints\\. Listing ID ([\\w+/=]+)\\.`,
  "g"
);

const apply = process.argv.includes("--apply");

async function main() {
  const candidates = await prisma.product.findMany({
    where: { description: { contains: `Whatnot ${EM_DASH}` } },
    select: { id: true, name: true, slug: true, description: true },
  });

  if (candidates.length === 0) {
    console.log("No products found with the em-dash Whatnot sentence. Nothing to do.");
    return;
  }

  console.log(
    `Found ${candidates.length} product(s) with the em-dash Whatnot sentence.${
      apply ? " Applying fix..." : " Dry run — pass --apply to write changes."
    }\n`
  );

  let changed = 0;
  for (const product of candidates) {
    const fixed = product.description.replace(
      OLD_PATTERN,
      "Available on Whatnot, @morgan_3d_prints. Listing ID $1."
    );

    if (fixed === product.description) {
      console.log(`- SKIP  ${product.slug} (pattern didn't match cleanly, left untouched)`);
      continue;
    }

    console.log(`- ${apply ? "FIX " : "WOULD FIX"}  ${product.slug}`);
    console.log(`    before: ${product.description.slice(0, 90)}...`);
    console.log(`    after:  ${fixed.slice(0, 90)}...`);

    if (apply) {
      await prisma.product.update({
        where: { id: product.id },
        data: { description: fixed },
      });
    }
    changed++;
  }

  console.log(
    `\n${apply ? "Updated" : "Would update"} ${changed} of ${candidates.length} product(s).`
  );
  if (!apply) {
    console.log("Re-run with --apply once this looks right to write the changes.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
