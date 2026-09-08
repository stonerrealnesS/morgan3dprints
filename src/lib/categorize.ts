// Keyword-based category suggestions for the products that got dumped into
// the catch-all "Whatnot Finds" bucket by the sync bookmarklet. This is a
// best-guess heuristic, not a real classifier — it's meant to power an admin
// preview report that a human reviews before anything actually moves, not to
// silently re-sort the catalog on its own.
//
// Order matters: rules are checked top to bottom and the FIRST match wins, so
// more specific/product-type rules are listed ahead of broader material or
// effect words (e.g. a glow-in-the-dark fidget snake should land in Fidgets,
// not Glow in the Dark).

export type CategoryRule = {
  // Must match an existing Category.slug (or "ducks" — see note in the admin
  // action, which creates that category on first use since it doesn't exist
  // yet but the catalog clearly needs it).
  slug: string;
  label: string;
  patterns: RegExp[];
};

export const CATEGORIZATION_RULES: CategoryRule[] = [
  {
    slug: "ducks",
    label: "Ducks",
    patterns: [/\bduck(y|ies|s)?\b/i],
  },
  {
    slug: "keychains",
    label: "Keychains",
    patterns: [/key\s*chain/i, /key\s*ring/i, /key\s*fob/i, /key\s*tag/i],
  },
  {
    slug: "fidgets",
    label: "Fidgets",
    patterns: [
      /fidget/i,
      /\bspinner\b/i,
      /pop\s*it/i,
      /sensory/i,
      /articulated\s+snake/i,
      /snake\s+toy/i,
    ],
  },
  {
    slug: "accessories",
    label: "Accessories",
    patterns: [/\bpurse\b/i, /handbag/i, /\btote\b/i, /\bwallet\b/i, /\bclutch\b/i],
  },
  {
    slug: "for-the-ladies",
    label: "For the Ladies",
    patterns: [
      /earring/i,
      /bracelet/i,
      /necklace/i,
      /hair\s*clip/i,
      /\bjewelry\b/i,
      /makeup/i,
    ],
  },
  {
    slug: "at-the-house",
    label: "At the House",
    patterns: [
      /coaster/i,
      /\bvase\b/i,
      /planter/i,
      /\bplant\b/i,
      /candle/i,
      /firepit/i,
      /wall\s*art/i,
      /\bdecor\b/i,
      /\bashtray\b/i,
      /\bshelf\b/i,
      /\bjar\b/i,
    ],
  },
  {
    slug: "at-the-office",
    label: "At the Office",
    patterns: [
      /business\s*card/i,
      /pen\s*holder/i,
      /desk\s*organizer/i,
      /paperweight/i,
      /cable\s*(organizer|holder|clip)/i,
    ],
  },
  {
    slug: "man-cave",
    label: "Man Cave",
    patterns: [
      /whistle/i,
      /guitar\s*pick/i,
      /\bpoker\b/i,
      /skater/i,
      /laundry/i,
      /man\s*cave/i,
      /\bbeer\b/i,
      /\bcigar\b/i,
    ],
  },
  {
    slug: "glow-in-the-dark",
    label: "Glow in the Dark",
    patterns: [/glow[\s-]*in[\s-]*the[\s-]*dark/i, /glow\s*stripe/i, /\bluminous\b/i],
  },
  {
    slug: "tiny-things",
    label: "Tiny Things",
    patterns: [/\bmini\b/i, /\btiny\b/i],
  },
];

/**
 * Returns the best-guess category slug for a product name, or null if
 * nothing matched confidently — those get left in Whatnot Finds for a human
 * to sort by hand rather than forced into the wrong bucket.
 */
export function suggestCategorySlug(productName: string): string | null {
  for (const rule of CATEGORIZATION_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(productName))) {
      return rule.slug;
    }
  }
  return null;
}
