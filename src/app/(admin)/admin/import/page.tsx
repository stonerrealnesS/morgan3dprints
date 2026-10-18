import ImportForm from "./ImportForm";

export const dynamic = "force-dynamic";

export default function AdminImportPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">Import orders</h1>
      <p className="text-sm mb-6" style={{ color: "#8888aa" }}>
        Whatnot: Seller Hub, open a show, download the report (CSV), then drop it here. Each buyer&apos;s bundle
        becomes one order on the Packing page. Uploading the same file twice is safe.
      </p>
      <ImportForm />
      <h2 className="text-lg font-bold text-[#f0f0ff] mt-10 mb-2">All channels (orders.csv)</h2>
      <p className="text-sm mb-6" style={{ color: "#8888aa" }}>
        Drop the business folder&apos;s <code>orders/orders.csv</code> here. Every open order from Whatnot, Mercari,
        Facebook and TikTok Shop is added to Packing with the buyer, the items and a link to print the label on that
        site. Uploading the same file twice is safe.
      </p>
      <ImportForm kind="pack" />
    </div>
  );
}
