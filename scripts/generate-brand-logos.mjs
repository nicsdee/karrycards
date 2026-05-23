import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "public", "brand-logos");
fs.mkdirSync(outDir, { recursive: true });

const simpleIconFiles = {
  airbnb: "airbnb",
  apple: "apple",
  appletv: "apple-tv",
  bathandbodyworks: "bath-body-works",
  bestbuy: "best-buy",
  burgerking: "burger-king",
  chickfila: "chick-fil-a",
  chipotle: "chipotle",
  costco: "costco",
  cvshealth: "cvs-pharmacy",
  delta: "delta-air-lines",
  discord: "discord-nitro",
  disneyplus: "disney-plus",
  dominos: "dominos",
  doordash: "doordash",
  dunkin: "dunkin",
  ea: "ea-play",
  ebay: "ebay",
  epicgames: "epic-games",
  etsy: "etsy",
  expedia: "expedia",
  fandango: "fandango",
  fortnite: "fortnite",
  gamestop: "gamestop",
  glossier: "glossier",
  grubhub: "grubhub",
  max: "hbo-max",
  homedepot: "home-depot",
  hotelsdotcom: "hotels-com",
  hulu: "hulu",
  ikea: "ikea",
  instacart: "instacart",
  krispykreme: "krispy-kreme",
  leagueoflegends: "league-of-legends",
  lowes: "lowes",
  lyft: "lyft",
  mcdonalds: "mcdonalds",
  minecraft: "minecraft",
  netflix: "netflix",
  nike: "nike",
  nintendo: "nintendo",
  nordstrom: "nordstrom",
  paramountplus: "paramount-plus",
  playstation: "playstation",
  razer: "razer",
  roblox: "roblox",
  sephora: "sephora",
  sling: "sling-tv",
  spotify: "spotify",
  starbucks: "starbucks",
  steam: "steam",
  subway: "subway",
  tacobell: "taco-bell",
  target: "target",
  thecoffeebeanandtealeaf: "the-coffee-bean-tea-leaf",
  timhortons: "tim-hortons",
  twitch: "twitch",
  uber: "uber",
  ubereats: "uber-eats",
  unitedairlines: "united-airlines",
  ulta: "ulta-beauty",
  visa: "visa",
  walgreens: "walgreens",
  xbox: "xbox",
  youtube: "youtube"
};

const logoColors = {
  apple: "111827",
  appletv: "ffffff",
  bestbuy: "0046be",
  doordash: "ffffff",
  ebay: "ffffff",
  hulu: "111111",
  netflix: "e50914",
  playstation: "ffffff",
  razer: "44d62c",
  starbucks: "ffffff",
  steam: "ffffff",
  target: "ffffff",
  visa: "ffffff",
  xbox: "ffffff"
};

for (const [simpleSlug, fileSlug] of Object.entries(simpleIconFiles)) {
  const sourcePath = path.join(root, "node_modules", "simple-icons", "icons", `${simpleSlug}.svg`);
  if (!fs.existsSync(sourcePath)) continue;

  const color = logoColors[simpleSlug] || "ffffff";
  const svg = fs
    .readFileSync(sourcePath, "utf8")
    .replace(/<title>.*?<\/title>/, "")
    .replace("<svg ", `<svg fill="#${color}" `)
    .replace(/ role="img"/, "")
    .replace(/ aria-label="[^"]*"/, "");

  fs.writeFileSync(path.join(outDir, `${fileSlug}.svg`), svg);
}

