"use server";

import { revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { Resend } from "resend";
import { ShippingNotificationEmail } from "@/emails/ShippingNotification";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "");
}

async function requireAdmin() {
  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!userId || !adminIds.includes(userId)) {
    redirect("/sign-in");
  }
  return userId;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceInCents = Math.round(
    parseFloat(formData.get("price") as string) * 100
  );
  const comparePrice = formData.get("comparePrice") as string;
  const comparePriceInCents = comparePrice
    ? Math.round(parseFloat(comparePrice) * 100)
    : null;
  const categoryId = formData.get("categoryId") as string;
  const material = (formData.get("material") as string) || null;
  const isGlow = formData.get("isGlow") === "on";
  const inStock = formData.get("inStock") === "on";
  const isMadeToOrder = formData.get("isMadeToOrder") === "on";
  const metaTitle = (formData.get("metaTitle") as string) || null;
  const metaDesc = (formData.get("metaDesc") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string) || null;

  const slug = slugify(name, { lower: true, strict: true });

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      priceInCents,
      comparePriceInCents,
      categoryId,
      material,
      isGlow,
      inStock,
      isMadeToOrder,
      metaTitle,
      metaDesc,
      ...(imageUrl
        ? {
            images: {
              create: {
                url: imageUrl,
                cloudinaryId: imageUrl,
                isPrimary: true,
                order: 0,
              },
            },
          }
        : {}),
    },
  });

  revalidateTag("products", "max");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceInCents = Math.round(
    parseFloat(formData.get("price") as string) * 100
  );
  const comparePrice = formData.get("comparePrice") as string;
  const comparePriceInCents = comparePrice
    ? Math.round(parseFloat(comparePrice) * 100)
    : null;
  const categoryId = formData.get("categoryId") as string;
  const material = (formData.get("material") as string) || null;
  const isGlow = formData.get("isGlow") === "on";
  const inStock = formData.get("inStock") === "on";
  const isMadeToOrder = formData.get("isMadeToOrder") === "on";
  const metaTitle = (formData.get("metaTitle") as string) || null;
  const metaDesc = (formData.get("metaDesc") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string) || null;

  const slug = slugify(name, { lower: true, strict: true });

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      priceInCents,
      comparePriceInCents,
      categoryId,
      material,
      isGlow,
      inStock,
      isMadeToOrder,
      metaTitle,
      metaDesc,
    },
  });

  if (imageUrl) {
    const existing = await prisma.productImage.findFirst({
      where: { productId: id, isPrimary: true },
    });
    if (existing) {
      await prisma.productImage.update({
        where: { id: existing.id },
        data: { url: imageUrl, cloudinaryId: imageUrl },
      });
    } else {
      await prisma.productImage.create({
        data: {
          productId: id,
          url: imageUrl,
          cloudinaryId: imageUrl,
          isPrimary: true,
          order: 0,
        },
      });
    }
  }

  revalidateTag("products", "max");
  redirect(`/admin/products`);
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidateTag("products", "max");
  redirect("/admin/products");
}

export async function toggleProductStock(id: string, inStock: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { inStock } });
  revalidateTag("products", "max");
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: string) {
  const adminUserId = await requireAdmin();

  const [order] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: status as never },
      include: { items: { select: { nameSnapshot: true, quantity: true } } },
    }),
    prisma.adminAction.create({
      data: {
        adminUserId,
        action: `status_changed_to_${status}`,
        entityType: "Order",
        entityId: orderId,
        orderId,
      },
    }),
  ]);

  if (status === "SHIPPED") {
    const email = order.guestEmail ?? (
      order.customerId
        ? (await prisma.customer.findUnique({ where: { id: order.customerId }, select: { email: true } }))?.email
        : null
    );
    if (email) {
      const shippingAddress = order.shippingLine1
        ? [order.shippingLine1, order.shippingLine2, `${order.shippingCity}, ${order.shippingState} ${order.shippingZip}`]
            .filter(Boolean).join(", ")
        : undefined;
      try {
        await getResend().emails.send({
          from: "Morgan 3D Prints <orders@morgan3dokc.com>",
          to: email,
          subject: `Your order #${orderId.slice(-8).toUpperCase()} has shipped!`,
          react: ShippingNotificationEmail({
            orderId,
            items: order.items.map((i) => ({ name: i.nameSnapshot, quantity: i.quantity })),
            shippingAddress,
          }),
        });
      } catch (err) {
        console.error("[updateOrderStatus] failed to send shipping email:", err);
      }
    }
  }
}

