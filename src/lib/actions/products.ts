import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  priceInCents: number;
  isGlow: boolean;
  inStock: boolean;
  isMadeToOrder: boolean;
  material: string | null;
  category: { id: string; name: string; slug: string };
  images: { url: string; isPrimary: boolean }[];
};

export type ProductDetailImage = {
  id: string;
  url: string;
  cloudinaryId: string;
  alt: string | null;
  isPrimary: boolean;
  order: number;
};

export type ProductDetail = Omit<ProductSummary, "images"> & {
  description: string;
  metaTitle: string | null;
  metaDesc: string | null;
  images: ProductDetailImage[];
  reviews: {
    id: string;
    rating: number;
    body: string | null;
    createdAt: Date;
    customer: { firstName: string | null; lastName: string | null };
  }[];
};

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  isAdult: boolean;
};

// ─── getProducts ──────────────────────────────────────────────────────────────

export type GetProductsOptions = {
  categorySlug?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type GetProductsResult = {
  products: ProductSummary[];
  total: number;
  page: number;
  totalPages: number;
};

export const getProducts = unstable_cache(
  async (options: GetProductsOptions = {}): Promise<GetProductsResult> => {
    const { categorySlug, search, page = 1, limit = 12 } = options;

    const where = {
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          priceInCents: true,
          isGlow: true,
          inStock: true,
          isMadeToOrder: true,
          material: true,
          category: { select: { id: true, name: true, slug: true } },
          images: {
            where: { isPrimary: true },
            select: { url: true, isPrimary: true },
            take: 1,
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },
  ["products"],
  { revalidate: 3600, tags: ["products"] }
);

// ─── getProduct ───────────────────────────────────────────────────────────────

export const getProduct = unstable_cache(
  async (slug: string): Promise<ProductDetail | null> => {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        priceInCents: true,
        isGlow: true,
        inStock: true,
        isMadeToOrder: true,
        material: true,
        metaTitle: true,
        metaDesc: true,
        category: { select: { id: true, name: true, slug: true } },
        images: {
          select: {
            id: true,
            url: true,
            cloudinaryId: true,
            alt: true,
            isPrimary: true,
            order: true,
          },
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            body: true,
            createdAt: true,
            customer: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return product as ProductDetail | null;
  },
  ["products"],
  { revalidate: 3600, tags: ["products"] }
);

// ─── getCategories ────────────────────────────────────────────────────────────

export type GetCategoriesResult = {
  regular: CategorySummary[];
  adult: CategorySummary[];
};

export const getCategories = unstable_cache(
  async (): Promise<GetCategoriesResult> => {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, isAdult: true },
      orderBy: { name: "asc" },
    });

    return {
      regular: categories.filter((c) => !c.isAdult),
      adult: categories.filter((c) => c.isAdult),
    };
  },
  ["products"],
  { revalidate: 3600, tags: ["products"] }
);

// ─── getFeaturedProducts ──────────────────────────────────────────────────────

export const getFeaturedProducts = unstable_cache(
  async (limit = 8): Promise<ProductSummary[]> => {
    const products = await prisma.product.findMany({
      where: { inStock: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        priceInCents: true,
        isGlow: true,
        inStock: true,
        isMadeToOrder: true,
        material: true,
        category: { select: { id: true, name: true, slug: true } },
        images: {
          where: { isPrimary: true },
          select: { url: true, isPrimary: true },
          take: 1,
        },
      },
    });

    return products;
  },
  ["products"],
  { revalidate: 3600, tags: ["products"] }
);
