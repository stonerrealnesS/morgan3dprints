import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function AddressesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const customer = await prisma.customer.findUnique({
    where: { clerkUserId: userId },
    include: { addresses: { orderBy: { isDefault: "desc" } } },
  });

  async function addAddress(formData: FormData) {
    "use server";
    const { userId: uid } = await auth();
    if (!uid) return;

    const cust = await prisma.customer.findUnique({ where: { clerkUserId: uid } });
    if (!cust) return;

    const setDefault = formData.get("isDefault") === "on";

    if (setDefault) {
      await prisma.address.updateMany({ where: { customerId: cust.id }, data: { isDefault: false } });
    }

    await prisma.address.create({
      data: {
        customerId: cust.id,
        line1: formData.get("line1") as string,
        line2: (formData.get("line2") as string) || null,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        zip: formData.get("zip") as string,
        country: "US",
        isDefault: setDefault,
      },
    });
    revalidatePath("/account/addresses");
  }

  async function deleteAddress(id: string) {
    "use server";
    const { userId: uid } = await auth();
    if (!uid) return;
    const cust = await prisma.customer.findUnique({ where: { clerkUserId: uid } });
    if (!cust) return;
    await prisma.address.deleteMany({ where: { id, customerId: cust.id } });
    revalidatePath("/account/addresses");
  }

  async function setDefault(id: string) {
    "use server";
    const { userId: uid } = await auth();
    if (!uid) return;
    const cust = await prisma.customer.findUnique({ where: { clerkUserId: uid } });
    if (!cust) return;
    await prisma.address.updateMany({ where: { customerId: cust.id }, data: { isDefault: false } });
    await prisma.address.update({ where: { id }, data: { isDefault: true } });
    revalidatePath("/account/addresses");
  }

  const addresses = customer?.addresses ?? [];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="text-sm" style={{ color: "#8888aa" }}>← Account</Link>
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Saved Addresses</h1>
      </div>

      {/* Address list */}
      {addresses.length > 0 && (
        <div className="space-y-3 mb-8">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-xl p-5"
              style={{
                background: "#0d0d14",
                border: `1px solid ${addr.isDefault ? "rgba(168,85,247,0.4)" : "#1e1e30"}`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  {addr.isDefault && (
                    <span className="text-xs px-2 py-0.5 rounded mb-2 inline-block" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
                      Default
                    </span>
                  )}
                  <p className="text-sm text-[#f0f0ff]">{addr.line1}</p>
                  {addr.line2 && <p className="text-sm text-[#f0f0ff]">{addr.line2}</p>}
                  <p className="text-sm text-[#f0f0ff]">{addr.city}, {addr.state} {addr.zip}</p>
                  <p className="text-sm" style={{ color: "#8888aa" }}>{addr.country}</p>
                </div>
                <div className="flex gap-3">
                  {!addr.isDefault && (
                    <form action={setDefault.bind(null, addr.id)}>
                      <button type="submit" className="text-xs" style={{ color: "#a855f7" }}>Set default</button>
                    </form>
                  )}
                  <form action={deleteAddress.bind(null, addr.id)}>
                    <button type="submit" className="text-xs" style={{ color: "#ef4444" }}>Remove</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add address form */}
      <div className="rounded-xl p-6" style={{ background: "#0d0d14", border: "1px solid #1e1e30" }}>
        <h2 className="font-semibold text-[#f0f0ff] mb-5">Add New Address</h2>
        <form action={addAddress} className="space-y-4">
          <Field label="Street Address" name="line1" required placeholder="123 Main St" />
          <Field label="Apt / Suite (optional)" name="line2" placeholder="Apt 4B" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" name="city" required />
            <Field label="State" name="state" required placeholder="OK" maxLength={2} />
          </div>
          <Field label="ZIP Code" name="zip" required placeholder="73101" />
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#8888aa" }}>
            <input type="checkbox" name="isDefault" className="accent-purple-500 w-4 h-4" />
            Set as default address
          </label>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
          >
            Save Address
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "#8888aa" }}>{label}</label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-[#f0f0ff] outline-none focus:ring-1 focus:ring-[#a855f7]"
        style={{ background: "#13131e", border: "1px solid #1e1e30" }}
        {...rest}
      />
    </div>
  );
}
