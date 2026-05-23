"use client";

import { ExternalLink, LockKeyhole, Minus, Plus, ShieldCheck, ShoppingCart, Trash2, WalletCards } from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Nav from "../components/nav";
import { GiftCard } from "../data";
import { fallbackCatalog } from "../lib/catalog";
import { quoteCart } from "../lib/pricing";

type CartItem = GiftCard & {
  amount: number;
  id: string;
};

type CryptoPayment = {
  provider: "NOWPayments";
  checkoutUrl: string;
  amount: number;
  supplierCost: number;
  profit: number;
  currency: string;
  instructions: string;
};

function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
}

const cryptoIcons = [
  { code: "BTC", name: "Bitcoin", icon: "/payment-icons/btc.svg" },
  { code: "USDT", name: "Tether", icon: "/payment-icons/usdt.svg" },
  { code: "USDC", name: "USD Coin", icon: "/payment-icons/usdc.svg" },
  { code: "ETH", name: "Ethereum", icon: "/payment-icons/eth.svg" },
  { code: "TRX", name: "Tron", icon: "/payment-icons/trx.svg" },
  { code: "BNB", name: "BNB", icon: "/payment-icons/bnb.svg" },
  { code: "LTC", name: "Litecoin", icon: "/payment-icons/ltc.svg" },
  { code: "TON", name: "Toncoin", icon: "/payment-icons/ton.svg" },
  { code: "DOGE", name: "Dogecoin", icon: "/payment-icons/doge.svg" },
  { code: "SOL", name: "Solana", icon: "/payment-icons/sol.svg" },
  { code: "XRP", name: "XRP", icon: "/payment-icons/xrp.svg" },
  { code: "ADA", name: "Cardano", icon: "/payment-icons/ada.svg" },
  { code: "POL", name: "Polygon", icon: "/payment-icons/matic.svg" },
  { code: "BCH", name: "Bitcoin Cash", icon: "/payment-icons/bch.svg" },
  { code: "AVAX", name: "Avalanche", icon: "/payment-icons/avax.svg" }
];

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [cryptoPayment, setCryptoPayment] = useState<CryptoPayment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [checkoutActivityId, setCheckoutActivityId] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("karrycards-cart");
    if (saved) setCart(JSON.parse(saved) as CartItem[]);
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    window.localStorage.setItem("karrycards-cart", JSON.stringify(cart));
  }, [cart, cartLoaded]);

  useEffect(() => {
    setMessage("");
    setCryptoPayment(null);
  }, [cart.length]);

  const groupedCart = useMemo(() => {
    const groups = new Map<string, CartItem & { quantity: number }>();
    for (const item of cart) {
      const key = `${item.slug}-${item.amount}`;
      const current = groups.get(key);
      if (current) {
        groups.set(key, { ...current, quantity: current.quantity + 1 });
      } else {
        groups.set(key, { ...item, quantity: 1 });
      }
    }
    return Array.from(groups.values());
  }, [cart]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.amount, 0), [cart]);
  const priceQuote = useMemo(() => quoteCart(groupedCart), [groupedCart]);
  const total = priceQuote.total;
  const discount = priceQuote.discount;
  const activityItems = useMemo(() => groupedCart.map((item) => ({
    slug: item.slug,
    amount: item.amount,
    quantity: item.quantity
  })), [groupedCart]);

  useEffect(() => {
    if (!cartLoaded || !activityItems.length) return;

    const savedActivityId = window.localStorage.getItem("karrycards-checkout-activity-id") || checkoutActivityId;
    fetch("/api/checkout/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        id: savedActivityId || undefined,
        items: activityItems
      })
    })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data?.activity?.id) return;
        setCheckoutActivityId(data.activity.id);
        window.localStorage.setItem("karrycards-checkout-activity-id", data.activity.id);
      })
      .catch(() => undefined);
  }, [activityItems, cartLoaded, checkoutActivityId]);

  function removeOne(slug: string, amount: number) {
    setCart((current) => {
      const index = current.findIndex((item) => item.slug === slug && item.amount === amount);
      if (index === -1) return current;
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function addOne(item: CartItem) {
    setCart((current) => [
      ...current,
      {
        ...item,
        id: `${item.slug}-${item.amount}-${crypto.randomUUID()}`
      }
    ]);
  }

  function removeAll(slug: string, amount: number) {
    setCart((current) => current.filter((item) => item.slug !== slug || item.amount !== amount));
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Creating crypto checkout...");
    const form = new FormData(event.currentTarget);
    const customerName = String(form.get("customerName") || "Customer").trim();
    const customerEmail = String(form.get("customerEmail") || "").trim();
    const customerPhone = String(form.get("customerPhone") || "").trim();

    if (!customerEmail || !customerEmail.includes("@")) {
      setIsSubmitting(false);
      setMessage("Enter the email address that should receive the gift card code.");
      return;
    }

    const payload = {
      checkoutActivityId: checkoutActivityId || window.localStorage.getItem("karrycards-checkout-activity-id") || undefined,
      customer: {
        name: customerName || "Customer",
        email: customerEmail,
        phone: customerPhone || undefined
      },
      items: groupedCart.map((item) => ({
        slug: item.slug,
        amount: item.amount,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch("/api/payments/nowpayments/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Crypto checkout could not be created.");
        return;
      }

      window.localStorage.setItem("karrycards-last-order", data.order.orderNumber);
      window.localStorage.removeItem("karrycards-checkout-activity-id");
      setCryptoPayment(data.payment);
      setMessage(`Order ${data.order.orderNumber} created. Redirecting to crypto checkout...`);
      window.location.href = data.payment.checkoutUrl;
    } catch {
      setMessage("Crypto checkout is not reachable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Nav cartCount={cart.length} categories={fallbackCatalog.categories} showSearch={false} />
      <main className="checkout-page">
        <section className="checkout-layout checkout-layout-polished">
          <div className="payment-panel">
            <p className="eyebrow">Secure checkout</p>
            <h1>Complete your order</h1>
            <p className="checkout-intro"> Pay the discounted price using your preferred coin. The payment page handles coin selection, wallet address, and QR code. Your receipt and gift card code are delivered to the email you enter below after blockchain confirmation.</p>
           

            <form className="payment-form" onSubmit={submitOrder}>
              <div className="checkout-customer-box">
                <strong>Delivery email</strong>
                <label>
                  Full name
                  <input name="customerName" autoComplete="name" placeholder="Customer name" />
                </label>
                <label>
                  Email for gift card code
                  <input name="customerEmail" autoComplete="email" inputMode="email" placeholder="name@example.com" required type="email" />
                </label>
                <label>
                  Phone optional
                  <input name="customerPhone" autoComplete="tel" inputMode="tel" placeholder="Optional phone number" />
                </label>
              </div>

              <div className="crypto-box crypto-payment-box">
                <strong><WalletCards size={18} /> Crypto checkout</strong>
                <p>Your gift card code is sent to your email after blockchain confirmation and fulfillment.</p>
                <div className="checkout-coin-row" aria-label="Popular supported coins">
                  {cryptoIcons.map((coin) => (
                    <span className="checkout-coin" key={coin.code} title={coin.name}>
                      <Image src={coin.icon} alt={coin.name} width={38} height={38} />
                    </span>
                  ))}
                </div>
                {cryptoPayment ? (
                  <div className="wallet-box live-wallet-box">
                    <span>{money(cryptoPayment.amount)} crypto checkout</span>
                    <a href={cryptoPayment.checkoutUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open payment</a>
                    <em>{cryptoPayment.instructions}</em>
                  </div>
                ) : null}
              </div>

              <button className="pay-button" disabled={cart.length === 0 || isSubmitting} type="submit">
                {isSubmitting ? "Preparing payment..." : `Continue to payment - ${money(total)}`}
              </button>
              <p className="secure-note"><LockKeyhole size={15} /> Fully automatic email delivery. Fulfillment begins only after blockchain confirmation, then your gitft card code arrives instantly..</p>
              {message ? <p className="checkout-message">{message}</p> : null}
            </form>
          </div>

          <aside className="order-summary order-summary-polished">
            <div className="summary-title">
              <ShoppingCart size={22} />
              <h2>Your cart</h2>
            </div>
            <div className="summary-items">
              {cart.length === 0 ? (
                <p className="empty-state">Your cart is empty.</p>
              ) : (
                groupedCart.map((item) => (
                  <div className="summary-item cart-line-card" key={`${item.slug}-${item.amount}`}>
                    <div className="cart-line-mark" style={{ background: item.color }} aria-hidden="true">
                      {item.brand.slice(0, 1)}
                    </div>
                    <span>
                      <strong>{item.productName}</strong>
                      <small>{item.category} | {money(item.amount)} each</small>
                    </span>
                    <strong>{money(item.amount * item.quantity)}</strong>
                    <div className="cart-stepper">
                      <button type="button" onClick={() => removeOne(item.slug, item.amount)} aria-label={`Remove one ${item.productName}`}><Minus size={15} /></button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => addOne(item)} aria-label={`Add one ${item.productName}`}><Plus size={15} /></button>
                      <button className="remove-line" type="button" onClick={() => removeAll(item.slug, item.amount)} aria-label={`Remove ${item.productName}`}><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="summary-totals">
              <span>Current price <del>{money(subtotal)}</del></span>
              <span>Discount <strong>-{money(discount)}</strong></span>
              <span className="grand-total">Total <strong>{money(total)}</strong></span>
            </div>
            <div className="summary-trust">
              <ShieldCheck size={19} />
              <span>Payment confirmation protects your order before email delivery.</span>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
