import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
import Nav from "../components/nav";
import { fallbackCatalog } from "../lib/catalog";

export const metadata: Metadata = {
  title: "About Us | Digital Gift Cards for US Shoppers",
  description:
    "Learn about KarryCards, a digital gift card store for US shoppers with secure checkout, clear order tracking, and automatic email delivery after blockchain confirmation.",
  keywords: [
    "about KarryCards",
    "trusted gift card store",
    "buy gift cards online",
    "instant email delivery gift cards",
    "digital gift cards by email",
    "global digital gift cards",
    "USA gift cards online",
    "retail gift cards online",
    "gaming gift cards online",
    "prepaid gift cards online",
    "gift cards with crypto",
    "discount digital gift cards"
  ],
  alternates: {
    canonical: "/about-us"
  },
  openGraph: {
    title: "About KarryCards | Digital Gift Cards for US Shoppers",
    description:
      "KarryCards helps shoppers buy digital gift cards online with secure checkout, clear order tracking, and email delivery.",
    url: "/about-us",
    siteName: "KarryCards",
    type: "website"
  }
};

export default function AboutUsPage() {
  return (
    <>
      <Nav categories={fallbackCatalog.categories} showSearch={false} />
      <main className="about-page compact-about-page">
        <section className="about-hero compact-about-hero">
          <div>
            <p className="eyebrow">About KarryCards</p>
            <h1>Digital gift cards made simple since 2013.</h1>
            <p>
              KarryCards came to existence in 2013 with one clear idea: make trusted gift cards easier to buy, send,
              and use. We focus on customers in the USA with digital cards for gaming, retail,
              streaming, food delivery, travel, beauty, prepaid spending, and everyday gifting.
            </p>
            <div className="hero-actions">
              <Link className="button green" href="/our-digital-gift-cards">Shop Gift Cards</Link>
              <Link className="button orange" href="/order-status">Track Order</Link>
            </div>
          </div>
          <div className="about-proof-panel">
            <strong>What we stand for</strong>
            <span>Trusted service since 2013</span>
            <span>Digital codes delivered by email</span>
            <span>Global customer support</span>
            <span>Secure checkout experience</span>
          </div>
        </section>

        <section className="about-grid compact-about-grid" aria-label="About KarryCards services">
          <article>
            <h2>Who We Are</h2>
            <p>
              A digital gift card store for people who want quick, clear, and reliable online gifting, whether they are
              shopping from New York, Los Angeles, Houston, Atlanta, Chicago, Miami, Dallas, or beyond.
            </p>
          </article>

          <article>
            <h2>What We Do</h2>
            <p>
              We organize popular gift cards for gaming, shopping, streaming, restaurants, food delivery, travel,
              beauty, prepaid spending, and daily essentials so customers can move from search to checkout quickly.
            </p>
          </article>

          <article>
            <h2>Payment And Delivery</h2>
            <p>
              After checkout, digital gift card details are prepared and sent to the order email, making KarryCards
              useful for last-minute gifts, top-ups, rewards, and everyday purchases.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
