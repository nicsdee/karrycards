"use client";

import { Bitcoin, CircleDollarSign, Copy, ExternalLink, LockKeyhole, Minus, Plus, ShieldCheck, ShoppingCart, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Nav from "../components/nav";
import { GiftCard } from "../data";
import { fallbackCatalog } from "../lib/catalog";

type CartItem = GiftCard & {
  amount: number;
  id: string;
};

type PaymentMethod = {
  id: string;
  coin: string;
  network: string;
  label: string;
  caption: string;
  preferred?: boolean;
};

type CryptoPayment = {
  provider: "CryptoRefills";
  label: string;
  coin: string;
  network: string;
  walletAddress?: string;
  coinAmount?: string;
  paymentUrl?: string;
  amount: number;
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

const paymentMethods: PaymentMethod[] = [
  { id: "usdc-solana", coin: "USDC", network: "Solana", label: "USDC", caption: "Solana", preferred: true },
  { id: "usdt-tron", coin: "USDT", network: "Tron", label: "USDT", caption: "Tron" },
  { id: "usdt-solana", coin: "USDT", network: "Solana", label: "USDT", caption: "Solana" },
  { id: "btc-lightning", coin: "BTC", network: "Lightning", label: "BTC", caption: "Lightning" },
  { id: "usdc-base", coin: "USDC", network: "Base", label: "USDC", caption: "Base" },
  { id: "usdc-polygon", coin: "USDC", network: "Polygon", label: "USDC", caption: "Polygon" },
  { id: "eth-mainnet", coin: "ETH", network: "ETH Mainnet", label: "ETH", caption: "Mainnet" },
  { id: "sol-solana", coin: "SOL", network: "Solana", label: "SOL", caption: "Solana" }
];

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentMethods[0]);
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [cryptoPayment, setCryptoPayment] = useState<CryptoPayment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

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
    setCopyMessage("");
    setCryptoPayment(null);
  }, [paymentMethod.id]);

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
  const total = useMemo(() => Number(subtotal.toFixed(2)), [subtotal]);

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

  async function copyWallet() {
    if (!cryptoPayment?.walletAddress) return;
    await navigator.clipboard.writeText(cryptoPayment.walletAddress);
    setCopyMessage("Payment address copied");
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setCopyMessage("");
    setMessage(`Creating CryptoRefills ${paymentMethod.label} order...`);

    const payload = {
      customer: {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone")
      },
      items: groupedCart.map((item) => ({
        slug: item.slug,
        amount: item.amount,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch("/api/payments/crypto/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          ...payload,
          payment: {
            coin: paymentMethod.coin,
            network: paymentMethod.network
          }
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Crypto order could not be created.");
        return;
      }

      window.localStorage.setItem("karrycards-last-order", data.order.orderNumber);
      setCryptoPayment(data.payment);
      setMessage(`Order ${data.order.orderNumber} created. Complete the CryptoRefills payment within the payment window.`);
    } catch {
      setMessage("CryptoRefills is not reachable. Please try again.");
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
            <p className="checkout-intro">Pay with CryptoRefills-supported crypto. CryptoRefills handles the payment invoice and product delivery.</p>

            <div className="payment-method-grid" role="tablist" aria-label="Payment method">
              {paymentMethods.map((method) => (
                <button
                  className={paymentMethod.id === method.id ? "active" : ""}
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                >
                  {method.coin === "BTC" ? <Bitcoin size={27} /> : <CircleDollarSign size={27} />}
                  <span>
                    <strong>{method.label}{method.preferred ? " Best" : ""}</strong>
                    <small>{method.caption}</small>
                  </span>
                </button>
              ))}
            </div>

            <form className="payment-form" onSubmit={submitOrder}>
              <div className="form-grid customer-grid">
                <label>
                  Full name
                  <input name="name" required placeholder="Name on order" />
                </label>
                <label>
                  Email
                  <input name="email" required type="email" placeholder="name@example.com" />
                </label>
                <label>
                  Phone for alerts
                  <input name="phone" inputMode="tel" placeholder="+1 555 000 0000" />
                </label>
              </div>

              <div className="crypto-box crypto-payment-box">
                <strong>{paymentMethod.label} payment on {paymentMethod.network}</strong>
                <p>Create the order, then pay the exact CryptoRefills invoice amount for {money(total)} in gift cards.</p>
                {cryptoPayment ? (
                  <div className="wallet-box live-wallet-box">
                    {cryptoPayment.coinAmount ? (
                      <span>{cryptoPayment.coinAmount} {cryptoPayment.coin} on {cryptoPayment.network}</span>
                    ) : null}
                    {cryptoPayment.walletAddress ? <span>{cryptoPayment.walletAddress}</span> : null}
                    {cryptoPayment.walletAddress ? <button type="button" onClick={copyWallet}><Copy size={15} /> Copy</button> : null}
                    {cryptoPayment.paymentUrl ? <a href={cryptoPayment.paymentUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open payment</a> : null}
                    <em>{copyMessage || cryptoPayment.instructions}</em>
                  </div>
                ) : null}
              </div>

              <button className="pay-button" disabled={cart.length === 0 || isSubmitting} type="submit">
                {isSubmitting ? "Preparing payment..." : `Create ${paymentMethod.label} order`}
              </button>
              <p className="secure-note"><LockKeyhole size={15} /> CryptoRefills handles payment confirmation and gift card delivery.</p>
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
              <span>Subtotal <strong>{money(subtotal)}</strong></span>
              <span>CryptoRefills checkout fee <strong>Shown before payment</strong></span>
              <span className="grand-total">Total <strong>{money(total)}</strong></span>
            </div>
            <div className="summary-trust">
              <ShieldCheck size={19} />
              <span>Payment confirmation protects your order before supplier delivery.</span>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
