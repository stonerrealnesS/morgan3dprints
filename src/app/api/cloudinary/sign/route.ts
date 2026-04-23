import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  const { userId } = await auth();
  const adminIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!userId || !adminIds.includes(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const toSign = `timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET!}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  });
}
