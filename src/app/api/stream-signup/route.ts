import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

// Lightweight "notify me before the next Whatnot stream" signup. Reuses the
// existing CustomRequest table (type: "stream-alert") instead of adding a new
// model — this app's build doesn't run a migration step on deploy, so a new
// table wouldn't actually exist in production until someone ran one by hand.
// Reusing an existing, already-migrated table sidesteps that entirely.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    await prisma.customRequest.create({
      data: {
        type: "stream-alert",
        name: name || email.split("@")[0],
        email,
        description: "Wants to be notified before the next Whatnot livestream.",
        status: "new",
        fileUrls: [],
      },
    });

    try {
      await new Resend(process.env.RESEND_API_KEY ?? "").emails.send({
        from: "Morgan 3D Prints <orders@morgan3dokc.com>",
        to: email,
        subject: "You're on the list!",
        text: "Thanks for signing up — we'll let you know before the next Whatnot livestream goes live. In the meantime, check out the shop at https://www.morgan3dokc.com/shop",
      });
    } catch (err) {
      console.error("[stream-signup] confirmation email failed:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[stream-signup] error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