export async function addOrderNote(orderId: string, note: string) {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { notes: note } });
}

// ─── Whatnot Sync ─────────────────────────────────────────────────────────────
// Whatnot has no public product API, so items are read out of the seller's own
// shop page by a browser bookmarklet (see /admin/whatnot-sync) and posted back
// here. Only Buy It Now listings are ever sent (the bookmarklet filters out
// auctions itself). Products are matched to existing rows by slug (same slug
// convention createProduct/updateProduct already use) so re-running the sync
// updates rather than duplicates. Items no longer present on Whatnot are
// marked out of stock rather than deleted, so order history / reviews tied to
// a discontinued item are preserved.

export type WhatnotSyncItem = {
  whatnotId: string;
  name: string;
  priceDollars: string;
  qty: number | null;
  image: string;
};

export type WhatnotSyncResult = {
  created: number;
  updated: number;
  hiddenCount: number;
};

const WHATNOT_CATEGORY_SLUG = "whatnot-finds";

export async function syncWhatnotProducts(
  items: WhatnotSyncItem[]
  ): Promise<WhatnotSyncResult> {
  await requireAdmin();
  
  if (!Array.isArray(items) || items.length === 0) {
    return { created: 0, updated: 0, hiddenCount: 0 };
  }
  
  const category = await prisma.category.upsert({
    where: { slug: WHATNOT_CATEGORY_SLUG },
    update: {},
    create: { name: "Whatnot Finds", slug: WHATNOT_CATEGORY_SLUG },
  });
  
  let created = 0;
  let updated = 0;
  const syncedSlugs: string[] = [];
  
  for (const item of items) {
    const name = (item.name ?? "").trim();
    const priceInCents = Math.round(parseFloat(item.priceDollars) * 100);
    if (!name || !Number.isFinite(priceInCents)) continue;
    
    const slug = slugify(name, { lower: true, strict: true });
    syncedSlugs.push(slug);
    
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, images: { where: { isPrimary: true }, select: { id: true } } },
    });
    
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { name, priceInCents, inStock: true, categoryId: category.id },
      });
      if (item.image) {
        if (existing.images[0]) {
          await prisma.productImage.update({
            where: { id: existing.images[0].id },
            data: { url: item.image, cloudinaryId: item.image },
          });
        } else {
          await prisma.productImage.create({
            data: { productId: existing.id, url: item.image, cloudinaryId: item.image, isPrimary: true, order: 0 },
          });
        }
      }
      updated++;
    } else {
      await prisma.product.create({
        data: {
          name,
          slug,
          description: `Available on Whatnot — @morgan_3d_prints. Listing ID ${item.whatnotId}.`,
          priceInCents,
          categoryId: category.id,
          inStock: true,
          ...(item.image
              ? { images: { create: { url: item.image, cloudinaryId: item.image, isPrimary: true, order: 0 } } }
              : {}),
        },
      });
      created++;
    }
  }
  
  const { count: hiddenCount } = await prisma.product.updateMany({
    where: { categoryId: category.id, slug: { notIn: syncedSlugs }, inStock: true },
    data: { inStock: false },
  });
  
  revalidateTag("products", "max");
  
  return { created, updated, hiddenCount };
}

// ─── Categories ───────────────────────────────────────────────────────────────

// Catch-all bucket products land in when their category is deleted, or when
// they're unchecked from a category on its "manage products" page. Created
// lazily the first time it's actually needed.
const UNCATEGORIZED_SLUG = "uncategorized";

