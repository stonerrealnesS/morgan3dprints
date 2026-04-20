/**
 * Import products from the old Square/JSON catalog into the new Prisma DB.
 * Run: node scripts/import-products.mjs
 *
 * Safe to run multiple times — upserts by slug.
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PrismaClient } from "../src/generated/prisma/index.js";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient({ log: ["warn", "error"] });

// ─── Category config ───────────────────────────────────────────────────────────
// Categories to skip entirely (they're service offerings, not shop products)
const SKIP_CATEGORIES = new Set(["Service", "Print by the Hour", "Custom"]);

const CATEGORY_MAP = {
  "NSFW - Home Decor":        { name: "NSFW – Home Decor",     slug: "nsfw-home-decor",      isAdult: true  },
  "Hold My Beer (Masculine)": { name: "Masculine",              slug: "masculine",             isAdult: false },
  "Glow in the Dark":         { name: "Glow in the Dark",       slug: "glow-in-the-dark",     isAdult: false },
  "Yas Queen! (Feminine)":    { name: "Feminine",               slug: "feminine",              isAdult: false },
  "420 Friendly":             { name: "420 Friendly",           slug: "420-friendly",          isAdult: true  },
  "Keychains":                { name: "Keychains",              slug: "keychains",             isAdult: false },
  "Safe for work - Desk Decor": { name: "Desk Décor",           slug: "desk-decor",            isAdult: false },
  "Fidgets":                  { name: "Fidgets",                slug: "fidgets",               isAdult: false },
  "Tiny Things":              { name: "Tiny Things",            slug: "tiny-things",           isAdult: false },
  "Doggos":                   { name: "Doggos",                 slug: "doggos",                isAdult: false },
};

function makeSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function main() {
  const raw = require(join(__dirname, "../Old Code Base/products.json"));

  console.log(`\nLoaded ${raw.length} products from JSON.\n`);

  // 1. Upsert categories (find by slug OR name to avoid unique constraint errors)
  const categoryIds = {};
  for (const [oldName, cfg] of Object.entries(CATEGORY_MAP)) {
    let cat = await prisma.category.findFirst({
      where: { OR: [{ slug: cfg.slug }, { name: cfg.name }] },
    });
    if (cat) {
      cat = await prisma.category.update({
        where: { id: cat.id },
        data: { isAdult: cfg.isAdult },
      });
    } else {
      cat = await prisma.category.create({
        data: { name: cfg.name, slug: cfg.slug, isAdult: cfg.isAdult },
      });
    }
    categoryIds[oldName] = cat.id;
    console.log(`✓ Category: ${cfg.name} (${cat.id})`);
  }

  console.log(`\nImporting products...\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const p of raw) {
    // Skip service categories
    if (SKIP_CATEGORIES.has(p.category)) {
      skipped++;
      continue;
    }

    const catConfig = CATEGORY_MAP[p.category];
    if (!catConfig) {
      console.warn(`  ⚠️  Unknown category: "${p.category}" — skipping "${p.name}"`);
      skipped++;
      continue;
    }

    const categoryId = categoryIds[p.category];
    const slug = makeSlug(p.name);
    const isGlow = p.category === "Glow in the Dark";
    const priceInCents = p.priceCents ?? p.price ?? 0;

    // Upsert product
    const product = await prisma.product.upsert({
      where: { slug },
      create: {
        name: p.name,
        slug,
        description: p.description ?? "",
        priceInCents,
        categoryId,
        isGlow,
        inStock: true,
        isMadeToOrder: false,
        material: "PLA",
      },
      update: {
        name: p.name,
        description: p.description ?? "",
        priceInCents,
        categoryId,
        isGlow,
      },
    });

    // Upsert primary image
    const imageUrl = p.image ?? p.images?.[0];
    if (imageUrl) {
      const existingImg = await prisma.productImage.findFirst({
        where: { productId: product.id, isPrimary: true },
      });

      if (!existingImg) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: imageUrl,
            cloudinaryId: imageUrl, // placeholder until Cloudinary migration
            isPrimary: true,
            order: 0,
          },
        });
        created++;
        console.log(`  + Created: ${p.name}`);
      } else {
        // Update image URL if it changed
        await prisma.productImage.update({
          where: { id: existingImg.id },
          data: { url: imageUrl, cloudinaryId: imageUrl },
        });
        updated++;
        console.log(`  ↺ Updated: ${p.name}`);
      }
    } else {
      updated++;
      console.log(`  ↺ Updated (no image): ${p.name}`);
    }

    // Additional images
    if (p.images && p.images.length > 1) {
      for (let i = 1; i < p.images.length; i++) {
        const imgUrl = p.images[i];
        await prisma.productImage.upsert({
          where: { id: `${product.id}-img-${i}` },
          create: {
            id: `${product.id}-img-${i}`,
            productId: product.id,
            url: imgUrl,
            cloudinaryId: imgUrl,
            isPrimary: false,
            order: i,
          },
          update: { url: imgUrl },
        }).catch(() => {
          // Extra images may already exist with different IDs — ignore
        });
      }
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped} (service items)`);

  const total = await prisma.product.count();
  const catTotal = await prisma.category.count();
  console.log(`\n   DB now has ${total} products across ${catTotal} categories.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
