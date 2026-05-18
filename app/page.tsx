"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CartToast from "./components/CartToast";
import Footer from "./components/Footer";
import Nav from "./components/nav";
import { GiftCard } from "./data";
import { fallbackCatalog, fetchCatalog } from "./lib/catalog";
import { discountedPriceForCard, discountPercentForCard } from "./lib/pricing";

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
  const salePrice = discountedPriceForCard(card);
  const discount = discountPercentForCard(card);

  return (
    <article className="market-card">
      <Link className="card-link" href={`/cards/${card.slug}`} aria-label={`View ${card.productName}`}>
        <div className="visual-wrap">
          <div className="badge">{card.badge}</div>
          <span className="wish-button" aria-label={`Save ${card.productName}`}>
            ♡
          </span>
          <div className="real-card" style={{ "--card-color": card.color } as React.CSSProperties}>
            <span className="watermark">@KarryCards</span>
            <span className="card-type">Gift Card</span>
            <strong>{card.brand}</strong>
            <small>{card.productName}</small>
            <em>{money(salePrice)}</em>
            <i />
          </div>
        </div>

        <div className="market-copy">
          <span className="vendor">{card.brand.toUpperCase()}</span>
          <h3>{card.productName}</h3>
          <div className="rating">
            <span>{card.rating.toFixed(1)} / 5</span>
            <small>({card.reviews.toLocaleString()} reviews)</small>
          </div>
          <p className="delivery">Instant email delivery</p>
          <div className="price-line">
            <strong>{money(salePrice)}</strong>
            <span>USD</span>
          </div>
          <div className="discount-line">
            <del>{money(card.price)}</del>
            <span>{discount.toFixed(2)}% OFF</span>
          </div>
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

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState(fallbackCatalog);
  const [currentPage, setCurrentPage] = useState(1);
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

  const filteredCards = useMemo(() => {
    return catalog.giftCards.filter((card) => {
      const matchesCategory = activeCategory === "All" || card.category === activeCategory;
      const matchesQuery = `${card.brand} ${card.productName}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, catalog.giftCards, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, query]);

  const cardsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / cardsPerPage));
  const visibleCards = filteredCards.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);

  const heroCards = useMemo(() => {
    const preferred = ["roblox", "xbox", "playstation"];
    const selected = preferred
      .map((slug) => catalog.giftCards.find((card) => card.slug === slug))
      .filter(Boolean) as GiftCard[];

    return selected.length === 3 ? selected : catalog.giftCards.slice(3, 6);
  }, [catalog.giftCards]);

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
        cartCount={cart.length}
        categories={catalog.categories}
        onQueryChange={setQuery}
        query={query}
      />

      <main>
        <section className="hero-store">
          <div className="hero-copy">
            {/*<p className="eyebrow">Trusted digital gift cards</p>*/}
            <h1>Gift cards you can actually trust</h1>
            <p>Browse gaming, shopping, food, streaming, beauty, travel, and prepaid gift cards - the KarryCards way.</p>
            <p>No gimmicks! No guesswork! Just KarryCards.</p>
            <div className="hero-actions">
              <Link className="button green" href="/our-digital-gift-cards">Shop Now</Link>
              <Link className="button orange" href="/about-us">Read More</Link>
              {/*<Link className="button orange" href="/checkout">Go to cart</Link>*/}
            </div>
          </div>

          <div className="hero-cards">
            {heroCards.map((card, index) => (
              <Link className="sample-card-link" href={`/cards/${card.slug}`} key={card.slug}>
                <div className={`sample-card hero-card-${index + 1}`} style={{ "--card-color": card.color } as React.CSSProperties}>
                  <span>@KarryCards</span>
                  <strong>{card.brand}</strong>
                  <small>{money(card.price)}</small>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="shop-page" id="catalog">
          <aside className="filters-panel">
            <div className="filters-heading">
              <strong>Filters</strong>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setQuery("");
                }}
              >
                Clear all
              </button>
            </div>

            <div className="filter-group">
              <h3>Category</h3>
              {["All", ...catalog.categories.map((category) => category.name)].map((category) => (
                <label key={category}>
                  <input checked={activeCategory === category} onChange={() => setActiveCategory(category)} type="checkbox" />
                <span>{category}</span>
                  <small>({category === "All" ? catalog.giftCards.length : catalog.giftCards.filter((card) => card.category === category).length})</small>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h3>Price range</h3>
              <div className="range-line"><span /></div>
              <div className="range-values">
                <span>$5</span>
                <span>Up to $200</span>
              </div>
            </div>

            <div className="filter-group">
              <h3>Availability</h3>
              {["In Stock", "Featured Cards", "Popular Cards"].map((item, index) => (
                <label key={item}>
                  <input defaultChecked={index === 0} type="checkbox" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </aside>

          <section className="catalog-panel">
            <div className="catalog-toolbar">
              <p>Showing {visibleCards.length} of {filteredCards.length} gift cards</p>
             {/*<div className="toolbar-actions">
                <button type="button">Sort by: <strong>Most Popular</strong></button>
                <button type="button">Per page: <strong>4</strong></button>
              </div>*/}
            </div>

            <div className="product-grid marketplace">
              {visibleCards.map((card) => (
                <ProductCard
                  card={card}
                  key={`${card.slug}-${card.productName}`}
                  quantity={cart.filter((item) => item.slug === card.slug).length}
                  onAdd={addToCart}
                  onDecrease={decreaseCart}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="pagination-row">
                <button disabled={currentPage === 1} type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                  Next
                </button>
              </div>
            ) : null}
          </section>
        </section>
      </main>
      <CartToast message={toastMessage} />
      <Footer />
    </>
  );
}
