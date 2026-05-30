import type { Metadata } from "next";
import Footer from "../components/Footer";
import Nav from "../components/nav";
import { categories } from "../data";
import { whatsappDisplay, whatsappHref } from "../lib/contact";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karrycards.com";

const faqItems = [
  {
    question: "How do I receive my gift card code?",
    answer:
      "At checkout, enter the email address where you want the gift card code sent. After blockchain payment confirmation, the automated delivery system sends the code to that email address."
  },
  {
    question: "How long does delivery take?",
    answer:
      "Gift card codes are emailed automatically after blockchain confirmation. If the blockchain network takes longer to confirm payment, delivery waits until confirmation is received."
  },
  {
    question: "What payment methods does KarryCards accept?",
    answer:
      "KarryCards currently uses secure crypto checkout. The checkout page shows the payment total, payment instructions, and delivery email before you continue to payment."
  },
  {
    question: "What happens if my order is delayed?",
    answer:
      "Use the order status page or contact support with your order email or order reference. KarryCards keeps payment status, delivery email, and delivery notes so support can review delayed orders."
  },
  {
    question: "Are gift card purchases refundable?",
    answer:
      "Orders can be reviewed before automatic delivery. Once a valid digital gift card code has been delivered, the purchase is generally final unless the code is invalid or the order was not delivered as promised."
  },
  {
    question: "Is KarryCards focused on US shoppers?",
    answer:
      "Yes. KarryCards focuses on popular digital gift cards, USD pricing, and categories commonly searched by US shoppers, including gaming, retail, streaming, food delivery, coffee, beauty, and travel."
  },
  {
    question: "How can I contact support?",
    answer:
      `Use the live chat button, WhatsApp ${whatsappDisplay}, or email info@karrycards.com for order support.`
  }
];

export const metadata: Metadata = {
  title: "FAQ | Digital Gift Card Delivery, Payments, and Support",
  description:
    "Frequently asked questions about KarryCards digital gift card delivery, blockchain payment confirmation, order status, refunds, and customer support.",
  alternates: {
    canonical: "/faq"
  },
  openGraph: {
    title: "KarryCards FAQ",
    description: "Answers about gift card delivery, crypto checkout, refunds, order tracking, and support.",
    url: "/faq",
    siteName: "KarryCards",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "KarryCards FAQ",
    url: `${siteUrl}/faq`,
    description: "Digital gift card delivery, payment, refund, order tracking, and support questions.",
    isPartOf: {
      "@type": "WebSite",
      name: "KarryCards",
      url: `${siteUrl}/`
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <Nav categories={categories} searchPlaceholder="Search gift cards" />
      <main className="faq-page-shell">
        <section className="faq-hero" aria-labelledby="faq-title">
          <p className="home-kicker">Digital gift card help</p>
          <h1 id="faq-title">Frequently asked questions</h1>
          <p>
            Clear answers for gift card buyers before checkout: delivery time, blockchain payment confirmation, order tracking,
            refunds, and how to reach support if something needs review.
          </p>
          <div className="faq-hero-actions">
            <a className="button primary-home-button" href="/checkout">Go to checkout</a>
            <a className="button secondary-home-button" href="/order-status">Check order status</a>
          </div>
        </section>

        <section className="faq-grid" aria-label="KarryCards frequently asked questions">
          {faqItems.map((item) => (
            <article key={item.question} className="faq-card">
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </article>
          ))}
        </section>

        <section className="faq-support-band" aria-label="Support options">
          <div>
            <h2>Need help with an order?</h2>
            <p>
              Keep your order email and payment reference ready. Support can review payment status, delivery email,
              delivery notes, and code delivery records without exposing private customer details publicly.
            </p>
          </div>
          <a href={whatsappHref()} target="_blank" rel="noreferrer">WhatsApp {whatsappDisplay}</a>
        </section>
      </main>
      <Footer />
    </>
  );
}
