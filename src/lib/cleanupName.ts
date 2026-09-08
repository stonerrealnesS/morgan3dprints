// Normalizes the raw, shouty product names that come out of Whatnot listings
// ("20 Pack of Jeep Ducks. YOU PICK THEM!!!") into something that reads well
// on a storefront and in Google search results, without rewriting the actual
// content of the name. This only touches formatting:
//   - collapses runs of repeated punctuation ("!!!" -> "!", "???" -> "?")
//   - collapses repeated whitespace
//   - downcases ALL-CAPS words (3+ letters) to Capitalized case, except a
//     small allowlist of real abbreviations/material codes that should stay
//     uppercase (OKC, DIY, LED, PLA, ABS, PETG, TPU, USA, UK, ATV, RV, TV, ID)
//
// It deliberately does NOT rewrite word choice, add/remove words, or touch
// numbers — this is a formatting pass, not a copywriter. Real copywriting
// (real descriptions, better titles for the products that actually matter)
// is a separate, human-reviewed pass.

const KEEP_UPPER = new Set([
  "OKC", "DIY", "LED", "PLA", "ABS", "PETG", "TPU", "USA", "UK",
  "ATV", "RV", "TV", "ID", "3D", "OK",
]);

export function cleanProductName(rawName: string): string {
  let name = rawName;

  // Collapse runs of the same punctuation mark down to one.
  name = name.replace(/([!?.,])\1+/g, "$1");

  // Collapse repeated whitespace and trim.
  name = name.replace(/\s+/g, " ").trim();

  // Downcase shouty ALL-CAPS words, preserving the allowlist.
  name = name.replace(/\b[A-Z]{3,}\b/g, (word) => {
    if (KEEP_UPPER.has(word)) return word;
    return word[0] + word.slice(1).toLowerCase();
  });

  return name;
}

/**
 * True if cleaning the name would actually change anything — used to filter
 * the preview report down to just the products that would be touched.
 */
export function needsCleanup(rawName: string): boolean {
  return cleanProductName(rawName) !== rawName;
}
