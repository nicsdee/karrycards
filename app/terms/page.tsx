import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
import Nav from "../components/nav";
import { fallbackCatalog } from "../lib/catalog";
import { whatsappDisplay } from "../lib/contact";

export const metadata: Metadata = {
  title: "Terms and Conditions | KarryCards",
  description:
    "Read KarryCards terms for digital gift card purchases, blockchain payment confirmation, automatic email delivery, acceptable use, and customer support.",
  alternates: {
    canonical: "/terms"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function TermsPage() {
  return (
    <>
      <Nav categories={fallbackCatalog.categories} showSearch={false} />
      <main className="legal-page policy-page">
        <section className="legal-hero">
          <p className="eyebrow">KarryCards policies</p>
          <h1>Terms and Conditions</h1>
          <p>
            These terms explain how KarryCards handles digital gift card orders, blockchain payment confirmation, delivery,
            support, and customer responsibilities. Please review them before placing an order.
          </p>
          <span>Last updated: May 30, 2026</span>
        </section>

        <section className="legal-summary-grid" aria-label="Key terms">
          <article>
            <strong>Digital delivery</strong>
            <p>Gift card details are delivered automatically to the customer email after blockchain payment confirmation.</p>
          </article>
          <article>
            <strong>Order review</strong>
            <p>Orders may be reviewed for payment status, fraud prevention, availability, or delivery accuracy.</p>
          </article>
          <article>
            <strong>Final codes</strong>
            <p>Delivered valid gift card codes are normally final because they are digital goods.</p>
          </article>
        </section>

        <section className="legal-content">
          <article className="legal-section">
            <h2>1. About KarryCards</h2>
            <p>
              KarryCards is an online digital gift card store serving shoppers who want clear checkout, order tracking,
              and automatic email delivery after blockchain confirmation. Product names, logos, and trademarks belong to their
              respective owners. KarryCards is not endorsed by, sponsored by, or directly affiliated with those brands
              unless expressly stated on the website.
            </p>
          </article>

          <article className="legal-section">
            <h2>2. Customer Information</h2>
            <p>
              Customers must provide accurate order information, including the correct delivery email address. KarryCards
              is not responsible for delays or failed delivery caused by incorrect email addresses, blocked inboxes, or
              customer-provided information that cannot be verified.
            </p>
          </article>

          <article className="legal-section">
            <h2>3. Pricing, Availability, and Discounts</h2>
            <p>
              Prices are displayed in USD unless stated otherwise. Discounts, card amounts, and product availability may
              change without notice. A product displayed on the website does not guarantee delivery until payment has
              been confirmed and the order has passed review.
            </p>
          </article>

          <article className="legal-section">
            <h2>4. Payment Confirmation</h2>
            <p>
              Orders are processed only after blockchain payment confirmation. Crypto payments may require blockchain confirmations
              and payment-provider verification. If a payment is underpaid, expired, unconfirmed, reversed, suspicious,
              or sent to the wrong address, delivery may be delayed or declined.
            </p>
          </article>

          <article className="legal-section">
            <h2>5. Digital Delivery</h2>
            <p>
              Gift card codes are emailed automatically after blockchain payment confirmation. If the blockchain network
              takes longer to confirm payment, delivery waits until confirmation is received. The order status page and
              support team can help customers follow up on delayed orders.
            </p>
          </article>

          <article className="legal-section">
            <h2>6. Gift Card Use</h2>
            <p>
              Gift cards are subject to the terms, country restrictions, redemption rules, account requirements, and
              anti-fraud controls of the issuing brand or merchant. Customers are responsible for checking that a gift
              card is suitable for their intended account, region, platform, or service before purchase.
            </p>
          </article>

          <article className="legal-section">
            <h2>7. Fraud Prevention and Prohibited Use</h2>
            <p>
              KarryCards may refuse, delay, or cancel orders linked to suspected fraud, abuse, resale violations,
              payment irregularities, unlawful activity, automated abuse, or attempts to bypass security checks. Customers
              may not use KarryCards to launder funds, commit fraud, harass others, or purchase products for illegal use.
            </p>
          </article>

          <article className="legal-section">
            <h2>8. Refunds</h2>
            <p>
              Refund eligibility is explained in the <Link href="/refunds">Refund Policy</Link>. Because gift card codes
              are digital goods, valid delivered codes are generally final unless support confirms a delivery failure,
              invalid code, duplicate charge, or KarryCards delivery error.
            </p>
          </article>

          <article className="legal-section">
            <h2>9. Support and Updates</h2>
            <p>
              Customers can contact support through the website chat, WhatsApp {whatsappDisplay}, or email at
              info@karrycards.com. KarryCards may update these terms as the store, payment flow, or delivery process
              changes. Continued use of the website means you accept the current version of these terms.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
