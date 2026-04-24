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

// ─── Categories ───────────────────────────────────────────────────────────────

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
  await prisma.category.delete({ where: { id } });
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
