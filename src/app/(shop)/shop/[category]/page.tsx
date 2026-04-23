import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/actions/products";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "keychains": "Custom 3D-printed keychains handcrafted in OKC. Bold designs, glow-in-the-dark options, and made-to-order styles — perfect for gifts or accessories.",
  "glow-in-the-dark": "Glow-in-the-dark 3D printed art and decor. Charges in light, glows all night — perfect for gaming rooms, bedrooms, and bold displays.",
  "fidgets": "3D printed fidget toys and sensory tools. Satisfying, durable, and endlessly customizable. Great for focus, stress relief, or just fun.",
  "tiny-things": "Small-scale 3D printed collectibles, miniatures, and tiny novelty items. Big on detail, small on footprint.",
  "doggos": "Dog-themed 3D printed gifts, tags, and decor. Custom dog breeds available on request — perfect for pet lovers.",
  "man-cave": "Bold 3D printed decor and conversation pieces for the man cave. Personalized signs, display pieces, and novelty items.",
  "for-the-ladies": "Unique 3D printed gifts and accessories. Fun, bold, and fully customizable — made to order in any color.",
  "at-the-office": "Custom 3D printed desk accessories, name plates, organizers, and office decor. Personalize your workspace.",
  "at-the-house": "Unique home decor and novelty 3D printed pieces to make your space stand out. Customizable in any filament.",
  "accessories": "3D printed accessories including bag tags, clips, mounts, and everyday carry pieces. Functional and stylish.",
  "services": "Professional custom 3D printing services in OKC — merch, prototypes, signage, and short-run manufacturing.",
  "custom": "Submit a fully custom 3D print order. Bring your idea, file, or sketch and we'll make it real — quote in 24 hours.",
  "420-friendly": "420-friendly 3D printed products. Unique, functional, and handcrafted in OKC.",
};

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
    title: `${category.name} — Custom 3D Prints OKC`,
    description: CATEGORY_DESCRIPTIONS[slug] ?? `Shop ${category.name} — custom 3D-printed products handcrafted in Oklahoma City.`,
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
            style={{ background: "linear-gradient(to right, rgba(168,85,247,0.6), transparent)" }}
          />
        </div>
        {CATEGORY_DESCRIPTIONS[slug] && (
          <p className="mt-3 text-sm max-w-2xl" style={{ color: "#8888aa" }}>
            {CATEGORY_DESCRIPTIONS[slug]}
          </p>
        )}
        <p className="mt-2 text-xs" style={{ color: "#555570" }}>
          {total} product{total !== 1 ? "s" : ""}
        </p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
