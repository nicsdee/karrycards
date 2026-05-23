"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogoImage } from "../../components/BrandLogoImage";
import CartToast from "../../components/CartToast";
import Footer from "../../components/Footer";
import Nav from "../../components/nav";
import { Category, GiftCard } from "../../data";
import { fallbackCatalog, fetchCatalog, fetchGiftCard } from "../../lib/catalog";
import { discountedAmount, discountPercentForCard } from "../../lib/pricing";

type CartItem = GiftCard & {
  amount: number;
  id: string;
};

function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
}

export default function CardDetailPage() {
  const params = useParams<{ slug: string }>();
  const fallbackCard = fallbackCatalog.giftCards.find((item) => item.slug === params.slug) || fallbackCatalog.giftCards[0];
  const [categories, setCategories] = useState<Category[]>(fallbackCatalog.categories);
  const [card, setCard] = useState<GiftCard>(fallbackCard);
  const category = categories.find((item) => item.slug === card.categorySlug);
  const [selectedAmount, setSelectedAmount] = useState(card.price);
  const discountPercent = discountPercentForCard(card);
  const selectedSaleAmount = discountedAmount(selectedAmount, discountPercent);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchCatalog()
      .then((catalog) => setCategories(catalog.categories))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const nextFallback = fallbackCatalog.giftCards.find((item) => item.slug === params.slug) || fallbackCatalog.giftCards[0];
    setCard(nextFallback);
    setSelectedAmount(nextFallback.price);

    fetchGiftCard(params.slug)
      .then((giftCard) => {
        setCard(giftCard);
        setSelectedAmount(giftCard.price);
      })
      .catch(() => undefined);
  }, [params.slug]);

  useEffect(() => {
    const saved = window.localStorage.getItem("karrycards-cart");
    if (saved) setCart(JSON.parse(saved) as CartItem[]);
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    window.localStorage.setItem("karrycards-cart", JSON.stringify(cart));
  }, [cart, cartLoaded]);

  function addToCart() {
    setCart((current) => [
      ...current,
      {
        ...card,
        amount: selectedAmount,
        id: `${card.slug}-${selectedAmount}-${crypto.randomUUID()}`
      }
    ]);
    setToastMessage(`${card.productName} ${money(selectedAmount)} is now in your cart.`);
  }

  function decreaseCart() {
    setCart((current) => {
      const index = current.findIndex((item) => item.slug === card.slug && item.amount === selectedAmount);
      if (index === -1) return current;
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
    setToastMessage("Item quantity has been updated.");
  }

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(""), 2000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  return (
    <>
      <Nav activeSlug={card.categorySlug} cartCount={cart.length} categories={categories} />

      <main className="detail-page">
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/category/${card.categorySlug}`}>{category?.navLabel}</Link>
          <span>/</span>
          <strong>{card.productName}</strong>
        </div>

        <section className="product-detail">
          <div className="detail-gallery">
            <div className="detail-card-stage">
              <div className={`detail-real-card real-card-${card.slug}`} style={{ "--card-color": card.color } as React.CSSProperties}>
                <span className="watermark">@KarryCards</span>
                <BrandLogoImage brand={card.brand} className="card-logo" />
                <span className="brand-mark" aria-hidden="true">{card.brand.slice(0, 1)}</span>
                <span className="card-type">Gift Card</span>
                <strong>{card.brand}</strong>
                <small>{card.productName}</small>
                <em>{money(selectedAmount)}</em>
                <i />
              </div>
            </div>
            <div className="thumbnail-row">
              {[1, 2, 3].map((item) => (
                <div className="thumb" key={item} style={{ "--card-color": card.color } as React.CSSProperties}>
                  <span>{card.brand}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-info">
            <div className="stock-line">
              <span>{card.brand}</span>
              <strong>In Stock</strong>
            </div>
            <h1>{card.productName}</h1>
            <div className="detail-rating">
              <span>{card.rating.toFixed(1)}</span>
              <small>({card.reviews.toLocaleString()} reviews)</small>
            </div>

            <div className="detail-price-box">
              <strong>{money(selectedSaleAmount)}</strong>
              <span>USD</span>
              <em><del>{money(selectedAmount)}</del> {discountPercent.toFixed(2)}% off</em>
            </div>

            <div className="amount-selector">
              <div>
                <strong>Select Amount</strong>
                <span>{money(selectedAmount)} selected</span>
              </div>
              <div className="amount-buttons">
                {card.denominations.map((amount) => (
                  <button
                    className={selectedAmount === amount ? "active" : ""}
                    key={amount}
                    type="button"
                    onClick={() => setSelectedAmount(amount)}
                  >
                    {money(amount)}
                  </button>
                ))}
              </div>
            </div>

            {cart.filter((item) => item.slug === card.slug && item.amount === selectedAmount).length > 0 ? (
              <div className="detail-quantity-stepper">
                <button type="button" onClick={decreaseCart} aria-label={`Remove one ${card.productName}`}>
                  -
                </button>
                <strong>{cart.filter((item) => item.slug === card.slug && item.amount === selectedAmount).length}</strong>
                <button type="button" onClick={addToCart} aria-label={`Add one more ${card.productName}`}>
                  +
                </button>
              </div>
            ) : (
              <button className="detail-add" type="button" onClick={addToCart}>Add to Cart</button>
            )}
            <button className="favorite-button" type="button">Save to Favorites</button>

            <div className="detail-trust">
              <span>Instant delivery</span>
              <span>Secure checkout</span>
              <span>Order protection</span>
              <span>Valid worldwide</span>
            </div>
          </div>
        </section>
      </main>
      <CartToast message={toastMessage} />
      <Footer />
    </>
  );
}
