export type Category = {
  name: string;
  navLabel: string;
  slug: string;
  color: string;
  description: string;
};

export type GiftCard = {
  brand: string;
  category: string;
  categorySlug: string;
  color: string;
  description: string;
  productName: string;
  slug: string;
  price: number;
  compareAt?: number;
  denominations: number[];
  rating: number;
  reviews: number;
  badge: "Deal" | "Popular" | "New";
  popular?: boolean;
};

export const categories: Category[] = [
  {
    name: "Coffee & Cafe",
    navLabel: "Coffee & Café",
    slug: "coffee-cafe",
    color: "#00754a",
    description: "Coffee shop cards for daily drinks, treats, and cafe rewards."
  },
  {
    name: "Gaming",
    navLabel: "Gaming",
    slug: "gaming",
    color: "#2563eb",
    description: "Game credit, console stores, memberships, and add-ons."
  },
  {
    name: "Food Delivery",
    navLabel: "Food Delivery",
    slug: "food-delivery",
    color: "#ff3008",
    description: "Meals, groceries, snacks, and delivery convenience."
  },
  {
    name: "Streaming",
    navLabel: "Streaming",
    slug: "streaming",
    color: "#7c3aed",
    description: "Movies, shows, subscriptions, and entertainment."
  },
  {
    name: "Retail",
    navLabel: "Retail",
    slug: "retail",
    color: "#0071ce",
    description: "Tech, home, essentials, appliances, and everyday shopping."
  },
  {
    name: "Beauty",
    navLabel: "Beauty",
    slug: "beauty",
    color: "#be185d",
    description: "Beauty, skincare, fragrance, and self-care gifts."
  },
  {
    name: "Travel",
    navLabel: "Travel",
    slug: "travel",
    color: "#047857",
    description: "Rides, stays, trips, and travel planning."
  }
];

const categoryByName = Object.fromEntries(categories.map((category) => [category.name, category]));

function card(
  brand: string,
  category: Category["name"],
  color: string,
  price: number,
  options: Partial<Omit<GiftCard, "brand" | "category" | "categorySlug" | "color" | "price" | "slug" | "productName">> = {}
): GiftCard {
  const categoryData = categoryByName[category];
  return {
    brand,
    category,
    categorySlug: categoryData.slug,
    color,
    description: options.description || categoryData.description,
    productName: options.description?.includes("Subscription") ? `${brand} Subscription` : `${brand} Gift Card`,
    slug: brand.toLowerCase().replaceAll("&", "and").replaceAll("+", "plus").replaceAll("'", "").replaceAll(" ", "-"),
    price,
    denominations: options.denominations || [25, 50, 100, 200],
    rating: options.rating || 4.8,
    reviews: options.reviews || 1200,
    badge: options.badge || "Popular",
    compareAt: options.compareAt,
    popular: options.popular
  };
}

export const giftCards: GiftCard[] = [
  card("Starbucks", "Coffee & Cafe", "#00754a", 25, { reviews: 9400, popular: true }),
  card("Dunkin'", "Coffee & Cafe", "#ff671f", 20, { compareAt: 25, badge: "Deal", reviews: 2203 }),
  card("Dutch Bros", "Coffee & Cafe", "#00a3e0", 25, { badge: "New", reviews: 1198 }),

  card("Roblox", "Gaming", "#e2231a", 25, { reviews: 6740, popular: true }),
  card("Xbox", "Gaming", "#107c10", 12.74, {
    productName: "Xbox Game Pass Ultimate 1 Month",
    compareAt: 14.99,
    badge: "Deal",
    reviews: 4567,
    denominations: [12.74, 25, 50, 100]
  } as Partial<GiftCard>),
  card("PlayStation", "Gaming", "#003791", 16, { compareAt: 20, badge: "Deal", reviews: 5102, popular: true }),
  card("Nintendo", "Gaming", "#e60012", 21.25, { compareAt: 25, badge: "Deal", reviews: 2847 }),
  card("Steam", "Gaming", "#171a21", 17, { compareAt: 20, badge: "Deal", reviews: 12043, popular: true }),

  card("DoorDash", "Food Delivery", "#ff3008", 25, { reviews: 4196, popular: true }),
  card("Uber Eats", "Food Delivery", "#06c167", 25, { badge: "Deal", reviews: 3688 }),
  card("Grubhub", "Food Delivery", "#ff8000", 25, { badge: "New", reviews: 1402 }),
  card("Instacart", "Food Delivery", "#43b02a", 50, { reviews: 2289 }),

  card("Netflix", "Streaming", "#e50914", 30, { reviews: 3091, popular: true }),
  card("Disney+", "Streaming", "#113ccf", 25, { badge: "New", reviews: 1818 }),
  card("Hulu", "Streaming", "#1ce783", 25, { reviews: 1654 }),
  card("Amazon Prime", "Streaming", "#00a8e1", 50, { reviews: 2376, popular: true }),
  card("Apple TV+", "Streaming", "#111827", 25, { badge: "New", reviews: 1207 }),

  card("Target", "Retail", "#cc0000", 50, { reviews: 7121, popular: true }),
  card("Walmart", "Retail", "#0071ce", 50, { reviews: 8320, popular: true }),
  card("Best Buy", "Retail", "#0046be", 75, { compareAt: 80, badge: "Deal", reviews: 2764 }),
  card("Home Depot", "Retail", "#f96302", 100, { compareAt: 110, badge: "Deal", reviews: 1942 }),
  card("Lowe's", "Retail", "#004990", 100, { badge: "New", reviews: 1639 }),

  card("Sephora", "Beauty", "#111111", 50, { reviews: 2970, popular: true }),
  card("Ulta Beauty", "Beauty", "#ed008c", 50, { compareAt: 55, badge: "Deal", reviews: 1834 }),

  card("Southwest Airlines", "Travel", "#304cb2", 100, { badge: "New", reviews: 1509 }),
  card("Airbnb", "Travel", "#ff5a5f", 100, { reviews: 2521, popular: true }),
  card("Uber", "Travel", "#000000", 50, { reviews: 5011, popular: true })
].map((item) => ({
  ...item,
  productName:
    item.brand === "Xbox"
      ? "Xbox Game Pass Ultimate 1 Month"
      : item.brand === "PlayStation"
        ? "PlayStation Store Gift Card"
        : item.brand === "Nintendo"
          ? "Nintendo eShop Gift Card"
          : item.brand === "Steam"
            ? "Steam Wallet Gift Card"
            : item.productName
}));
