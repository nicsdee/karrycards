import type { Metadata } from "next";
import VisitorTracker from "./components/VisitorTracker";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://karrycards.com"),
  title: {
    default: "KarryCards | Trusted Digital Gift Cards",
    template: "%s | KarryCards"
  },
  description:
    "Shop trusted digital gift cards for gaming, coffee, streaming, food delivery, retail, beauty, and travel with instant delivery.",
  keywords: [
    "digital gift cards",
    "trusted gift cards",
    "gaming gift cards",
    "streaming gift cards",
    "retail gift cards",
    "KarryCards"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "KarryCards | Trusted Digital Gift Cards",
    description:
      "Shop trusted digital gift cards for gaming, coffee, streaming, food delivery, retail, beauty, and travel.",
    url: "/",
    siteName: "KarryCards",
    images: [
      {
        url: "/logos/logo4.svg",
        width: 960,
        height: 240,
        alt: "KarryCards"
      }
    ],
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  },
  twitter: {
    card: "summary_large_image",
    title: "KarryCards | Trusted Digital Gift Cards",
    description: "Shop trusted digital gift cards with instant delivery."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KarryCards",
    url: "https://karrycards.com",
    logo: "https://karrycards.com/logos/logo4.svg",
    sameAs: []
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
