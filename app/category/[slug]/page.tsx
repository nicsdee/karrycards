"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CartToast from "../../components/CartToast";
import Footer from "../../components/Footer";
import Nav from "../../components/nav";
import { Category, GiftCard } from "../../data";
import { fallbackCatalog, fetchCatalog, fetchCategory } from "../../lib/catalog";

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
  return (
    <article className="market-card">
      <Link className="card-link" href={`/cards/${card.slug}`}>
        <div className="visual-wrap">
          <div className="badge">{card.badge}</div>
          <div className="real-card" style={{ "--card-color": card.color } as React.CSSProperties}>
            <span className="watermark">@KarryCards</span>
            <span className="card-type">Gift Card</span>
            <strong>{card.brand}</strong>
            <small>{card.productName}</small>
            <em>{money(card.price)}</em>
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
            <strong>{money(card.price)}</strong>
            <span>USD</span>
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

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const fallbackCategory = fallbackCatalog.categories.find((item) => item.slug === params.slug) || fallbackCatalog.categories[0];
  const [categories, setCategories] = useState<Category[]>(fallbackCatalog.categories);
  const [category, setCategory] = useState<Category>(fallbackCategory);
  const [categoryCards, setCategoryCards] = useState<GiftCard[]>(
    fallbackCatalog.giftCards.filter((card) => card.categorySlug === fallbackCategory.slug)
  );
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchCatalog()
      .then((catalog) => setCategories(catalog.categories))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const nextFallback = fallbackCatalog.categories.find((item) => item.slug === params.slug) || fallbackCatalog.categories[0];
    setCategory(nextFallback);
    setCategoryCards(fallbackCatalog.giftCards.filter((card) => card.categorySlug === nextFallback.slug));

    fetchCategory(params.slug)
      .then((data) => {
        setCategory(data.category);
        setCategoryCards(data.giftCards);
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

  const cards = useMemo(
    () =>
      categoryCards.filter((card) => {
        const matchesCategory = card.categorySlug === category.slug;
        const matchesQuery = `${card.brand} ${card.productName}`.toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [category.slug, categoryCards, query]
  );

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
        activeSlug={category.slug}
        cartCount={cart.length}
        categories={categories}
        onQueryChange={setQuery}
        query={query}
        searchPlaceholder={`Search ${category.navLabel}`}
      />

      <main className="category-page">
        <section className="category-hero" style={{ "--category-color": category.color } as React.CSSProperties}>
          <p className="eyebrow">{category.navLabel}</p>
          <h1>{category.navLabel} gift cards</h1>
          <p>{category.description}</p>
        </section>
        <section className="catalog-panel category-catalog">
          <div className="catalog-toolbar">
            <p>Showing {cards.length} gift cards</p>
          </div>
          <div className="product-grid marketplace">
            {cards.map((card) => (
              <ProductCard
                card={card}
                key={card.slug}
                quantity={cart.filter((item) => item.slug === card.slug).length}
                onAdd={addToCart}
                onDecrease={decreaseCart}
              />
            ))}
          </div>
        </section>
      </main>
      <CartToast message={toastMessage} />
      <Footer />
    </>
  );
}
