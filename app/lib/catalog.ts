import { API_BASE_URL } from "./api";
import { categories as fallbackCategories, giftCards as fallbackGiftCards, Category, GiftCard } from "../data";

type BackendCategory = {
  name: string;
  nav_label: string;
  slug: string;
  color: string;
  description: string;
};

type BackendGiftCard = {
  brand: string;
  product_name: string;
  slug: string;
  brand_color: string;
  description: string | null;
  base_price: string;
  compare_at_price: string | null;
  rating: string;
  review_count: number;
  badge: "Deal" | "Popular" | "New" | string;
  is_popular: boolean;
  category?: BackendCategory;
  denominations?: Array<{
    amount: string;
    is_active: boolean;
  }>;
};

export type CatalogResponse = {
  categories: Category[];
  giftCards: GiftCard[];
};

export function backendCardToGiftCard(card: BackendGiftCard): GiftCard {
  const category = card.category;
  const categoryName = category?.name || "Retail";
  const categorySlug = category?.slug || "retail";
  const denominations = (card.denominations || [])
    .filter((item) => item.is_active !== false)
    .map((item) => Number(item.amount))
    .filter((amount) => Number.isFinite(amount) && amount > 0);

  return {
    brand: card.brand,
    category: categoryName,
    categorySlug,
    color: card.brand_color,
    description: card.description || category?.description || "",
    productName: card.product_name,
    slug: card.slug,
    price: Number(card.base_price),
    compareAt: card.compare_at_price ? Number(card.compare_at_price) : undefined,
    denominations: denominations.length ? denominations : [Number(card.base_price)],
    rating: Number(card.rating),
    reviews: card.review_count,
    badge: card.badge === "Deal" || card.badge === "Popular" || card.badge === "New" ? card.badge : "Popular",
    popular: card.is_popular
  };
}

export function backendCategoryToCategory(category: BackendCategory): Category {
  return {
    name: category.name,
    navLabel: category.nav_label,
    slug: category.slug,
    color: category.color,
    description: category.description
  };
}

export async function fetchCatalog(): Promise<CatalogResponse> {
  if (!API_BASE_URL) return fallbackCatalog;

  const response = await fetch(`${API_BASE_URL}/catalog`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Catalog API failed.");
  const data = await response.json();

  return {
    categories: data.categories.map(backendCategoryToCategory),
    giftCards: data.gift_cards.map(backendCardToGiftCard)
  };
}

export async function fetchCategory(slug: string): Promise<{ category: Category; giftCards: GiftCard[] }> {
  if (!API_BASE_URL) {
    const category = fallbackCatalog.categories.find((item) => item.slug === slug) || fallbackCatalog.categories[0];
    return {
      category,
      giftCards: fallbackCatalog.giftCards.filter((card) => card.categorySlug === category.slug)
    };
  }

  const response = await fetch(`${API_BASE_URL}/categories/${slug}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Category API failed.");
  const data = await response.json();

  return {
    category: backendCategoryToCategory(data.category),
    giftCards: data.gift_cards.map((card: BackendGiftCard) => backendCardToGiftCard({ ...card, category: data.category }))
  };
}

export async function fetchGiftCard(slug: string): Promise<GiftCard> {
  if (!API_BASE_URL) {
    const card = fallbackCatalog.giftCards.find((item) => item.slug === slug);
    if (!card) throw new Error("Gift card not found.");
    return card;
  }

  const response = await fetch(`${API_BASE_URL}/gift-cards/${slug}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Gift card API failed.");
  const data = await response.json();

  return backendCardToGiftCard(data.gift_card);
}

export const fallbackCatalog: CatalogResponse = {
  categories: fallbackCategories,
  giftCards: fallbackGiftCards
};
