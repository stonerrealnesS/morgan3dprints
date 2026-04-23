import { prisma } from "@/lib/prisma";
import { createProduct } from "@/lib/actions/admin";
import { CloudinaryUploader } from "@/components/admin/CloudinaryUploader";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#f0f0ff] mb-8">New Product</h1>
      <form action={createProduct} className="space-y-6">
        <ProductFormFields categories={categories} />
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
          >
            Create Product
          </button>
          <a href="/admin/products" className="px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ color: "#8888aa", border: "1px solid #1e1e30" }}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}

function ProductFormFields({
  categories,
  defaults,
}: {
  categories: { id: string; name: string }[];
  defaults?: Record<string, string | boolean | number | null>;
}) {
  return (
    <>
      <Field label="Product Name" name="name" required defaultValue={defaults?.name as string} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (USD)" name="price" type="number" step="0.01" min="0" required defaultValue={defaults?.price as string} />
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>Category</label>
          <select
            name="categoryId"
            required
            defaultValue={defaults?.categoryId as string}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
            style={{ background: "#13131e", border: "1px solid #1e1e30" }}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>Description</label>
        <textarea
          name="description"
          required
          rows={5}
          defaultValue={defaults?.description as string}
          className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] resize-y outline-none focus:ring-1 focus:ring-[#a855f7]"
          style={{ background: "#13131e", border: "1px solid #1e1e30" }}
        />
      </div>
      <Field label="Material (optional)" name="material" defaultValue={defaults?.material as string} />
      <CloudinaryUploader />
      <div className="flex flex-wrap gap-6">
        <Checkbox name="isGlow" label="Glow Product" defaultChecked={defaults?.isGlow as boolean} />
        <Checkbox name="inStock" label="In Stock" defaultChecked={defaults?.inStock !== false} />
        <Checkbox name="isMadeToOrder" label="Made to Order" defaultChecked={defaults?.isMadeToOrder as boolean} />
      </div>
      <div className="pt-2" style={{ borderTop: "1px solid #1e1e30" }}>
        <p className="text-xs mb-3" style={{ color: "#8888aa" }}>SEO (optional)</p>
        <div className="space-y-3">
          <Field label="Meta Title" name="metaTitle" defaultValue={defaults?.metaTitle as string} />
          <Field label="Meta Description" name="metaDesc" defaultValue={defaults?.metaDesc as string} />
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue as string}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
        style={{ background: "#13131e", border: "1px solid #1e1e30" }}
        {...rest}
      />
    </div>
  );
}

function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#8888aa" }}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="accent-purple-500 w-4 h-4" />
      {label}
    </label>
  );
}

export { ProductFormFields };
