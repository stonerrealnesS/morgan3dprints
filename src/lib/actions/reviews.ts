"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function submitReview(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const productId = formData.get("productId") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const body = (formData.get("body") as string).trim() || null;

  if (!productId || !rating || rating < 1 || rating > 5) {
    throw new Error("Invalid review data");
  }

  const customer = await prisma.customer.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });
  if (!customer) throw new Error("Customer not found");

  await prisma.review.upsert({
    where: { productId_customerId: { productId, customerId: customer.id } },
    create: { productId, customerId: customer.id, rating, body },
    update: { rating, body },
  });

  revalidateTag("products", "max");
}
