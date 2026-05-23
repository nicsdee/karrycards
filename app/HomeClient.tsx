"use client";

import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Gift,
  LockKeyhole,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Truck,
  WalletCards
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandLogoImage } from "./components/BrandLogoImage";
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

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Transparent checkout",
    copy: "Clear totals, order status, and policy links before customers pay."
  },
  {
    icon: Clock3,
    title: "Fast digital delivery",
    copy: "Paid orders move into fulfillment for delivery to the customer's email."
  },
  {
    icon: LockKeyhole,
    title: "Privacy-aware buying",
    copy: "Simple customer details, secure payment flow, and no noisy upsells."
  }
];

const shoppingMoments = [
  "Birthday gifts",
  "Last-minute rewards",
  "Gaming top-ups",
  "Employee appreciation",
  "Streaming night",
  "Food delivery"
];

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
    <article className="market-card home-product-card">
      <Link className="card-link" href={`/cards/${card.slug}`} aria-label={`View ${card.productName}`}>
        <div className="visual-wrap">
          <div className="badge">{card.badge}</div>
          <div className={`real-card real-card-${card.slug}`} style={{ "--card-color": card.color } as React.CSSProperties}>
            <span className="watermark">@KarryCards</span>
            <BrandLogoImage brand={card.brand} className="card-logo" />
            <span className="brand-mark" aria-hidden="true">{card.brand.slice(0, 1)}</span>
            <span className="card-type">Digital Gift Card</span>
            <strong>{card.brand}</strong>
            <small>{card.productName}</small>
            <em>{money(card.price)}</em>
            <i />
          </div>
        </div>

        <div className="market-copy">
          <span className="vendor">{card.category.toUpperCase()}</span>
          <h3>{card.productName}</h3>
          <div className="rating">
            <Star size={15} fill="currentColor" />
            <span>{card.rating.toFixed(1)}</span>
            <small>({card.reviews.toLocaleString()} reviews)</small>
          </div>
          <p className="delivery">Email delivery after payment confirmation</p>
          <div className="price-line">
            <strong>{money(salePrice)}</strong>
            <span>USD</span>
          </div>
          {discount > 0 ? (
            <div className="discount-line">
              <del>{money(card.price)}</del>
              <span>{discount.toFixed(2)}% OFF</span>
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

export default function HomeClient() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState(fallbackCatalog);
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [heroOffset, setHeroOffset] = useState(0);

  useEffect(() => {
    fetchCatalog()
      .then(setCatalog)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search") || params.get("q") || "";
    if (!search) return;

    setQuery(search);
    setActiveCategory("All");
    window.setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ block: "start" }), 120);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("karrycards-cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved) as CartItem[]);
      } catch {
        setCart([]);
      }
    }
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    window.localStorage.setItem("karrycards-cart", JSON.stringify(cart));
  }, [cart, cartLoaded]);

  const popularCards = useMemo(() => catalog.giftCards.filter((card) => card.popular).slice(0, 8), [catalog.giftCards]);

  useEffect(() => {
    if (!catalog.giftCards.length) return;

    const interval = window.setInterval(() => {
      setHeroOffset((current) => (current + 1) % catalog.giftCards.length);
    }, 1600);

    return () => window.clearInterval(interval);
  }, [catalog.giftCards.length]);

  const heroCards = useMemo(() => {
    const cards = catalog.giftCards;
    if (!cards.length) return [];

    return Array.from({ length: Math.min(4, cards.length) }, (_, index) => cards[(heroOffset + index * 7) % cards.length]);
  }, [catalog.giftCards, heroOffset]);

  const filteredCards = useMemo(() => {
    const search = query.trim().toLowerCase();

    return catalog.giftCards.filter((card) => {
      const matchesCategory = activeCategory === "All" || card.category === activeCategory;
      const searchable = `${card.brand} ${card.productName} ${card.category} ${card.slug} ${card.description}`.toLowerCase();
      const matchesQuery = !search || searchable.includes(search);
      return matchesCategory && matchesQuery;
    }).sort((first, second) => {
      if (!search) return 0;

      const firstBrand = first.brand.toLowerCase();
      const secondBrand = second.brand.toLowerCase();
      const firstProduct = first.productName.toLowerCase();
      const secondProduct = second.productName.toLowerCase();
      const firstScore = firstBrand === search ? 0 : firstBrand.startsWith(search) ? 1 : firstProduct.startsWith(search) ? 2 : firstProduct.includes(search) ? 3 : 4;
      const secondScore = secondBrand === search ? 0 : secondBrand.startsWith(search) ? 1 : secondProduct.startsWith(search) ? 2 : secondProduct.includes(search) ? 3 : 4;
      return firstScore - secondScore || first.brand.localeCompare(second.brand);
    });
  }, [activeCategory, catalog.giftCards, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, query]);

  const cardsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / cardsPerPage));
  const visibleCards = filteredCards.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);

  function addToCart(card: GiftCard) {
    const randomId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

    setCart((current) => [
      ...current,
      {
        ...card,
        amount: card.price,
        id: `${card.slug}-${card.price}-${randomId}`
      }
    ]);
    setToastMessage(`${card.productName} is now in your cart.`);
  }

  function handleSearch(value: string) {
    setQuery(value);
    setActiveCategory("All");

    const search = value.trim();
    const targetUrl = search ? `/?search=${encodeURIComponent(search)}#catalog` : "/";
    window.history.replaceState(null, "", targetUrl);

    if (search) {
      window.setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ block: "start" }), 80);
    }
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
    const timeout = window.setTimeout(() => setToastMessage(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  return (
    <>
      <Nav cartCount={cart.length} categories={catalog.categories} onQueryChange={handleSearch} query={query} />

      <main className="home-page-v2">
        <section className="home-hero-v2" aria-labelledby="home-hero-title">
          <div className="hero-copy-v2">
            <p className="home-kicker">
              <Sparkles size={16} />
              Digital gift cards for US shoppers
            </p>
            <h1 id="home-hero-title">Buy digital gift cards online with confidence.</h1>
            <p>
              Shop popular gift cards for gaming, retail, streaming, food delivery, beauty, and travel. KarryCards keeps the
              experience clear with secure checkout, order tracking, and email delivery after payment confirmation.
            </p>
            <div className="hero-search-panel" role="search">
              <Search size={20} />
              <input
                value={query}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search Roblox, Target, Netflix, Steam..."
                type="search"
                aria-label="Search gift cards"
              />
              <a href="#catalog" aria-label="Browse gift card catalog">
                <ArrowRight size={20} />
              </a>
            </div>
            <div className="hero-actions-v2">
              <Link className="button primary-home-button" href="/our-digital-gift-cards">
                <ShoppingBag size={18} />
                Shop All Cards
              </Link>
              <a className="button secondary-home-button" href="#catalog">
                <Tag size={18} />
                Browse Deals
              </a>
            </div>
            <div className="hero-proof-row" aria-label="KarryCards shopping benefits">
              <span>
                <BadgeCheck size={17} />
                Clear policies
              </span>
              <span>
                <Truck size={17} />
                Digital delivery
              </span>
              <span>
                <CreditCard size={17} />
                Secure checkout
              </span>
            </div>
          </div>

          <div className="hero-showcase-v2" aria-label="Featured gift cards">
            <div className="hero-card-stack-v2">
              {heroCards.map((card, index) => (
                <Link
                  className={`hero-card-preview hero-card-preview-${index + 1} real-card-${card.slug}`}
                  href={`/cards/${card.slug}`}
                  key={`${card.slug}-${heroOffset}-${index}`}
                  style={{ "--card-color": card.color } as React.CSSProperties}
                >
                  <span>{card.category}</span>
                  <b className="hero-card-watermark">@KarryCards</b>
                  <BrandLogoImage brand={card.brand} className="hero-card-logo" />
                  <strong>{card.brand}</strong>
                  <small>{card.productName}</small>
                  <div className="hero-card-price-stack" aria-label={`${money(discountedPriceForCard(card))} sale price, regular price ${money(card.price)}`}>
                    <del>{money(card.price)}</del>
                    <em>{money(discountedPriceForCard(card))}</em>
                  </div>
                </Link>
              ))}
            </div>
            <div className="hero-trust-panel">
              <strong>Ready for real gifting moments</strong>
              <div>
                {shoppingMoments.map((moment) => (
                  <span key={moment}>{moment}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="home-trust-band" aria-label="Why shoppers choose KarryCards">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title}>
                <Icon size={24} />
                <div>
                  <h2>{feature.title}</h2>
                  <p>{feature.copy}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="home-section-shell">
          <div className="section-heading-row">
            <div>
              <p className="home-kicker">
                <Gift size={16} />
                Popular in the USA
              </p>
              <h2>Top gift card picks people buy every week.</h2>
            </div>
            <Link href="/our-digital-gift-cards">
              View all cards
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="popular-strip">
            {popularCards.map((card) => (
              <Link className={`popular-mini-card real-card-${card.slug}`} href={`/cards/${card.slug}`} key={card.slug} style={{ "--card-color": card.color } as React.CSSProperties}>
                <BrandLogoImage brand={card.brand} className="popular-mini-logo" />
                <span />
                <em>@KarryCards</em>
                <strong>{card.brand}</strong>
                <small>{card.category}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section-shell category-home-section">
          <div className="section-heading-row">
            <div>
              <p className="home-kicker">
                <WalletCards size={16} />
                Shop by category
              </p>
              <h2>Find the right card for the right moment.</h2>
            </div>
          </div>
          <div className="home-category-grid">
            {catalog.categories.map((category) => (
              <Link href={`/category/${category.slug}`} key={category.slug} style={{ "--category-color": category.color } as React.CSSProperties}>
                <span>{category.navLabel}</span>
                <strong>{catalog.giftCards.filter((card) => card.categorySlug === category.slug).length} cards</strong>
                <small>{category.description}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="shop-page home-catalog-v2" id="catalog" aria-labelledby="catalog-title">
          <aside className="filters-panel home-filters-v2">
            <div className="filters-heading">
              <strong>Filter cards</strong>
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
              <h3>Good to know</h3>
              {["USD pricing", "Email delivery", "Order tracking"].map((item) => (
                <label key={item}>
                  <input defaultChecked type="checkbox" readOnly />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </aside>

          <section className="catalog-panel">
            <div className="catalog-toolbar home-catalog-toolbar">
              <div>
                <p className="home-kicker">
                  <ShoppingBag size={16} />
                  Digital catalog
                </p>
                <h2 id="catalog-title">Shop digital gift cards online</h2>
                <span>
                  Showing {visibleCards.length} of {filteredCards.length} gift cards
                </span>
              </div>
            </div>

            <div className="product-grid marketplace home-product-grid">
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
              <div className="pagination-row home-pagination">
                <button disabled={currentPage === 1} type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                  <ChevronLeft size={17} />
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button disabled={currentPage === totalPages} type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                  Next
                  <ChevronRight size={17} />
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
