import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Only available in development
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Seed only available in development" }, { status: 403 });
  }

  // ─── Categories ──────────────────────────────────────────────────────────────

  const categoryData = [
    { name: "Keychains", slug: "keychains", isAdult: false },
    { name: "Glow in the Dark", slug: "glow-in-the-dark", isAdult: false },
    { name: "Custom Orders", slug: "custom", isAdult: false },
    { name: "Fidgets", slug: "fidgets", isAdult: false },
    { name: "Services", slug: "services", isAdult: false },
    { name: "Accessories", slug: "accessories", isAdult: false },
  ];

  const categories = await Promise.all(
    categoryData.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        create: cat,
        update: { name: cat.name, isAdult: cat.isAdult },
      })
    )
  );

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  // ─── Products ─────────────────────────────────────────────────────────────────

  const productData = [
    // Keychains
    {
      name: "Neon Portal Keychain",
      slug: "neon-portal-keychain",
      description:
        "A swirling portal design printed in vivid neon filament. Lightweight, durable, and endlessly stylish. The perfect everyday carry accent that shows off your love of sci-fi.",
      priceInCents: 799,
      categorySlug: "keychains",
      material: "PLA+",
      isGlow: false,
      inStock: true,
      isMadeToOrder: false,
    },
    {
      name: "Skull Charm Keychain",
      slug: "skull-charm-keychain",
      description:
        "Bold skull design with fine surface detail. Printed in matte black PETG for a premium look and feel. A statement piece for keys, bags, or anywhere you want a little edge.",
      priceInCents: 849,
      categorySlug: "keychains",
      material: "PETG",
      isGlow: false,
      inStock: true,
      isMadeToOrder: false,
    },
    {
      name: "Custom Name Keychain",
      slug: "custom-name-keychain",
      description:
        "Personalized keychain with your name or short text in a bold font. Choose from multiple filament colors. Makes a great gift — order with the name in the notes.",
      priceInCents: 999,
      categorySlug: "keychains",
      material: "PLA+",
      isGlow: false,
      inStock: true,
      isMadeToOrder: true,
    },

    // Glow in the Dark
    {
      name: "Glow Star Ornament",
      slug: "glow-star-ornament",
      description:
        "Five-pointed geometric star that charges under light and glows a soft blue-green in the dark. Hang it anywhere you want a little cosmic magic at night.",
      priceInCents: 1299,
      categorySlug: "glow-in-the-dark",
      material: "Glow PLA",
      isGlow: true,
      inStock: true,
      isMadeToOrder: false,
    },
    {
      name: "Glow Moon Phase Set",
      slug: "glow-moon-phase-set",
      description:
        "Eight-piece moon phase wall set printed in photoluminescent filament. Arrange them in a row for a stunning display that glows all night. Includes mounting hardware.",
      priceInCents: 2499,
      categorySlug: "glow-in-the-dark",
      material: "Glow PLA",
      isGlow: true,
      inStock: true,
      isMadeToOrder: false,
    },
    {
      name: "Glow Mushroom Figurine",
      slug: "glow-mushroom-figurine",
      description:
        "Chunky cottagecore mushroom that soaks up light and emanates a warm glow in the dark. A cozy desk companion or shelf decoration for any aesthetic.",
      priceInCents: 1599,
      categorySlug: "glow-in-the-dark",
      material: "Glow PLA",
      isGlow: true,
      inStock: true,
      isMadeToOrder: false,
    },

    // Fidgets
    {
      name: "Infinity Cube Fidget",
      slug: "infinity-cube-fidget",
      description:
        "Compact 8-cube infinity fidget with smooth hinges. Folds and unfolds infinitely — a satisfying click-free way to keep your hands busy during meetings or study sessions.",
      priceInCents: 1199,
      categorySlug: "fidgets",
      material: "PLA+",
      isGlow: false,
      inStock: true,
      isMadeToOrder: false,
    },
    {
      name: "Hexagon Spinner Ring",
      slug: "hexagon-spinner-ring",
      description:
        "Wearable fidget spinner ring with a hexagonal outer band that spins freely. Available in multiple sizes. A discreet anxiety tool you can wear all day.",
      priceInCents: 899,
      categorySlug: "fidgets",
      material: "PETG",
      isGlow: false,
      inStock: true,
      isMadeToOrder: true,
    },

    // Accessories
    {
      name: "Cable Organizer Clip Set (4-pack)",
      slug: "cable-organizer-clip-set",
      description:
        "Keep your desk tangle-free with these slim cable management clips. Mounts under desks or along walls with 3M tape included. Set of 4 in matching color.",
      priceInCents: 699,
      categorySlug: "accessories",
      material: "PLA+",
      isGlow: false,
      inStock: true,
      isMadeToOrder: false,
    },
    {
      name: "Phone Stand — Adjustable",
      slug: "phone-stand-adjustable",
      description:
        "Sleek adjustable phone stand with multiple viewing angles. Fits any smartphone up to 6.7 inches. Grippy TPU pads prevent slipping. Great for video calls or media.",
      priceInCents: 1399,
      categorySlug: "accessories",
      material: "PLA+ / TPU",
      isGlow: false,
      inStock: true,
      isMadeToOrder: false,
    },

    // Services
    {
      name: "Print by the Hour",
      slug: "print-by-the-hour",
      description:
        "Need something printed but don't want to commit to a full product? Book print time by the hour. Bring your own file (STL/OBJ) or we can help you prep one. Filament included.",
      priceInCents: 2500,
      categorySlug: "services",
      material: "Your choice",
      isGlow: false,
      inStock: true,
      isMadeToOrder: true,
    },
    {
      name: "File Prep & Slicing Service",
      slug: "file-prep-slicing-service",
      description:
        "Have an idea but not a print-ready file? Send us your concept, sketch, or rough model and we'll prep, repair, and slice it for optimal print quality. Flat one-time fee.",
      priceInCents: 1500,
      categorySlug: "services",
      material: "Digital service",
      isGlow: false,
      inStock: true,
      isMadeToOrder: true,
    },
  ];

  const products = await Promise.all(
    productData.map((p) => {
      const { categorySlug, ...rest } = p;
      const categoryId = catMap[categorySlug];
      return prisma.product.upsert({
        where: { slug: rest.slug },
        create: { ...rest, categoryId },
        update: { ...rest, categoryId },
      });
    })
  );

  return NextResponse.json({
    success: true,
    seeded: {
      categories: categories.length,
      products: products.length,
    },
    categoryNames: categories.map((c) => c.name),
    productNames: products.map((p) => p.name),
  });
}
