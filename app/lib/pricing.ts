import { GiftCard } from "../data";

const safeBrands = new Set(["amazon", "apple", "playstation", "visa"]);
const sweetSpotBrands = new Set(["walmart", "uber", "uber eats", "starbucks", "airbnb", "nike"]);

export function discountPercentForCard(card: Pick<GiftCard, "brand"> & { category?: string }) {
  const brand = card.brand.toLowerCase();

  if (safeBrands.has(brand) || brand.includes("apple") || brand.includes("playstation")) return 5.12;
  if (sweetSpotBrands.has(brand)) return 8.7;
  if (card.category === "Gaming") return 5.4;
  if (card.category === "Retail") return 6.2;
  if (card.category === "Travel" || card.category === "Food Delivery") return 8.2;
  return 4.6;
}

export function discountedAmount(amount: number, percent: number) {
  return Number((amount * (1 - percent / 100)).toFixed(2));
}

export function discountedPriceForCard(card: Pick<GiftCard, "brand" | "category" | "price">) {
  return discountedAmount(card.price, discountPercentForCard(card));
}

export function quoteLine(input: Pick<GiftCard, "brand"> & { category?: string; amount: number; quantity: number }) {
  const percent = discountPercentForCard(input);
  const original = Number((input.amount * input.quantity).toFixed(2));
  const discounted = Number((discountedAmount(input.amount, percent) * input.quantity).toFixed(2));
  return {
    discount: Number((original - discounted).toFixed(2)),
    discounted,
    original,
    percent
  };
}

export function quoteCart<T extends Pick<GiftCard, "brand"> & { category?: string; amount: number; quantity: number }>(items: T[]) {
  const lines = items.map(quoteLine);
  const original = Number(lines.reduce((sum, line) => sum + line.original, 0).toFixed(2));
  const total = Number(lines.reduce((sum, line) => sum + line.discounted, 0).toFixed(2));
  const discount = Number((original - total).toFixed(2));
  return { discount, lines, original, total };
}
