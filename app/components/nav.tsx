"use client";

import { Menu, Search, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Category } from "../data";

type NavProps = {
  activeSlug?: string;
  cartCount?: number;
  categories: Category[];
  onQueryChange?: (value: string) => void;
  query?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  variant?: "home" | "standard";
};

export default function Nav({
  activeSlug,
  cartCount,
  categories,
  onQueryChange,
  query,
  searchPlaceholder = "Search your card here",
  showSearch = true
}: NavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState("");
  const [storedCartCount, setStoredCartCount] = useState(0);
  const searchValue = query ?? localQuery;
  const visibleCartCount = cartCount ?? storedCartCount;

  useEffect(() => {
    if (typeof cartCount === "number") return;

    const saved = window.localStorage.getItem("karrycards-cart");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as unknown[];
      setStoredCartCount(Array.isArray(parsed) ? parsed.length : 0);
    } catch {
      setStoredCartCount(0);
    }
  }, [cartCount]);

  function updateSearch(value: string) {
    if (onQueryChange) {
      onQueryChange(value);
      return;
    }

    setLocalQuery(value);
  }

  return (
    <header className="market-header home-header">
      <div className="header-main">
        <button className="mobile-menu" type="button" aria-label="Open menu" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <Link className="retail-brand navbar-brand" href="/" aria-label="KarryCards home">
           
          <Image className="navbar-logo" src="/logos/logo4.svg" alt="KarryCards" width={360} height={100} priority />

        </Link>

        <nav className={`home-nav ${menuOpen ? "open" : ""}`} aria-label="Main menu">
          <Link className={pathname === "/" ? "active" : ""} href="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link className={pathname === "/about-us" ? "active" : ""} href="/about-us" onClick={() => setMenuOpen(false)}>
            About Us
          </Link>
          <Link
            className={pathname === "/our-digital-gift-cards" ? "active" : ""}
            href="/our-digital-gift-cards"
            onClick={() => setMenuOpen(false)}
          >
            Our Cards
          </Link>
          {categories.map((category) => (
            <Link
              className={activeSlug === category.slug ? "active" : ""}
              href={`/category/${category.slug}`}
              key={category.slug}
              onClick={() => setMenuOpen(false)}
            >
              {category.navLabel}
            </Link>
          ))}
        </nav>

        {showSearch ? (
          <label className="header-search compact-home-search">
            <Search size={17} />
            <input value={searchValue} onChange={(event) => updateSearch(event.target.value)} placeholder={searchPlaceholder} type="search" />
          </label>
        ) : null}

        <Link className={`cart-link ${pathname === "/checkout" ? "active" : ""}`} href="/checkout">
          <ShoppingCart size={21} />
          <span>Cart</span>
          <strong>{visibleCartCount}</strong>
        </Link>
      </div>
    </header>
  );
}