async function getOrCreateUncategorizedCategory() {
  return prisma.category.upsert({
    where: { slug: UNCATEGORIZED_SLUG },
    update: {},
    create: { name: "Uncategorized", slug: UNCATEGORIZED_SLUG },
  });
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const isAdult = formData.get("isAdult") === "on";
  const slug = slugify(name, { lower: true, strict: true });

  await prisma.category.create({ data: { name, slug, isAdult } });
  revalidateTag("products", "max");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  const category = await prisma.category.findUnique({
    where: { id },
    select: { slug: true },
  });
  // Not found, or someone tried to delete the catch-all bucket itself —
  // there'd be nowhere left for its products to land.
  if (!category || category.slug === UNCATEGORIZED_SLUG) {
    redirect("/admin/categories");
  }

  const productCount = await prisma.product.count({ where: { categoryId: id } });

  if (productCount > 0) {
    const fallback = await getOrCreateUncategorizedCategory();
    await prisma.$transaction([
      prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: fallback.id } }),
      prisma.category.delete({ where: { id } }),
    ]);
  } else {
    await prisma.category.delete({ where: { id } });
  }

  revalidateTag("products", "max");
  redirect("/admin/categories");
}

// Bulk-move a set of products (selected as checkboxes on the Products list)
// into one category at once.
export async function bulkAssignCategory(formData: FormData) {
  await requireAdmin();

  const productIds = formData.getAll("productIds").map(String).filter(Boolean);
  const categoryId = formData.get("categoryId") as string;
  if (productIds.length === 0 || !categoryId) {
    redirect("/admin/products");
  }

  await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: { categoryId },
  });

  revalidateTag("products", "max");
  redirect("/admin/products");
}

// Manage which products belong to one category from that category's own
// page: anything checked gets moved into this category; anything that was
// in this category and got unchecked moves to Uncategorized instead of
// being left in a broken state (every product must have a category).
export async function updateCategoryProducts(categoryId: string, formData: FormData) {
  await requireAdmin();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { slug: true },
  });
  if (!category) redirect("/admin/categories");

  const checkedIds = new Set(formData.getAll("productIds").map(String));

  const currentlyIn = await prisma.product.findMany({
    where: { categoryId },
    select: { id: true },
  });
  const currentlyInIds = new Set<string>(currentlyIn.map((p) => p.id));

  const toAdd = [...checkedIds].filter((id) => !currentlyInIds.has(id));
  const toRemove = [...currentlyInIds].filter((id) => !checkedIds.has(id));

  const ops = [];
  if (toAdd.length > 0) {
    ops.push(
      prisma.product.updateMany({ where: { id: { in: toAdd } }, data: { categoryId } })
    );
  }
  // Only move products out if this isn't the catch-all bucket itself —
  // there's nowhere further to send them.
  if (toRemove.length > 0 && category.slug !== UNCATEGORIZED_SLUG) {
    const fallback = await getOrCreateUncategorizedCategory();
    ops.push(
      prisma.product.updateMany({ where: { id: { in: toRemove } }, data: { categoryId: fallback.id } })
    );
  }
  if (ops.length > 0) {
    await prisma.$transaction(ops);
  }

  revalidateTag("products", "max");
  redirect("/admin/categories");
}

// ─── Discount Codes ───────────────────────────────────────────────────────────

export async function createDiscount(formData: FormData) {
  await requireAdmin();

  const code = (formData.get("code") as string).toUpperCase().trim();
  const type = formData.get("type") as string;
  const value = parseInt(formData.get("value") as string, 10);
  const usageLimit = formData.get("usageLimit")
    ? parseInt(formData.get("usageLimit") as string, 10)
    : null;
  const expiresAt = formData.get("expiresAt")
    ? new Date(formData.get("expiresAt") as string)
    : null;

  await prisma.discountCode.create({
    data: { code, type, value, usageLimit, expiresAt, isActive: true },
  });

  redirect("/admin/discounts");
}

export async function toggleDiscount(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.discountCode.update({ where: { id }, data: { isActive } });
}

export async function deleteDiscount(id: string) {
  await requireAdmin();
  await prisma.discountCode.delete({ where: { id } });
  redirect("/admin/discounts");
}

// ─── Custom Requests ──────────────────────────────────────────────────────────

export async function updateCustomRequest(
  id: string,
  status: string,
  adminNotes: string
) {
  await requireAdmin();
  await prisma.customRequest.update({
    where: { id },
    data: { status, adminNotes },
  });
}
