"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Nav from "../components/nav";
import { fallbackCatalog } from "../lib/catalog";

type AdminOrder = {
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    slug: string;
    brand: string;
    productName: string;
    amount: number;
    quantity: number;
  }>;
  currency: "USD";
  subtotal: number;
  serviceFee: number;
  total: number;
  status: string;
  supplierStatus: string;
  nowPayments?: {
    invoiceId?: string;
    paymentId?: string;
    purchaseId?: string;
    status?: string;
    payCurrency?: string;
  };
  deliveries: Array<{
    id: string;
    brand: string;
    productName: string;
    amount: number;
    code?: string;
    pin?: string;
    claimUrl?: string;
    status: string;
    message?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

type OrdersResponse = {
  totals: {
    orders: number;
    paid: number;
    pending: number;
    delivered: number;
  };
  orders: AdminOrder[];
};

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
}

function orderAge(date: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return "now";
  if (minutes === 1) return "1 min";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.round(minutes / 60)} hr`;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [totals, setTotals] = useState<OrdersResponse["totals"] | null>(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("Enter your admin token.");
  const [isLoading, setIsLoading] = useState(false);
  const [busyOrder, setBusyOrder] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("karrycards-admin-token") || "";
    if (saved) {
      setToken(saved);
      loadOrders(saved);
    }
  }, []);

  const paidQueue = useMemo(() => {
    return orders.filter((order) => order.status === "paid" && order.supplierStatus !== "fulfilled");
  }, [orders]);

  const chartMax = Math.max(totals?.orders ?? 0, 1);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextToken = String(form.get("token") || "");
    window.localStorage.setItem("karrycards-admin-token", nextToken);
    setToken(nextToken);
    await loadOrders(nextToken);
  }

  async function loadOrders(authToken = token) {
    if (!authToken) return;

    setIsLoading(true);
    setMessage("Loading orders...");

    try {
      const response = await fetch("/api/admin/orders", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not load orders.");
        return;
      }

      setOrders(data.orders ?? []);
      setTotals(data.totals ?? null);
      setMessage(`${data.totals?.paid ?? 0} order(s) waiting.`);
    } catch {
      setMessage("Admin API is not reachable.");
    } finally {
      setIsLoading(false);
    }
  }

  async function deliverOrder(event: FormEvent<HTMLFormElement>, order: AdminOrder) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusyOrder(order.orderNumber);
    setMessage(`Saving ${order.orderNumber}...`);

    const deliveries = order.items.map((item, index) => ({
      brand: item.brand,
      productName: item.productName,
      amount: item.amount,
      code: String(form.get(`code-${index}`) || ""),
      pin: String(form.get(`pin-${index}`) || ""),
      claimUrl: String(form.get(`claimUrl-${index}`) || ""),
      message: String(form.get(`message-${index}`) || "Gift card delivered.")
    }));

    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.orderNumber)}/deliver`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ deliveries })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Delivery could not be saved.");
        return;
      }

      setMessage(`${order.orderNumber} delivered.`);
      await loadOrders();
    } catch {
      setMessage("Delivery API is not reachable.");
    } finally {
      setBusyOrder("");
    }
  }

  function logout() {
    window.localStorage.removeItem("karrycards-admin-token");
    setToken("");
    setOrders([]);
    setTotals(null);
    setMessage("Signed out.");
  }

  return (
    <>
      <Nav categories={fallbackCatalog.categories} showSearch={false} />
      <main className="ops-page">
        <section className="ops-shell">
          <header className="ops-topbar">
            <div>
              <p className="eyebrow">Fulfillment</p>
              <h1>Order desk</h1>
              <span>{message}</span>
            </div>
            <div className="ops-actions">
              {token ? <button type="button" onClick={() => loadOrders()} disabled={isLoading}>Refresh</button> : null}
              {token ? <button type="button" onClick={logout}>Lock</button> : null}
              <Link href="/">Store</Link>
            </div>
          </header>

          {!token ? (
            <form className="ops-login" onSubmit={login}>
              <label>
                Admin token
                <input name="token" required type="password" placeholder="Private token" />
              </label>
              <button disabled={isLoading} type="submit">
                {isLoading ? "Opening..." : "Open desk"}
              </button>
            </form>
          ) : (
            <>
              <section className="ops-metrics" aria-label="Order metrics">
                {[
                  ["Waiting", totals?.paid ?? 0],
                  ["Pending", totals?.pending ?? 0],
                  ["Delivered", totals?.delivered ?? 0],
                  ["Total", totals?.orders ?? 0]
                ].map(([label, value]) => (
                  <article key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </section>

              <section className="ops-chart" aria-label="Order activity">
                {[
                  ["Waiting", totals?.paid ?? 0],
                  ["Pending", totals?.pending ?? 0],
                  ["Delivered", totals?.delivered ?? 0]
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <i style={{ width: `${Math.max(8, (Number(value) / chartMax) * 100)}%` }} />
                    <strong>{value}</strong>
                  </div>
                ))}
              </section>

              <section className="ops-grid">
                <div className="ops-column">
                  <h2>Waiting</h2>
                  {paidQueue.map((order) => (
                    <form className="ops-order" key={order.orderNumber} onSubmit={(event) => deliverOrder(event, order)}>
                      <div className="ops-order-head">
                        <span>
                          <strong>{order.orderNumber}</strong>
                          <small>{orderAge(order.updatedAt)} ago</small>
                        </span>
                        <em>{formatMoney(order.total, order.currency)}</em>
                      </div>
                      <div className="ops-order-meta">
                        <span>Cost {formatMoney(order.subtotal)}</span>
                        <span>Discount {formatMoney(Math.abs(order.serviceFee))}</span>
                        <span>{order.nowPayments?.payCurrency || order.nowPayments?.status || "paid"}</span>
                      </div>

                      {order.items.map((item, index) => (
                        <div className="ops-delivery" key={`${order.orderNumber}-${item.slug}-${index}`}>
                          <strong>{item.productName}</strong>
                          <small>{item.quantity} x {formatMoney(item.amount)}</small>
                          <input name={`code-${index}`} placeholder="Code" />
                          <input name={`pin-${index}`} placeholder="PIN" />
                          <input name={`claimUrl-${index}`} placeholder="Claim URL" />
                          <input name={`message-${index}`} placeholder="Note" />
                        </div>
                      ))}

                      <button disabled={busyOrder === order.orderNumber} type="submit">
                        {busyOrder === order.orderNumber ? "Saving..." : "Deliver"}
                      </button>
                    </form>
                  ))}
                  {!paidQueue.length ? <p className="ops-empty">No paid orders waiting.</p> : null}
                </div>

                <div className="ops-column">
                  <h2>Recent</h2>
                  {orders.slice(0, 8).map((order) => (
                    <article className="ops-recent" key={`recent-${order.orderNumber}`}>
                      <span>
                        <strong>{order.orderNumber}</strong>
                        <small>{order.items.map((item) => item.brand).join(", ")}</small>
                      </span>
                      <em>{order.status}</em>
                    </article>
                  ))}
                  {!orders.length ? <p className="ops-empty">No orders yet.</p> : null}
                </div>
              </section>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
