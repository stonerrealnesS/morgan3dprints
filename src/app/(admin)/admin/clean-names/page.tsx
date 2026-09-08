import { prisma } from "@/lib/prisma";
import { applyNameCleanup } from "@/lib/actions/admin";
import { cleanProductName } from "@/lib/cleanupName";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function CleanNamesPage() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const diffs = products
    .map((p) => ({ id: p.id, before: p.name, after: cleanProductName(p.name) }))
    .filter((p) => p.before !== p.after);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">Clean Up Product Names</h1>
      <p className="text-sm mb-8" style={{ color: "#8888aa" }}>
        Formatting-only pass — collapses !!! and repeated punctuation, fixes ALL-CAPS SHOUTING into
        normal case, and tidies extra whitespace. It doesn&apos;t rewrite wording. {diffs.length} product
        {diffs.length !== 1 ? "s" : ""} would change; nothing happens until you click Apply.
      </p>

      {diffs.length === 0 ? (
        <div className="rounded-xl py-16 text-center" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
          <p className="text-sm" style={{ color: "#8888aa" }}>Nothing to clean up right now.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl overflow-hidden mb-6" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #1e1e30" }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#8888aa" }}>Before</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#8888aa" }}>After</th>
                </tr>
              </thead>
              <tbody>
                {diffs.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #1e1e30" }}>
                    <td className="px-4 py-3 align-top" style={{ color: "#8888aa" }}>{d.before}</td>
                    <td className="px-4 py-3 align-top text-[#f0f0ff]">{d.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form action={applyNameCleanup}>
            <ConfirmSubmitButton
              confirmMessage={`Apply this formatting cleanup to ${diffs.length} product name${diffs.length !== 1 ? "s" : ""}?`}
              className="px-5 py-3 rounded-lg text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
            >
              Apply — clean up {diffs.length} name{diffs.length !== 1 ? "s" : ""}
            </ConfirmSubmitButton>
          </form>
        </>
      )}
    </div>
  );
}
