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
const defaultDenominations = [25, 50, 100, 150, 200, 1000];

function card(
  brand: string,
  category: Category["name"],
  color: string,
  price: number,
  options: Partial<Omit<GiftCard, "brand" | "category" | "categorySlug" | "color" | "price" | "slug">> = {}
): GiftCard {
  const categoryData = categoryByName[category];
  return {
    brand,
    category,
    categorySlug: categoryData.slug,
    color,
    description: options.description || categoryData.description,
    productName: options.productName || (options.description?.includes("Subscription") ? `${brand} Subscription` : `${brand} Gift Card`),
    slug: brand.toLowerCase().replaceAll("&", "and").replaceAll("+", "plus").replaceAll("'", "").replaceAll(" ", "-"),
    price,
    denominations: options.denominations || defaultDenominations,
    rating: options.rating || 4.8,
    reviews: options.reviews || 1200,
    badge: options.badge || "Popular",
    compareAt: options.compareAt,
    popular: options.popular
  };
}

export const giftCards: GiftCard[] = [
  card("Starbucks", "Coffee & Cafe", "#00754a", 25, { reviews: 9400, popular: true, denominations: [10, 25, 50, 100, 150, 200, 500] }),
  card("Dunkin'", "Coffee & Cafe", "#ff671f", 25, { badge: "Deal", reviews: 2203, denominations: [10, 25, 50, 100, 150, 200] }),
  card("Dutch Bros", "Coffee & Cafe", "#00a3e0", 25, { badge: "New", reviews: 1198 }),
  card("Peet's Coffee", "Coffee & Cafe", "#5a2d0c", 25, { reviews: 1386 }),
  card("The Coffee Bean & Tea Leaf", "Coffee & Cafe", "#5c2d91", 25, { badge: "New", reviews: 942 }),
  card("Tim Hortons", "Coffee & Cafe", "#c8102e", 25, { reviews: 1884 }),
  card("Panera Bread", "Coffee & Cafe", "#3c2415", 25, { reviews: 2216 }),
  card("Krispy Kreme", "Coffee & Cafe", "#007a3d", 25, { reviews: 1744 }),

  card("Roblox", "Gaming", "#e2231a", 25, { reviews: 6740, popular: true, denominations: [10, 25, 50, 100, 150, 200, 500, 1000] }),
  card("Xbox", "Gaming", "#107c10", 25, { productName: "Xbox Gift Card", badge: "Deal", reviews: 4567, denominations: [10, 25, 50, 100, 150, 200, 500, 1000] }),
  card("Xbox Game Pass", "Gaming", "#107c10", 25, { productName: "Xbox Game Pass Gift Card", badge: "Deal", reviews: 4218 }),
  card("PlayStation", "Gaming", "#003791", 25, { productName: "PlayStation Store Gift Card", badge: "Deal", reviews: 5102, popular: true }),
  card("Nintendo", "Gaming", "#e60012", 25, { productName: "Nintendo eShop Gift Card", badge: "Deal", reviews: 2847 }),
  card("Steam", "Gaming", "#171a21", 25, { productName: "Steam Wallet Gift Card", badge: "Deal", reviews: 12043, popular: true }),
  card("Razer Gold", "Gaming", "#44d62c", 25, { badge: "New", reviews: 3826, popular: true, denominations: [10, 20, 25, 50, 100, 150, 200, 500, 1000] }),
  card("Razer", "Gaming", "#44d62c", 50, { productName: "Razer Gift Card", badge: "New", reviews: 1982, denominations: [25, 50, 100, 150, 200, 500, 1000] }),
  card("Minecraft", "Gaming", "#62b547", 25, { reviews: 2491 }),
  card("Epic Games", "Gaming", "#111111", 25, { reviews: 3088 }),
  card("Fortnite", "Gaming", "#7b2ff7", 25, { productName: "Fortnite V-Bucks Gift Card", reviews: 4865 }),
  card("League of Legends", "Gaming", "#0bc4e2", 25, { reviews: 2942 }),
  card("Valorant", "Gaming", "#ff4655", 25, { reviews: 2785 }),
  card("EA Play", "Gaming", "#ff4747", 25, { reviews: 1518 }),
  card("GameStop", "Gaming", "#d71920", 50, { reviews: 4412 }),
  card("Twitch", "Gaming", "#9146ff", 25, { reviews: 3105 }),
  card("Discord Nitro", "Gaming", "#5865f2", 25, { productName: "Discord Nitro Gift Card", reviews: 2168 }),

  card("DoorDash", "Food Delivery", "#ff3008", 25, { reviews: 4196, popular: true }),
  card("Uber Eats", "Food Delivery", "#06c167", 25, { badge: "Deal", reviews: 3688 }),
  card("Grubhub", "Food Delivery", "#ff8000", 25, { badge: "New", reviews: 1402 }),
  card("Instacart", "Food Delivery", "#43b02a", 50, { reviews: 2289 }),
  card("Chipotle", "Food Delivery", "#451400", 25, { reviews: 3186 }),
  card("Chick-fil-A", "Food Delivery", "#e51636", 25, { reviews: 3954 }),
  card("McDonald's", "Food Delivery", "#ffbc0d", 25, { reviews: 5220 }),
  card("Taco Bell", "Food Delivery", "#702082", 25, { reviews: 2866 }),
  card("Domino's", "Food Delivery", "#006491", 25, { reviews: 3318 }),
  card("Pizza Hut", "Food Delivery", "#ee3124", 25, { reviews: 2480 }),
  card("Subway", "Food Delivery", "#008938", 25, { reviews: 2140 }),
  card("Burger King", "Food Delivery", "#d62300", 25, { reviews: 1995 }),

  card("Netflix", "Streaming", "#e50914", 25, { reviews: 3091, popular: true, denominations: [15, 25, 30, 50, 100, 150, 200] }),
  card("Disney+", "Streaming", "#113ccf", 25, { badge: "New", reviews: 1818 }),
  card("Hulu", "Streaming", "#1ce783", 25, { reviews: 1654 }),
  card("Amazon Prime", "Streaming", "#00a8e1", 50, { reviews: 2376, popular: true }),
  card("Apple TV+", "Streaming", "#111827", 25, { badge: "New", reviews: 1207 }),
  card("Spotify", "Streaming", "#1db954", 25, { reviews: 5014 }),
  card("YouTube", "Streaming", "#ff0000", 25, { productName: "YouTube Gift Card", reviews: 3124 }),
  card("Paramount+", "Streaming", "#0064ff", 25, { reviews: 1086 }),
  card("HBO Max", "Streaming", "#5822b4", 25, { productName: "Max Gift Card", reviews: 1408 }),
  card("Sling TV", "Streaming", "#00aeef", 25, { reviews: 826 }),
  card("Fandango", "Streaming", "#ff7300", 25, { reviews: 2319 }),

  card("Amazon", "Retail", "#ff9900", 25, { reviews: 15420, popular: true, denominations: [10, 25, 50, 100, 150, 200, 500, 1000] }),
  card("Target", "Retail", "#cc0000", 50, { reviews: 7121, popular: true }),
  card("Walmart", "Retail", "#0071ce", 50, { reviews: 8320, popular: true, denominations: [10, 25, 50, 100, 150, 200, 500, 1000] }),
  card("Apple", "Retail", "#111111", 25, { productName: "Apple Gift Card", reviews: 8360, popular: true, denominations: [10, 25, 50, 100, 150, 200, 500, 1000] }),
  card("Best Buy", "Retail", "#0046be", 75, { badge: "Deal", reviews: 2764 }),
  card("Home Depot", "Retail", "#f96302", 100, { badge: "Deal", reviews: 1942 }),
  card("Lowe's", "Retail", "#004990", 100, { badge: "New", reviews: 1639 }),
  card("Costco", "Retail", "#005daa", 100, { reviews: 2824 }),
  card("Sam's Club", "Retail", "#0067a0", 100, { reviews: 1512 }),
  card("eBay", "Retail", "#e53238", 25, { reviews: 4582 }),
  card("Etsy", "Retail", "#f1641e", 25, { reviews: 2963 }),
  card("Macy's", "Retail", "#e21a2c", 50, { reviews: 2025 }),
  card("Nordstrom", "Retail", "#111111", 50, { reviews: 1806 }),
  card("Nike", "Retail", "#111111", 50, { reviews: 4315 }),
  card("Adidas", "Retail", "#111111", 50, { reviews: 2104 }),
  card("Foot Locker", "Retail", "#e31837", 50, { reviews: 1842 }),
  card("Wayfair", "Retail", "#7f187f", 50, { reviews: 1526 }),
  card("IKEA", "Retail", "#0058a3", 50, { reviews: 1608 }),
  card("CVS Pharmacy", "Retail", "#cc0000", 25, { reviews: 1188 }),
  card("Walgreens", "Retail", "#e31837", 25, { reviews: 1214 }),
  card("Visa", "Retail", "#1a1f71", 50, { productName: "Visa Prepaid Gift Card", reviews: 6210, denominations: [25, 50, 100, 150, 200, 500, 1000] }),
  card("Mastercard", "Retail", "#eb001b", 50, { productName: "Mastercard Prepaid Gift Card", reviews: 3882, denominations: [25, 50, 100, 150, 200, 500, 1000] }),

  card("Sephora", "Beauty", "#111111", 50, { reviews: 2970, popular: true }),
  card("Ulta Beauty", "Beauty", "#ed008c", 50, { badge: "Deal", reviews: 1834 }),
  card("Bath & Body Works", "Beauty", "#0057b8", 25, { reviews: 2452 }),
  card("Sally Beauty", "Beauty", "#d71920", 25, { reviews: 984 }),
  card("MAC Cosmetics", "Beauty", "#111111", 50, { reviews: 1372 }),
  card("Lush", "Beauty", "#111111", 50, { reviews: 1182 }),
  card("Fenty Beauty", "Beauty", "#8a4f3d", 50, { badge: "New", reviews: 946 }),
  card("Glossier", "Beauty", "#f5b6c7", 50, { reviews: 804 }),

  card("Southwest Airlines", "Travel", "#304cb2", 100, { badge: "New", reviews: 1509 }),
  card("Airbnb", "Travel", "#ff5a5f", 100, { reviews: 2521, popular: true }),
  card("Uber", "Travel", "#000000", 50, { reviews: 5011, popular: true }),
  card("Lyft", "Travel", "#ff00bf", 50, { reviews: 2207 }),
  card("Delta Air Lines", "Travel", "#003366", 100, { reviews: 1688 }),
  card("United Airlines", "Travel", "#005daa", 100, { reviews: 1390 }),
  card("American Airlines", "Travel", "#0078d2", 100, { reviews: 1464 }),
  card("Hotels.com", "Travel", "#d71920", 100, { reviews: 1645 }),
  card("Expedia", "Travel", "#ffc72c", 100, { reviews: 1884 }),
  card("Marriott", "Travel", "#b4915c", 100, { reviews: 1325 }),
  card("Hilton", "Travel", "#104c97", 100, { reviews: 1186 }),
  card("Royal Caribbean", "Travel", "#00539b", 100, { reviews: 728 })
];
