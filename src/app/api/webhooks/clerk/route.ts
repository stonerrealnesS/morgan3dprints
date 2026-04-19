import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) return new Response("Webhook secret missing", { status: 500 });

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: WebhookEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = event.data;
    const primaryEmail = email_addresses.find((e) => e.id === event.data.primary_email_address_id)?.email_address;

    if (primaryEmail) {
      await prisma.customer.upsert({
        where: { clerkUserId: id },
        create: { clerkUserId: id, email: primaryEmail, firstName: first_name ?? undefined, lastName: last_name ?? undefined },
        update: { email: primaryEmail, firstName: first_name ?? undefined, lastName: last_name ?? undefined },
      });
    }
  }

  return new Response("OK", { status: 200 });
}
