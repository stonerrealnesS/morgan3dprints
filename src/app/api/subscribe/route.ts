import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY ?? "");
    await resend.contacts.create({
      email,
      audienceId: process.env.RESEND_AUDIENCE_ID ?? "",
      unsubscribed: false,
    });
  } catch (err) {
    console.error("[subscribe]", err);
  }

  return NextResponse.json({ ok: true });
}
