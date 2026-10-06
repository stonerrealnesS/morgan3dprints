// Brand and character names the owner has not cleared a licence for. Products whose
// TITLE contains one are left out of the Google Shopping feed (they stay on the site).
// Over-inclusive on purpose: leaving a product out of Google is safe, including one
// that turned out to be a false match. Remove a term here once a licence check clears it.
export const BRAND_TERMS = [
  "rick & morty", "rick and morty", "betty boop", "one piece", "luffy", "pokemon", "pikachu",
  "garfield", "shrek", "scream", "ghostface", "spongebob", "square pants", "patrick star",
  "baby yoda", "grogu", "mandalorian", "star wars", "marvel", "dr. doom", "doomsday",
  "human torch", "fantastic four", "crash bandicoot", "resident evil", "umbrella corp",
  "fortnite", "matrix", "morpheus", "felix the cat", "blockbuster", "power ranger", "mario",
  "luigi", "zelda", "disney", "pixar", "mickey", "minnie", "batman", "superman", "spider-man",
  "spiderman", "hello kitty", "sonic", "minecraft", "nintendo", "simpsons", "looney",
  "bugs bunny", "naruto", "dragon ball", "goku", "harry potter", "hogwarts", "transformers",
  "hot wheels", "lego", "nike", "adidas", "jeep", "stranger things", "scooby", "flintstones",
  "teenage mutant", "ninja turtle", "care bear", "my little pony", "paw patrol", "bluey",
  "peppa", "avengers", "hulk", "iron man", "captain america", "thor", "deadpool", "wolverine",
  "joker", "harley quinn", "venom", "gundam", "evangelion", "jojo", "demon slayer",
  "attack on titan", "hunter x hunter", "one punch", "tom and jerry", "popeye", "rugrats",
  "chucky", "freddy", "jason voorhees", "michael myers", "pennywise", "terminator", "alien",
  "predator", "jurassic", "godzilla", "metallica", "nirvana", "grateful dead", "bob ross",
  "game of thrones", "walking dead", "breaking bad", "south park", "family guy", "futurama",
  "adventure time", "steven universe", "pac-man", "tetris", "atari", "playstation", "xbox",
  "among us", "fall guys", "roblox", "five nights", "fnaf", "sanrio", "kuromi", "stitch",
  "winnie", "tigger", "lion king", "frozen", "elsa", "moana", "toy story", "buzz lightyear",
  "monsters inc", "coca-cola", "pepsi", "budweiser", "harley", "john deere", "yeti", "stanley",
  "hydro flask", "lululemon", "gucci", "louis vuitton", "supreme", "bape",
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BRAND_RE = new RegExp(
  `(?<![a-z0-9])(?:${[...BRAND_TERMS].sort((a, b) => b.length - a.length).map(escape).join("|")})(?![a-z0-9])`,
  "i"
);

export function hasBrandTerm(text: string): boolean {
  return BRAND_RE.test(text);
}
