import Footer from "../components/Footer";
import Nav from "../components/nav";
import { fallbackCatalog } from "../lib/catalog";

export default function TermsPage() {
  return (
    <>
      <Nav categories={fallbackCatalog.categories} showSearch={false} />
      <main className="legal-page">
        <h1>Terms of Service</h1>
        <p>KarryCards orders are reviewed before fulfillment. Gift card delivery depends on verified payment and supplier availability.</p>
        <p>Customers must provide accurate delivery information. Fraudulent, reversed, or unconfirmed payments will not be fulfilled.</p>
      </main>
      <Footer />
    </>
  );
}
