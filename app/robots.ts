import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karrycards.com";

export default function robots(): MetadataRoute.Robots {
  const adminRouteSecret = process.env.ADMIN_ROUTE_SECRET || "mygft2026";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", `/${adminRouteSecret}`, "/api/admin"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
