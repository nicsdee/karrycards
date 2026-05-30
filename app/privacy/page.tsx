import type { Metadata } from "next";
import Footer from "../components/Footer";
import Nav from "../components/nav";
import { fallbackCatalog } from "../lib/catalog";
import { whatsappDisplay } from "../lib/contact";

export const metadata: Metadata = {
  title: "Privacy Policy | KarryCards",
  description:
    "Learn how KarryCards collects, uses, protects, and stores customer information for digital gift card orders, blockchain payment confirmation, automatic delivery, support, and fraud prevention.",
  alternates: {
    canonical: "/privacy"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function PrivacyPage() {
  return (
    <>
      <Nav categories={fallbackCatalog.categories} showSearch={false} />
      <main className="legal-page policy-page">
        <section className="legal-hero">
          <p className="eyebrow">Customer privacy</p>
          <h1>Privacy Policy</h1>
          <p>
            This policy explains what information KarryCards collects, why it is needed, how it supports digital gift
            card delivery, and the choices customers have when using the website.
          </p>
          <span>Last updated: May 30, 2026</span>
        </section>

        <section className="legal-summary-grid" aria-label="Privacy highlights">
          <article>
            <strong>Order-only data</strong>
            <p>We collect information needed to process orders, confirm payment, deliver codes, and provide support.</p>
          </article>
          <article>
            <strong>No sale of data</strong>
            <p>KarryCards does not sell customer personal information to third-party marketers.</p>
          </article>
          <article>
            <strong>Security focus</strong>
            <p>Payment references, order status, and support notes are used to protect customers and prevent fraud.</p>
          </article>
        </section>

        <section className="legal-content">
          <article className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>
              We may collect customer name, email address, optional phone number, selected products, cart details, order
              number, payment reference, transaction status, delivery status, support messages, and information submitted
              through checkout, live chat, email, or order-status forms.
            </p>
          </article>

          <article className="legal-section">
            <h2>2. Website and Device Information</h2>
            <p>
              We may record basic visit information such as page URL, referring page, browser type, approximate IP
              address, device information, session ID, timestamps, and actions like product views or checkout attempts.
              This helps monitor store activity, troubleshoot problems, improve the website, and detect suspicious use.
            </p>
          </article>

          <article className="legal-section">
            <h2>3. How We Use Information</h2>
            <p>
              Customer information is used to process orders, verify payment, deliver gift card codes by email, show
              order status, answer support requests, prevent fraud, comply with legal obligations, improve page
              performance, and understand which products shoppers are looking for.
            </p>
          </article>

          <article className="legal-section">
            <h2>4. Payments and Third-Party Services</h2>
            <p>
              Crypto checkout and payment verification may be handled by payment providers such as NOWPayments or other
              processors configured by KarryCards. Email delivery, analytics, live chat, hosting, and security tools may
              also process limited information needed to provide their services. KarryCards does not ask customers for
              wallet private keys or seed phrases.
            </p>
          </article>

          <article className="legal-section">
            <h2>5. Cookies and Local Storage</h2>
            <p>
              The website may use cookies, local storage, or similar technologies to keep cart information, remember
              order flow details, support live chat, understand visits, and improve the shopping experience. Browser
              settings can usually block or delete cookies, but some features may stop working correctly.
            </p>
          </article>

          <article className="legal-section">
            <h2>6. Sharing Information</h2>
            <p>
              We may share information with service providers that help operate the store, process payments, send email,
              host the website, provide live chat, detect fraud, or comply with legal requests. We may also share
              information when needed to protect KarryCards, customers, payment providers, or the public from fraud,
              abuse, or security threats.
            </p>
          </article>

          <article className="legal-section">
            <h2>7. Data Retention</h2>
            <p>
              Order, payment, delivery, and support records may be kept as long as needed for customer service, fraud
              prevention, tax, legal, accounting, security, and business record purposes. When information is no longer
              needed, we may delete it, anonymize it, or store it in restricted archives.
            </p>
          </article>

          <article className="legal-section">
            <h2>8. Your Choices</h2>
            <p>
              Customers may contact info@karrycards.com to request help with order information, correct inaccurate
              details, or ask privacy questions. Some records may need to be retained where required for payment,
              security, legal, or fraud-prevention reasons.
            </p>
          </article>

          <article className="legal-section">
            <h2>9. Children and Sensitive Information</h2>
            <p>
              KarryCards is not intended for children under 13. Customers should not submit unnecessary sensitive
              personal information through checkout, live chat, email, or support forms.
            </p>
          </article>

          <article className="legal-section">
            <h2>10. Contact</h2>
            <p>
              For privacy questions, order support, or data requests, contact KarryCards at info@karrycards.com or
              WhatsApp {whatsappDisplay}.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
