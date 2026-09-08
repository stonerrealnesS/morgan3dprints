// Products created by the Whatnot sync (see syncWhatnotProducts in
// src/lib/actions/admin.ts) get a boilerplate line appended to their
// description: "Available on Whatnot — @morgan_3d_prints. Listing ID <id>."
// That <id> is exactly the path segment Whatnot uses for the listing
// (https://www.whatnot.com/listing/<id>) — it's scraped straight off the
// listing's own link by the sync bookmarklet. This pulls it back out so the
// product page can show a real link instead of printing the raw id as text.
const WHATNOT_SENTENCE_PATTERN =
  /Available on Whatnot — @morgan_3d_prints\. Listing ID ([\w+/=]+)\.\s*/;

export type WhatnotListing = {
  // The description with the auto-generated sentence removed, so it isn't
  // shown twice (once as plain text, once as the link below it). Whatever
  // else is in the description — notes added by hand before or after
  // syncing — is left in place.
  bodyText: string;
  listingUrl: string;
};

export function extractWhatnotListing(description: string): WhatnotListing | null {
  const match = description.match(WHATNOT_SENTENCE_PATTERN);
  if (!match) return null;

  return {
    bodyText: description.replace(match[0], "").trim(),
    listingUrl: `https://www.whatnot.com/listing/${match[1]}`,
  };
}
