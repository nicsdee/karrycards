"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import CartToast from "../components/CartToast";
import Footer from "../components/Footer";
import Nav from "../components/nav";
import { Category, GiftCard } from "../data";
import { fallbackCatalog, fetchCatalog } from "../lib/catalog";

type CartItem = GiftCard & {
  amount: number;
  id: string;
};

const categoryLabels: Record<string, string> = {
  "coffee-cafe": "Coffee & Café",
  gaming: "Gaming",
  "food-delivery": "Food Delivery",
  streaming: "Streaming",
  retail: "Retail",
  beauty: "Beauty",
  travel: "Travel"
};

function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
}

function getCategoryLabel(category: Category | GiftCard) {
  const slug = "categorySlug" in category ? category.categorySlug : category.slug;
  return categoryLabels[slug] || ("navLabel" in category ? category.navLabel : category.category);
}

function ProductCard({
  card,
  quantity,
  onAdd,
  onDecrease
}: {
  card: GiftCard;
  quantity: number;
  onAdd: (card: GiftCard) => void;
  onDecrease: (card: GiftCard) => void;
}) {
  const discount = card.compareAt ? Math.round(((card.compareAt - card.price) / card.compareAt) * 100) : 0;

  return (
    <article className="market-card digital-card">
      <Link className="card-link" href={`/cards/${card.slug}`} aria-label={`View ${card.productName}`}>
        <div className="visual-wrap">
          <div className="badge">{card.badge}</div>
          <div className="real-card" style={{ "--card-color": card.color } as CSSProperties}>
            <span className="watermark">@KarryCards</span>
            <span className="card-type">Gift Card</span>
            <strong>{card.brand}</strong>
            <small>{card.productName}</small>
            <em>{money(card.price)}</em>
            <i />
          </div>
        </div>
        <div className="market-copy">
          <span className="vendor">{getCategoryLabel(card).toUpperCase()}</span>
          <h3>{card.productName}</h3>
          <div className="rating">
            <span>{card.rating.toFixed(1)} / 5</span>
            <small>({card.reviews.toLocaleString()} reviews)</small>
          </div>
          <p className="delivery">Instant email delivery</p>
          <div className="price-line">
            <strong>{money(card.price)}</strong>
            <span>USD</span>
          </div>
          {card.compareAt ? (
            <div className="discount-line">
              <del>{money(card.compareAt)}</del>
              <span>{discount}% OFF</span>
            </div>
          ) : null}
        </div>
      </Link>
      {quantity > 0 ? (
        <div className="quantity-stepper" aria-label={`${card.productName} quantity`}>
          <button type="button" onClick={() => onDecrease(card)} aria-label={`Remove one ${card.productName}`}>
            -
          </button>
          <strong>{quantity}</strong>
          <button type="button" onClick={() => onAdd(card)} aria-label={`Add one more ${card.productName}`}>
            +
          </button>
        </div>
      ) : (
        <button className="round-add" type="button" onClick={() => onAdd(card)} aria-label={`Add ${card.productName} to cart`}>
          Add to Cart
        </button>
      )}
    </article>
  );
}

export default function OurDigitalGiftCardsPage() {
  const [catalog, setCatalog] = useState(fallbackCatalog);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchCatalog()
      .then(setCatalog)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("karrycards-cart");
    if (saved) setCart(JSON.parse(saved) as CartItem[]);
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    window.localStorage.setItem("karrycards-cart", JSON.stringify(cart));
  }, [cart, cartLoaded]);

  const categoryCounts = useMemo(() => {
    return new Map(
      catalog.categories.map((category) => [
        category.name,
        catalog.giftCards.filter((card) => card.category === category.name || card.categorySlug === category.slug).length
      ])
    );
  }, [catalog.categories, catalog.giftCards]);

  const filteredCards = useMemo(() => {
    const search = query.trim().toLowerCase();

    return catalog.giftCards.filter((card) => {
      const matchesCategory = activeCategory === "All" || card.category === activeCategory;
      const matchesQuery =
        !search ||
        `${card.brand} ${card.productName} ${card.category} ${getCategoryLabel(card)}`.toLowerCase().includes(search);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, catalog.giftCards, query]);

  const featuredCards = useMemo(() => filteredCards.filter((card) => card.popular).slice(0, 3), [filteredCards]);

  function addToCart(card: GiftCard) {
    setCart((current) => [
      ...current,
      {
        ...card,
        amount: card.price,
        id: `${card.slug}-${card.price}-${crypto.randomUUID()}`
      }
    ]);
    setToastMessage(`${card.productName} is now in your cart.`);
  }

  function decreaseCart(card: GiftCard) {
    setCart((current) => {
      const index = current.findIndex((item) => item.slug === card.slug);
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
      <Nav
        activeSlug={activeCategory === "All" ? undefined : catalog.categories.find((category) => category.name === activeCategory)?.slug}
        cartCount={cart.length}
        categories={catalog.categories}
        onQueryChange={setQuery}
        query={query}
        searchPlaceholder="Search digital gift cards"
      />

      <main className="digital-cards-page">
        <section className="digital-cards-hero">
          <div>
            {/*<p className="eyebrow">Digital gift card marketplace</p>*/}
            <h1>Our Digital Gift Cards</h1>
            <p>
              Shop trusted gift cards for coffee, gaming, delivery, streaming, retail, beauty, and travel with instant
              delivery and clear pricing.
            </p>
          </div>
          <div className="digital-hero-stack" aria-hidden="true">
            {(featuredCards.length ? featuredCards : catalog.giftCards.slice(0, 3)).map((card, index) => (
              <div
                className={`digital-mini-card digital-mini-card-${index + 1}`}
                key={card.slug}
                style={{ "--card-color": card.color } as CSSProperties}
              >
                <span>{card.brand}</span>
                <strong>{money(card.price)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="digital-shop-layout" aria-label="Digital gift card catalog">
          <aside className="digital-filter-panel">
            <div className="filters-heading">
              <strong>Filter by type</strong>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setQuery("");
                }}
              >
                Clear
              </button>
            </div>
            <div className="digital-filter-list">
              <button className={activeCategory === "All" ? "active" : ""} type="button" onClick={() => setActiveCategory("All")}>
                <span>All Gift Cards</span>
                <small>{catalog.giftCards.length}</small>
              </button>
              {catalog.categories.map((category) => (
                <button
                  className={activeCategory === category.name ? "active" : ""}
                  key={category.slug}
                  type="button"
                  onClick={() => setActiveCategory(category.name)}
                >
                  <span>{getCategoryLabel(category)}</span>
                  <small>{categoryCounts.get(category.name) || 0}</small>
                </button>
              ))}
            </div>
          </aside>

          <section className="digital-catalog-panel">
            <div className="digital-catalog-top">
              <div>
                <p>{activeCategory === "All" ? "All categories" : activeCategory}</p>
                <h2>{filteredCards.length} gift cards available</h2>
              </div>
              <span>Instant delivery</span>
            </div>

            {filteredCards.length ? (
              <div className="product-grid marketplace digital-product-grid">
                {filteredCards.map((card) => (
                  <ProductCard
                    card={card}
                    key={`${card.slug}-${card.productName}`}
                    quantity={cart.filter((item) => item.slug === card.slug).length}
                    onAdd={addToCart}
                    onDecrease={decreaseCart}
                  />
                ))}
              </div>
            ) : (
              <div className="digital-empty-state">
                <h2>No gift cards found</h2>
                <p>Try a different category or clear your search.</p>
              </div>
            )}
          </section>
        </section>
      </main>

      <CartToast message={toastMessage} />
      <Footer />
    </>
  );
}
