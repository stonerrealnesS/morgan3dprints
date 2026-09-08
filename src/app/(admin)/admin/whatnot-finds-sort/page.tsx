import { prisma } from "@/lib/prisma";
import { applyWhatnotFindsSort } from "@/lib/actions/admin";
import { suggestCategorySlug, CATEGORIZATION_RULES } from "@/lib/categorize";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function WhatnotFindsSortPage() {
  const [whatnotFinds, existingCategories] = await Promise.all([
    prisma.category.findUnique({ where: { slug: "whatnot-finds" }, select: { id: true } }),
    prisma.category.findMany({ select: { slug: true } }),
  ]);
  const existingSlugs = new Set(existingCategories.map((c) => c.slug));

  const products = whatnotFinds
    ? await prisma.product.findMany({
        where: { categoryId: whatnotFinds.id },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  const labelBySlug = new Map(CATEGORIZATION_RULES.map((r) => [r.slug, r.label]));

  const groups = new Map<string, { id: string; name: string }[]>();
  const unmatched: { id: string; name: string }[] = [];

  for (const product of products) {
    const slug = suggestCategorySlug(product.name);
    if (!slug) {
      unmatched.push(product);
      continue;
    }
    if (!groups.has(slug)) groups.set(slug, []);
    groups.get(slug)!.push(product);
  }

  const totalMatched = [...groups.values()].reduce((sum, list) => sum + list.length, 0);
  const isNewCategory = (slug: string) => !existingSlugs.has(slug);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">Sort Whatnot Finds</h1>
      <p className="text-sm mb-8" style={{ color: "#8888aa" }}>
        {products.length} product{products.length !== 1 ? "s" : ""} currently in Whatnot Finds.
        This keyword match would move <span style={{ color: "#4ade80" }}>{totalMatched}</span> of them
        into real categories and leave <span style={{ color: "#f59e0b" }}>{unmatched.length}</span> for you
        to sort by hand. Nothing moves until you click Apply below — review the groups first.
      </p>

      {groups.size === 0 ? (
        <div className="rounded-xl py-16 text-center mb-8" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
          <p className="text-sm" style={{ color: "#8888aa" }}>
            {products.length === 0 ? "Whatnot Finds is already empty — nothing to sort." : "No confident matches found."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {[...groups.entries()].map(([slug, list]) => (
            <details key={slug} className="rounded-xl p-5" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }} open>
              <summary className="cursor-pointer font-semibold text-[#f0f0ff] flex items-center gap-2">
                <span>{labelBySlug.get(slug) ?? slug}</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
                  {list.length} product{list.length !== 1 ? "s" : ""}
                </span>
                {isNewCategory(slug) && (
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: "rgba(34,211,238,0.15)", color: "#22d3ee" }}>
                    new category — will be created
                  </span>
                )}
              </summary>
              <ul className="mt-3 space-y-1 text-sm" style={{ color: "#8888aa" }}>
                {list.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      )}

      {unmatched.length > 0 && (
        <details className="rounded-xl p-5 mb-8" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
          <summary className="cursor-pointer font-semibold text-[#f0f0ff]">
            Left in Whatnot Finds — no confident match ({unmatched.length})
          </summary>
          <ul className="mt-3 space-y-1 text-sm" style={{ color: "#8888aa" }}>
            {unmatched.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        </details>
      )}

      {totalMatched > 0 && (
        <form action={applyWhatnotFindsSort}>
          <ConfirmSubmitButton
            confirmMessage={`Move ${totalMatched} product${totalMatched !== 1 ? "s" : ""} into the categories shown above? This can be undone product-by-product from the Categories page, but not in one click.`}
            className="px-5 py-3 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
          >
            Apply — move {totalMatched} product{totalMatched !== 1 ? "s" : ""}
          </ConfirmSubmitButton>
        </form>
      )}
    </div>
  );
}
