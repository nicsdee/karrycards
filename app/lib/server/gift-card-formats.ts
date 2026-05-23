import { randomBytes } from "node:crypto";

const brandMasks: Record<string, number[]> = {
  amazon: [4, 6, 4, 4],
  "amazon prime": [4, 6, 4, 4],
  apple: [4, 4, 4, 4],
  netflix: [4, 4, 4, 4],
  playstation: [4, 4, 4],
  razer: [4, 4, 4, 4],
  "razer gold": [4, 4, 4, 4],
  roblox: [4, 4, 4, 4],
  steam: [5, 5, 5],
  target: [4, 4, 4, 4],
  walmart: [4, 4, 4, 4],
  xbox: [5, 5, 5, 5, 5],
  "xbox game pass": [5, 5, 5, 5, 5]
};

function testCodeLength(brand: string) {
  return (brandMasks[brand.toLowerCase()] || [4, 4, 4, 4]).reduce((sum, size) => sum + size, 0);
}

export function generateTestGiftCardCode(brand: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(testCodeLength(brand));

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function formatGiftCardCode(brand: string, code?: string) {
  if (!code) return "";
  const cleaned = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!cleaned) return code;

  const mask = brandMasks[brand.toLowerCase()] || [4, 4, 4, 4];
  const parts: string[] = [];
  let cursor = 0;

  for (const size of mask) {
    const part = cleaned.slice(cursor, cursor + size);
    if (!part) break;
    parts.push(part);
    cursor += size;
  }

  if (cursor < cleaned.length) parts.push(cleaned.slice(cursor));
  return parts.join("-");
}
