import type { MetadataRoute } from "next";
import { categories, giftCards } from "./data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karrycards.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about-us", "/our-digital-gift-cards", "/checkout", "/order-status", "/faq", "/terms", "/privacy", "/refunds"];
  const categoryRoutes = categories.map((category) => `/category/${category.slug}`);
  const cardRoutes = giftCards.map((card) => `/cards/${card.slug}`);

  return [...staticRoutes, ...categoryRoutes, ...cardRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/our-digital-gift-cards" || route === "/about-us" || route === "/faq" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/our-digital-gift-cards" || route === "/about-us" || route === "/faq" ? 0.9 : 0.7
  }));
}
