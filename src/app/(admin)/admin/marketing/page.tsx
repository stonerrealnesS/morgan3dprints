import { getWinbackCandidates, sendWinbackCampaign } from "@/lib/actions/admin";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

type Props = {
  searchParams: Promise<{ sent?: string; total?: string }>;
};

export default async function AdminMarketingPage({ searchParams }: Props) {
  const { sent, total } = await searchParams;
  const candidates = await getWinbackCandidates();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">Marketing</h1>
      <p className="text-sm mb-8" style={{ color: "#8888aa" }}>
        Free-channel tools for turning existing traffic and past customers into repeat orders.
      </p>

      {sent !== undefined && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80" }}
        >
          Sent {sent} of {total} win-back email{total === "1" ? "" : "s"}.
        </div>
      )}

      <div className="rounded-xl p-6" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
        <h2 className="font-semibold text-[#f0f0ff] mb-2">Win-Back Campaign</h2>
        <p className="text-sm mb-4" style={{ color: "#8888aa" }}>
          Emails a 15% off code (<span className="font-mono" style={{ color: "#a855f7" }}>COMEBACK15</span>) to
          customers who ordered before but haven&apos;t in the last 30 days. Anyone already emailed in the last
          30 days is automatically skipped, so this is safe to run again later without spamming the same people.
        </p>

        <div
          className="flex items-center gap-3 mb-5 px-4 py-3 rounded-lg text-sm"
          style={{ background: "#13131e", border: "1px solid #1e1e30" }}
        >
          <span style={{ color: "#8888aa" }}>Eligible right now:</span>
          <span className="font-semibold" style={{ color: "#22d3ee" }}>
            {candidates.length} customer{candidates.length === 1 ? "" : "s"}
          </span>
        </div>

        {candidates.length > 0 && (
          <div className="mb-5 max-h-48 overflow-y-auto rounded-lg" style={{ border: "1px solid #1e1e30" }}>
            {candidates.slice(0, 20).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-4 py-2 text-sm"
                style={{ borderBottom: "1px solid #13131e" }}
              >
                <span className="text-[#f0f0ff]">{c.email}</span>
                <span style={{ color: "#8888aa" }}>
                  last order {new Date(c.lastOrderAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {candidates.length > 20 && (
              <div className="px-4 py-2 text-xs text-center" style={{ color: "#8888aa" }}>
                + {candidates.length - 20} more
              </div>
            )}
          </div>
        )}

        <form action={sendWinbackCampaign}>
          <ConfirmSubmitButton
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{
              background: candidates.length === 0 ? "#1e1e30" : "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
              opacity: candidates.length === 0 ? 0.6 : 1,
              cursor: candidates.length === 0 ? "not-allowed" : "pointer",
            }}
            disabled={candidates.length === 0}
            confirmMessage={`Send the win-back email to ${candidates.length} customer${candidates.length === 1 ? "" : "s"}? This can't be undone.`}
          >
            Send Win-Back Emails
          </ConfirmSubmitButton>
        </form>
      </div>
    </div>
  );
}
