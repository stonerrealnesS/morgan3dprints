import { extractWhatnotListing } from "@/lib/whatnot";

// Many products synced from Whatnot have only the placeholder sentence
// "Available on Whatnot, @morgan_3d_prints. Listing ID <id>." as their description.
// That text is useless (and points elsewhere) for search results, Google Shopping
// and Pinterest. These helpers return the real description when there is one and a
// short, factual fallback when there is not. Nothing is written to the database.
// The fallback only states things the owner has confirmed: 3D printed, layer lines
// and spool-to-spool color variation, USPS tracking, free shipping at $35.

const MIN_REAL_LENGTH = 15;

export function realDescription(description: string): string {
  const listing = extractWhatnotListing(description);
  const text = (listing ? listing.bodyText : description).trim();
  return text.length >= MIN_REAL_LENGTH ? text : "";
}

export function fallbackDescription(name: string): string {
  return (
    `${name}. 3D printed by Morgan 3D Prints. Each piece is 3D printed, so you may see fine layer ` +
    `lines up close, and colors can vary a little from spool to spool. Check the photos for size ` +
    `and color. Ships in the US with USPS tracking, and orders of $35 or more ship free.`
  );
}

// Full text for page body, structured data and feeds.
export function productDescription(name: string, description: string): string {
  return realDescription(description) || fallbackDescription(name);
}

// Short text for the search-result snippet (about 160 characters).
export function metaDescription(name: string, description: string): string {
  const real = realDescription(description);
  if (real) return real.slice(0, 160);
  return `${name}. 3D printed by Morgan 3D Prints. Ships in the US with USPS tracking, free over $35.`.slice(0, 160);
}
