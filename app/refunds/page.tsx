import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
import Nav from "../components/nav";
import { fallbackCatalog } from "../lib/catalog";

export const metadata: Metadata = {
  title: "Refund Policy | KarryCards",
  description:
    "Read KarryCards refund policy for digital gift card orders, blockchain payment confirmation, delivery delays, invalid codes, duplicate payments, and support review.",
  alternates: {
    canonical: "/refunds"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RefundsPage() {
  return (
    <>
      <Nav categories={fallbackCatalog.categories} showSearch={false} />
      <main className="legal-page policy-page">
        <section className="legal-hero">
          <p className="eyebrow">Buyer protection</p>
          <h1>Refund Policy</h1>
          <p>
            Digital gift cards are time-sensitive digital goods. This policy explains when an order may be cancelled,
            reviewed, replaced, or refunded.
          </p>
          <span>Last updated: May 30, 2026</span>
        </section>

        <section className="legal-summary-grid" aria-label="Refund highlights">
          <article>
            <strong>Before delivery</strong>
            <p>Orders may be cancelled or reviewed before a gift card code has been delivered.</p>
          </article>
          <article>
            <strong>After delivery</strong>
            <p>Valid delivered codes are normally final because they can be redeemed immediately.</p>
          </article>
          <article>
            <strong>Support review</strong>
            <p>Invalid codes, duplicate payments, and confirmed delivery failures can be investigated by support.</p>
          </article>
        </section>

        <section className="legal-content">
          <article className="legal-section">
            <h2>1. General Refund Rule</h2>
            <p>
              Gift card codes are digital goods. Once a valid code has been delivered to the customer email, the order is
              generally final and cannot be refunded, exchanged, or cancelled unless KarryCards confirms a delivery
              error, invalid code, duplicate charge, or delivery failure.
            </p>
          </article>

          <article className="legal-section">
            <h2>2. Orders Not Yet Fulfilled</h2>
            <p>
              If payment has not been confirmed or email delivery has not started, customers may contact support to
              request cancellation or review. If payment has already been received, KarryCards may either fulfill the
              order, replace the product where possible, or refund the eligible amount after review.
            </p>
          </article>

          <article className="legal-section">
            <h2>3. Eligible Refund or Replacement Cases</h2>
            <ul>
              <li>KarryCards received payment but cannot fulfill the ordered product.</li>
              <li>The customer was charged twice for the same order.</li>
              <li>The delivered code is confirmed invalid and was not caused by customer misuse.</li>
              <li>The wrong product or amount was delivered because of a KarryCards delivery error.</li>
              <li>The code was not delivered to the customer email and support confirms a delivery failure.</li>
            </ul>
          </article>

          <article className="legal-section">
            <h2>4. Non-Refundable Cases</h2>
            <ul>
              <li>The customer entered the wrong email address or ignored checkout instructions.</li>
              <li>The code was delivered and appears valid or redeemed.</li>
              <li>The customer bought a card for the wrong country, account, platform, or service.</li>
              <li>The customer changed their mind after the code was delivered.</li>
              <li>The order is linked to fraud, abuse, resale violations, or suspicious payment activity.</li>
              <li>Crypto price movement, network fees, wallet errors, or underpayments caused by the customer.</li>
            </ul>
          </article>

          <article className="legal-section">
            <h2>5. Crypto Payment Refunds</h2>
            <p>
              When a crypto refund is approved, it is usually returned to a wallet address confirmed by support. Network
              fees, exchange-rate changes, underpayments, overpayments, and payment-provider limits may affect the final
              refund amount. KarryCards may request verification before sending a refund.
            </p>
          </article>

          <article className="legal-section">
            <h2>6. How To Request a Review</h2>
            <p>
              Contact support at info@karrycards.com within 7 days of the order date. Include your order email, order
              reference, product name, payment reference, and a clear description of the issue. Do not post full gift
              card codes publicly.
            </p>
          </article>

          <article className="legal-section">
            <h2>7. Review Time</h2>
            <p>
              Most support reviews are handled as quickly as possible, but some cases require payment-provider checks,
              delivery-log checks, or brand-related verification. KarryCards may offer a replacement, store credit,
              refund, or explanation after review.
            </p>
          </article>

          <article className="legal-section">
            <h2>8. Related Policies</h2>
            <p>
              Please also review the <Link href="/terms">Terms and Conditions</Link> and <Link href="/privacy">Privacy Policy</Link> before placing an order.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
