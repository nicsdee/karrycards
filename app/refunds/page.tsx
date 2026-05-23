import Footer from "../components/Footer";
import Nav from "../components/nav";
import { fallbackCatalog } from "../lib/catalog";

export default function RefundsPage() {
  return (
    <>
      <Nav categories={fallbackCatalog.categories} showSearch={false} />
      <main className="legal-page">
        <h1>Refund Policy</h1>
        <p>Orders can be cancelled before fulfillment if payment has not been confirmed or email delivery has not started.</p>
        <p>Delivered gift card codes are normally final unless support confirms the code was invalid or not delivered.</p>
      </main>
      <Footer />
    </>
  );
}
