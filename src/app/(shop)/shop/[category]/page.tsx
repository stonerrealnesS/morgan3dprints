import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/actions/products";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  try {
    const { regular, adult } = await getCategories();
    return [...regular, ...adult].map((cat) => ({ category: cat.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!category) return { title: "Category Not Found" };
  return {
    title: category.name,
    description: `Shop ${category.name} — custom 3D-printed products handcrafted in OKC.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;

  // Verify the category exists
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });

  if (!category) notFound();

  const { products, total } = await getProducts({ categorySlug: slug, limit: 48 });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: "https://www.morgan3dokc.com/shop" },
      { "@type": "ListItem", position: 2, name: category.name },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "#8888aa" }}>
        <a href="/shop" className="hover:text-white transition-colors">Shop</a>
        <span>/</span>
        <span style={{ color: "#f0f0ff" }}>{category.name}</span>
      </nav>

      {/* Heading */}
      <div className="mb-10">
        <div className="flex items-end gap-4">
          <h1 className="text-4xl font-extrabold text-white">{category.name}</h1>
          <div
            className="flex-1 h-px mb-2"
            style={{
              background: "linear-gradient(to right, rgba(168,85,247,0.6), transparent)",
            }}
          />
        </div>
        <p className="mt-2 text-sm" style={{ color: "#8888aa" }}>
          {total} product{total !== 1 ? "s" : ""}
        </p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
