import { prisma } from "@/lib/prisma";
import { updateCustomRequest } from "@/lib/actions/admin";

const statusColors: Record<string, string> = {
  new: "#ec4899",
  reviewing: "#f59e0b",
  quoted: "#22d3ee",
  approved: "#a855f7",
  completed: "#4ade80",
  declined: "#ef4444",
};

export default async function AdminCustomRequestsPage() {
  const requests = await prisma.customRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const allStatuses = ["new", "reviewing", "quoted", "approved", "completed", "declined"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-8">Custom Requests</h1>

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="rounded-xl p-6" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold capitalize"
                    style={{
                      background: `${statusColors[req.status] ?? "#8888aa"}18`,
                      color: statusColors[req.status] ?? "#8888aa",
                    }}
                  >
                    {req.status}
                  </span>
                  <span className="text-xs" style={{ color: "#8888aa" }}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs capitalize"
                    style={{ background: "#1e1e30", color: "#8888aa" }}
                  >
                    {req.type}
                  </span>
                </div>
                <p className="font-semibold text-[#f0f0ff]">{req.name}</p>
                <p className="text-sm" style={{ color: "#8888aa" }}>
                  {req.email}{req.phone ? ` · ${req.phone}` : ""}
                </p>
              </div>
            </div>

            <p className="text-sm mb-4 leading-relaxed" style={{ color: "#8888aa" }}>{req.description}</p>

            {req.fileUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {req.fileUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 rounded"
                    style={{ background: "#13131e", color: "#a855f7", border: "1px solid #1e1e30" }}
                  >
                    File {i + 1} ↗
                  </a>
                ))}
              </div>
            )}

            {/* Update status & notes */}
            <form
              action={async (formData: FormData) => {
                "use server";
                await updateCustomRequest(
                  req.id,
                  formData.get("status") as string,
                  formData.get("adminNotes") as string
                );
              }}
              className="flex flex-col gap-3 pt-4"
              style={{ borderTop: "1px solid #1e1e30" }}
            >
              <div className="flex gap-2 flex-wrap">
                {allStatuses.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-1.5 text-xs cursor-pointer capitalize px-2 py-1 rounded"
                    style={{
                      background: req.status === s ? `${statusColors[s]}22` : "#13131e",
                      border: `1px solid ${req.status === s ? statusColors[s] + "66" : "#1e1e30"}`,
                      color: req.status === s ? statusColors[s] : "#8888aa",
                    }}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      defaultChecked={req.status === s}
                      className="accent-purple-500"
                    />
                    {s}
                  </label>
                ))}
              </div>
              <textarea
                name="adminNotes"
                rows={3}
                placeholder="Admin notes / quote info…"
                defaultValue={req.adminNotes ?? ""}
                className="w-full px-3 py-2 rounded-lg text-sm text-[#f0f0ff] resize-none outline-none focus:ring-1 focus:ring-[#a855f7]"
                style={{ background: "#13131e", border: "1px solid #1e1e30" }}
              />
              <div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        ))}

        {requests.length === 0 && (
          <div
            className="rounded-xl py-16 text-center"
            style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
          >
            <p className="text-sm" style={{ color: "#8888aa" }}>No custom requests yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
