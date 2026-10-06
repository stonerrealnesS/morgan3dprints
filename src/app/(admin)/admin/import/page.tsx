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
    </div>
  );
}
