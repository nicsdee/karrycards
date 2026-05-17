import Footer from "../components/Footer";
import Nav from "../components/nav";
import { fallbackCatalog } from "../lib/catalog";

export default function PrivacyPage() {
  return (
    <>
      <Nav categories={fallbackCatalog.categories} showSearch={false} />
      <main className="legal-page">
        <h1>Privacy Policy</h1>
        <p>We collect order details, customer contact information, payment references, and delivery status so orders can be processed and supported.</p>
        <p>We may record basic visit information such as page URL, referrer, browser, approximate IP address, and session ID to monitor store activity and alert the store owner about new visits.</p>
        <p>Payment card data should be handled only by a certified payment processor. Crypto payment records are used for transaction verification.</p>
      </main>
      <Footer />
    </>
  );
}
