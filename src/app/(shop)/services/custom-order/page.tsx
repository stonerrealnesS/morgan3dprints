import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { CustomRequestEmail } from "@/emails/CustomRequestEmail";

export const metadata: Metadata = {
  title: "Custom Order — Morgan 3D Prints",
  description: "Request a fully custom 3D printed item. Submit your idea, file, or reference and we'll provide a quote.",
};

async function submitCustomOrder(formData: FormData) {
  "use server";

  const type = formData.get("type") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const description = formData.get("description") as string;
  const fileUrls: string[] = [];

  const rawUrls = formData.get("fileUrls") as string;
  if (rawUrls) {
    rawUrls.split("\n").forEach((u) => {
      const trimmed = u.trim();
      if (trimmed) fileUrls.push(trimmed);
    });
  }

  await prisma.customRequest.create({
    data: { type, name, email, phone, description, fileUrls, status: "new" },
  });

  try {
    await new Resend(process.env.RESEND_API_KEY ?? "").emails.send({
      from: "Morgan 3D Prints <orders@morgan3dokc.com>",
      to: email,
      subject: "We got your custom request!",
      react: CustomRequestEmail({ name, type, description }),
    });
  } catch (err) {
    console.error("[submitCustomOrder] failed to send email:", err);
  }

  redirect("/services/custom-order/submitted");
}

export default function CustomOrderPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-mono mb-3" style={{ color: "#22d3ee" }}>Custom Orders</p>
        <h1 className="text-4xl font-extrabold text-[#f0f0ff] leading-tight mb-4">
          Got something in mind?
        </h1>
        <p className="text-lg" style={{ color: "#8888aa" }}>
          Tell us what you need and we&apos;ll bring it to life. We handle everything from
          one-off gifts to small production runs.
        </p>
      </div>

      {/* Callout boxes */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: "Quote in 24h", icon: "⚡" },
          { label: "Any filament", icon: "🎨" },
          { label: "OKC pickup free", icon: "🏪" },
        ].map(({ label, icon }) => (
          <div
            key={label}
            className="rounded-xl p-4 text-center"
            style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}
          >
            <span className="text-2xl block mb-1">{icon}</span>
            <p className="text-xs font-medium" style={{ color: "#8888aa" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <form action={submitCustomOrder} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>Request Type</label>
          <select
            name="type"
            required
            className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
            style={{ background: "#13131e", border: "1px solid #1e1e30" }}
          >
            <option value="">Select a type…</option>
            <option value="custom-design">Custom Design (I have an idea)</option>
            <option value="file-print">Print My File (I have an STL/3MF)</option>
            <option value="replica">Replica / Reference Match</option>
            <option value="bulk">Bulk Order</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Your Name" name="name" required />
          <Field label="Email Address" name="email" type="email" required />
        </div>

        <Field label="Phone (optional)" name="phone" type="tel" />

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>
            Describe what you want
          </label>
          <textarea
            name="description"
            required
            rows={6}
            placeholder="Be as detailed as possible — dimensions, colors, quantities, use case, deadline…"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] resize-y outline-none focus:ring-1 focus:ring-[#a855f7]"
            style={{ background: "#13131e", border: "1px solid #1e1e30" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>
            Reference / File URLs (optional)
          </label>
          <textarea
            name="fileUrls"
            rows={3}
            placeholder="Paste Google Drive, Dropbox, or Thingiverse links — one per line"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] resize-y outline-none focus:ring-1 focus:ring-[#a855f7]"
            style={{ background: "#13131e", border: "1px solid #1e1e30" }}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all"
          style={{
            background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
            boxShadow: "0 0 20px rgba(168,85,247,0.35)",
          }}
        >
          Submit Request
        </button>

        <p className="text-xs text-center" style={{ color: "#8888aa" }}>
          We&apos;ll email you a quote within 24 hours. No commitment required.
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
        style={{ background: "#13131e", border: "1px solid #1e1e30" }}
      />
    </div>
  );
}
