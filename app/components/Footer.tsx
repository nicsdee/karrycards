"use client";

import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { categories } from "../data";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    if (!email || !email.includes("@") || !email.includes(".")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      window.setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
      return;
    }

    setStatus("loading");
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    setStatus("success");
    setMessage("You are on the update list.");
    setEmail("");
    window.setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 5000);
  };

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="retail-brand footer-logo-link" href="/" aria-label="KarryCards home">
            <Image className="footer-logo" src="/logos/logo5.svg" alt="KarryCards" width={520} height={70} />
          </Link>
          <p className="footer-lead">Trusted digital gift cards with crypto checkout, fast manual fulfillment, and order tracking.</p>
        </div>

        <div className="footer-column">
          <h2>Shop</h2>
          {categories.slice(0, 8).map((category) => (
            <Link href={`/category/${category.slug}`} key={category.slug}>
              {category.navLabel}
            </Link>
          ))}
        </div>

        <div className="footer-column">
          <h2>Support</h2>
          <Link href="/about-us">About us</Link>
          <Link href="/checkout">Order checkout</Link>
          <Link href="/order-status">Order status</Link>
          <Link href="/terms">Terms & conditions</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/refunds">Refund policy</Link>
          <a href="mailto:info@karrycards.com"><Mail size={15} /> info@karrycards.com</a>
        </div>

        <div className="footer-column footer-newsletter">
          <h2>Payments & alerts</h2>
          <p>Customers pay through secure crypto checkout. After confirmation, paid orders enter the fulfillment desk for quick code delivery.</p>
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Email for updates"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={status === "loading"}
            />
            <button type="button" onClick={handleSubscribe} disabled={status === "loading"}>
              {status === "loading" ? "Joining..." : "Join"}
            </button>
          </div>

          {message ? (
            <div className={`newsletter-message ${status === "success" ? "success" : "error"}`}>
              {status === "success" ? "OK: " : "Notice: "}{message}
            </div>
          ) : null}
        </div>

        <div className="footer-crypto-line">
          <strong>Accepting all crypto payments</strong>
          <div className="payment-icons" aria-label="Crypto payment icons">
            {[
              ["/payment-icons/btc.svg", "BTC"],
              ["/payment-icons/usdt.svg", "USDT"],
              ["/payment-icons/usdc.svg", "USDC"],
              ["/payment-icons/eth.svg", "ETH"],
              ["/payment-icons/trx.svg", "TRX"],
              ["/payment-icons/bnb.svg", "BNB"],
              ["/payment-icons/ltc.svg", "LTC"],
              ["/payment-icons/ton.svg", "TON"],
              ["/payment-icons/doge.svg", "DOGE"],
              ["/payment-icons/sol.svg", "SOL"],
              ["/payment-icons/xrp.svg", "XRP"],
              ["/payment-icons/ada.svg", "ADA"],
              ["/payment-icons/matic.svg", "POL"],
              ["/payment-icons/bch.svg", "BCH"],
              ["/payment-icons/avax.svg", "AVAX"]
            ].map(([icon, label]) => (
              <span className="payment-card coin-card" key={label} title={label}>
                <Image src={icon} alt={label} width={34} height={34} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-links">
          <span>© 2026 KarryCards. All rights reserved.</span>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refunds">Refunds</Link>
        </div>
      </div>
    </footer>
  );
}
