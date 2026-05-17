import type { MetadataRoute } from "next";
import { categories, giftCards } from "./data";

const siteUrl = "https://karrycards.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/our-digital-gift-cards", "/checkout", "/order-status", "/terms", "/privacy", "/refunds"];
  const categoryRoutes = categories.map((category) => `/category/${category.slug}`);
  const cardRoutes = giftCards.map((card) => `/cards/${card.slug}`);

  return [...staticRoutes, ...categoryRoutes, ...cardRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/our-digital-gift-cards" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/our-digital-gift-cards" ? 0.9 : 0.7
  }));
}
