import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/lib/actions/admin";
import Link from "next/link";
import { CloudinaryUploader } from "@/components/admin/CloudinaryUploader";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const primaryImage = product.images[0];

  async function doUpdate(formData: FormData) {
    "use server";
    await updateProduct(id, formData);
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-sm" style={{ color: "#8888aa" }}>← Products</Link>
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Edit Product</h1>
      </div>

      <form action={doUpdate} className="space-y-6">
        {/* Name */}
        <Field label="Product Name" name="name" required defaultValue={product.name} />

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Price (USD)"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={(product.priceInCents / 100).toFixed(2)}
          />
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>Category</label>
            <select
              name="categoryId"
              required
              defaultValue={product.categoryId}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
              style={{ background: "#13131e", border: "1px solid #1e1e30" }}
            >
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
            defaultValue={product.description}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] resize-y outline-none focus:ring-1 focus:ring-[#a855f7]"
            style={{ background: "#13131e", border: "1px solid #1e1e30" }}
          />
        </div>

        <Field label="Material (optional)" name="material" defaultValue={product.material ?? ""} />

        {/* Image */}
        <CloudinaryUploader currentImageUrl={primaryImage?.url} />

        <div className="flex flex-wrap gap-6">
          <Checkbox name="isGlow" label="Glow Product" defaultChecked={product.isGlow} />
          <Checkbox name="inStock" label="In Stock" defaultChecked={product.inStock} />
          <Checkbox name="isMadeToOrder" label="Made to Order" defaultChecked={product.isMadeToOrder} />
        </div>

        <div className="pt-2" style={{ borderTop: "1px solid #1e1e30" }}>
          <p className="text-xs mb-3" style={{ color: "#8888aa" }}>SEO (optional)</p>
          <div className="space-y-3">
            <Field label="Meta Title" name="metaTitle" defaultValue={product.metaTitle ?? ""} />
            <Field label="Meta Description" name="metaDesc" defaultValue={product.metaDesc ?? ""} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
          >
            Save Changes
          </button>
          <Link href="/admin/products" className="px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ color: "#8888aa", border: "1px solid #1e1e30" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
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