const customLogos = {
  "amazon.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 170"><text x="0" y="82" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="82" font-weight="800">amazon</text><path d="M105 122c73 38 171 32 235-12" fill="none" stroke="#ff9900" stroke-width="14" stroke-linecap="round"/><path d="M318 116l43-18-11 43" fill="none" stroke="#ff9900" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "amazon-prime.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 180"><text x="0" y="82" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="82" font-weight="800">amazon</text><text x="326" y="132" fill="#00a8e1" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="800">prime</text><path d="M105 122c73 38 171 32 235-12" fill="none" stroke="#ff9900" stroke-width="14" stroke-linecap="round"/><path d="M318 116l43-18-11 43" fill="none" stroke="#ff9900" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "walmart.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 140"><text x="0" y="92" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="86" font-weight="800">Walmart</text><g fill="#ffc220" transform="translate(420 17)"><rect x="45" y="0" width="16" height="42" rx="8"/><rect x="45" y="68" width="16" height="42" rx="8"/><rect x="45" y="0" width="16" height="42" rx="8" transform="rotate(60 53 55)"/><rect x="45" y="0" width="16" height="42" rx="8" transform="rotate(120 53 55)"/><rect x="45" y="0" width="16" height="42" rx="8" transform="rotate(240 53 55)"/><rect x="45" y="0" width="16" height="42" rx="8" transform="rotate(300 53 55)"/></g></svg>`,
  "razer-gold.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 180"><defs><radialGradient id="coinFace" cx="35%" cy="28%" r="72%"><stop offset="0" stop-color="#fff7b8"/><stop offset="0.36" stop-color="#f8c94c"/><stop offset="0.7" stop-color="#c88712"/><stop offset="1" stop-color="#744608"/></radialGradient><linearGradient id="coinEdge" x1="0" x2="1"><stop offset="0" stop-color="#7a4708"/><stop offset="0.5" stop-color="#ffe27b"/><stop offset="1" stop-color="#9b5b09"/></linearGradient></defs><circle cx="72" cy="88" r="56" fill="url(#coinEdge)"/><circle cx="72" cy="88" r="45" fill="url(#coinFace)"/><path d="M91 55 51 88h28l-34 38 51-45H69z" fill="#9d5b08"/><text x="150" y="78" fill="#45d62d" font-family="Arial, Helvetica, sans-serif" font-size="50" font-weight="700" letter-spacing="8">RAZER</text><text x="150" y="132" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="500">Gold</text></svg>`
};

for (const [fileName, svg] of Object.entries(customLogos)) {
  fs.writeFileSync(path.join(outDir, fileName), svg);
}

const localNameOverrides = {
  "amazon prime": "amazon-prime",
  "apple tv+": "apple-tv",
  "bath & body works": "bath-body-works",
  "best buy": "best-buy",
  "burger king": "burger-king",
  "chick-fil-a": "chick-fil-a",
  "cvs pharmacy": "cvs-pharmacy",
  "delta air lines": "delta-air-lines",
  "discord nitro": "discord-nitro",
  "disney+": "disney-plus",
  "domino's": "dominos",
  "dunkin'": "dunkin",
  "ea play": "ea-play",
  "epic games": "epic-games",
  "hbo max": "hbo-max",
  "home depot": "home-depot",
  "hotels.com": "hotels-com",
  "krispy kreme": "krispy-kreme",
  "league of legends": "league-of-legends",
  "lowe's": "lowes",
  "mcdonald's": "mcdonalds",
  "paramount+": "paramount-plus",
  "razer gold": "razer-gold",
  "sling tv": "sling-tv",
  "taco bell": "taco-bell",
  "the coffee bean & tea leaf": "the-coffee-bean-tea-leaf",
  "tim hortons": "tim-hortons",
  "uber eats": "uber-eats",
  "ulta beauty": "ulta-beauty",
  "xbox game pass": "xbox"
};

function localFileSlug(brand) {
  const key = brand.toLowerCase();
  return (
    localNameOverrides[key] ||
    key.replaceAll("&", "and").replaceAll("+", "plus").replaceAll("'", "").replaceAll(".", "-").replaceAll(" ", "-")
  );
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function wordmarkSvg(brand, color) {
  const text = escapeXml(brand);
  const textColor = ["#ffbc0d", "#ffc72c", "#f5b6c7"].includes(color.toLowerCase()) ? "#111827" : "#ffffff";
  const subColor = textColor === "#ffffff" ? "#ffffff" : "#111827";
  const subOpacity = textColor === "#ffffff" ? "0.82" : "0.76";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 180"><rect width="620" height="180" rx="0" fill="transparent"/><text x="0" y="86" fill="${textColor}" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="850">${text}</text><text x="2" y="132" fill="${subColor}" opacity="${subOpacity}" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="650">Gift Card</text></svg>`;
}

const dataSource = fs.readFileSync(path.join(root, "app", "data.ts"), "utf8");
const cardPattern = /card\("([^"]+)",\s*"[^"]+",\s*"(#[0-9a-fA-F]{6})"/g;
for (const match of dataSource.matchAll(cardPattern)) {
  const [, brand, color] = match;
  const fileName = `${localFileSlug(brand)}.svg`;
  const filePath = path.join(outDir, fileName);

  if (!fs.existsSync(filePath) || fs.readFileSync(filePath, "utf8").includes('viewBox="0 0 620 180"')) {
    fs.writeFileSync(filePath, wordmarkSvg(brand, color));
  }
}

console.log(`Generated ${fs.readdirSync(outDir).length} brand logo files.`);
