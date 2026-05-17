"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import BrandMark from "../components/BrandMark";
import Footer from "../components/Footer";
import Nav from "../components/nav";
import { Category } from "../data";
import { API_BASE_URL } from "../lib/api";
import { fallbackCatalog, fetchCatalog } from "../lib/catalog";

type Dashboard = {
  totals: {
    categories: number;
    gift_cards: number;
    orders: number;
    pending_orders: number;
    visits_today: number;
  };
};

type GiftCardRow = {
  id: number;
  slug: string;
  brand: string;
  product_name: string;
  base_price: string;
  compare_at_price: string | null;
  brand_color: string;
  description: string | null;
  badge: string;
  is_active: boolean;
  category?: {
    name: string;
    slug: string;
    nav_label: string;
  };
  denominations: Array<{
    amount: string;
    is_active: boolean;
  }>;
};

type AdminPayment = {
  id: number;
  method: string;
  reference: string;
  status: string;
  crypto_address?: {
    asset: string;
    network: string;
    wallet_address: string;
    status: string;
  } | null;
};

type AdminDelivery = {
  id: number;
  order_item_id: number;
  supplier_name: string;
  status: string;
  code?: string | null;
  pin?: string | null;
  claim_url?: string | null;
  instructions?: string | null;
};

type AdminOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: string;
  currency: string;
  status: string;
  supplier_status: string;
  items: Array<{
    id: number;
    brand: string;
    product_name: string;
    amount: string;
    quantity: number;
    delivery_status: string;
  }>;
  payments: AdminPayment[];
  deliveries: AdminDelivery[];
};

type OrdersResponse = {
  data: AdminOrder[];
};

function formatMoney(amount: string | number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: Number(amount) % 1 === 0 ? 0 : 2
  }).format(Number(amount));
}

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [giftCards, setGiftCards] = useState<GiftCardRow[]>([]);
  const [categories, setCategories] = useState<Category[]>(fallbackCatalog.categories);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [message, setMessage] = useState("Sign in to manage KarryCards.");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    const savedToken = window.localStorage.getItem("karrycards-admin-token") || "";
    if (savedToken) {
      setToken(savedToken);
      loadAdmin(savedToken);
    }
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsLoading(true);
    setMessage("Signing in...");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password")
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      window.localStorage.setItem("karrycards-admin-token", data.token);
      setToken(data.token);
      await loadAdmin(data.token);
    } catch {
      setMessage("Backend API is not reachable. Start Laravel on port 8000.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAdmin(authToken = token) {
    if (!authToken) return;

    setIsLoading(true);
    setMessage("Loading admin data...");

    try {
      const headers = adminHeaders(authToken);
      const [dashboardResponse, cardsResponse, ordersResponse, catalogData] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/dashboard`, { headers }),
        fetch(`${API_BASE_URL}/admin/gift-cards`, { headers }),
        fetch(`${API_BASE_URL}/admin/orders`, { headers }),
        fetchCatalog().catch(() => fallbackCatalog)
      ]);

      if ([dashboardResponse.status, cardsResponse.status, ordersResponse.status].some((status) => status === 401 || status === 403)) {
        await logout(false);
        setMessage("Session expired. Please sign in again.");
        return;
      }

      const ordersData = (await ordersResponse.json()) as OrdersResponse;
      setDashboard(await dashboardResponse.json());
      setGiftCards(await cardsResponse.json());
      setOrders(ordersData.data ?? []);
      setCategories(catalogData.categories);
      setMessage("Admin data loaded from protected backend.");
    } catch {
      setMessage("Backend API is not reachable. Start Laravel on port 8000.");
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmPayment(order: AdminOrder) {
    const payment = order.payments[0];
    if (!payment) {
      setMessage(`No payment reference found for ${order.order_number}.`);
      return;
    }

    await runAdminAction(`confirm-${order.id}`, "Confirming payment...", async () => {
      const response = await fetch(`${API_BASE_URL}/admin/payments/confirm`, {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ reference: payment.reference })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Payment confirmation failed.");
      setMessage(`${order.order_number} payment confirmed.`);
    });
  }

  async function startSupplier(order: AdminOrder) {
    await runAdminAction(`supplier-${order.id}`, "Starting supplier workflow...", async () => {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${order.id}/fulfill`, {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ driver: "manual", supplier_name: "Manual supplier" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Supplier workflow could not start.");
      setMessage(`${order.order_number} is ready for manual supplier purchase.`);
    });
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const denominations = String(form.get("denominations") || "")
      .split(",")
      .map((amount) => Number(amount.trim()))
      .filter((amount) => Number.isFinite(amount) && amount > 0);

    await runAdminAction("create-product", "Creating product...", async () => {
      const response = await fetch(`${API_BASE_URL}/admin/gift-cards`, {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({
          category_slug: form.get("category_slug"),
          brand: form.get("brand"),
          product_name: form.get("product_name"),
          brand_color: form.get("brand_color"),
          base_price: Number(form.get("base_price")),
          compare_at_price: form.get("compare_at_price") ? Number(form.get("compare_at_price")) : null,
          badge: form.get("badge") || "New",
          description: form.get("description"),
          denominations
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Product could not be created.");
      event.currentTarget.reset();
      setMessage("Product added.");
    });
  }

  async function updateProduct(event: FormEvent<HTMLFormElement>, card: GiftCardRow) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const denominations = String(form.get("denominations") || "")
      .split(",")
      .map((amount) => Number(amount.trim()))
      .filter((amount) => Number.isFinite(amount) && amount > 0);

    await runAdminAction(`product-${card.id}`, "Saving product...", async () => {
      const response = await fetch(`${API_BASE_URL}/admin/gift-cards/${card.slug}`, {
        method: "PATCH",
        headers: adminJsonHeaders(),
        body: JSON.stringify({
          base_price: Number(form.get("base_price")),
          compare_at_price: form.get("compare_at_price") ? Number(form.get("compare_at_price")) : null,
          badge: form.get("badge"),
          is_active: form.get("is_active") === "true",
          denominations
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Product could not be saved.");
      setMessage(`${card.product_name} updated.`);
    });
  }

  async function deleteProduct(card: GiftCardRow) {
    const confirmed = window.confirm(`Delete ${card.product_name}? Existing old orders keep their copied item details.`);
    if (!confirmed) return;

    await runAdminAction(`delete-${card.id}`, "Deleting product...", async () => {
      const response = await fetch(`${API_BASE_URL}/admin/gift-cards/${card.slug}`, {
        method: "DELETE",
        headers: adminHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Product could not be deleted.");
      setMessage(`${card.product_name} deleted.`);
    });
  }

  async function uploadLogo(event: FormEvent<HTMLFormElement>, placement: "header" | "footer") {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("placement", placement);

    await runAdminAction(`logo-${placement}`, `Uploading ${placement} logo...`, async () => {
      const response = await fetch(`${API_BASE_URL}/admin/logo`, {
        method: "POST",
        headers: adminHeaders(),
        body: form
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Logo upload failed.");
      setMessage(`${placement === "header" ? "Header" : "Footer"} logo uploaded.`);
    });
  }

  async function deliverGiftCard(event: FormEvent<HTMLFormElement>, order: AdminOrder, delivery: AdminDelivery) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await runAdminAction(`delivery-${delivery.id}`, "Saving delivery code...", async () => {
      const response = await fetch(`${API_BASE_URL}/admin/deliveries/${delivery.id}`, {
        method: "PATCH",
        headers: adminJsonHeaders(),
        body: JSON.stringify({
          code: form.get("code"),
          pin: form.get("pin"),
          claim_url: form.get("claim_url"),
          instructions: form.get("instructions"),
          status: "delivered",
          send_email: true
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delivery could not be saved.");
      setMessage(`${order.order_number} delivery saved and customer notification attempted.`);
    });
  }

  async function runAdminAction(actionKey: string, loadingMessage: string, callback: () => Promise<void>) {
    setBusyAction(actionKey);
    setMessage(loadingMessage);

    try {
      await callback();
      await loadAdmin();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusyAction("");
    }
  }

  async function logout(callApi = true) {
    const currentToken = token || window.localStorage.getItem("karrycards-admin-token") || "";
    if (callApi && currentToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${currentToken}`
        }
      }).catch(() => undefined);
    }

    window.localStorage.removeItem("karrycards-admin-token");
    setToken("");
    setDashboard(null);
    setGiftCards([]);
    setOrders([]);
    setMessage("Signed out.");
  }

  function adminHeaders(authToken = token) {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`
    };
  }

  function adminJsonHeaders() {
    return {
      ...adminHeaders(),
      "Content-Type": "application/json"
    };
  }

  return (
    <>
      <Nav categories={categories} showSearch={false} />
      <main className="admin-page">
        <header className="admin-header">
          <Link className="retail-brand" href="/">
            <BrandMark />
            <strong>KarryCards Admin</strong>
          </Link>
          <div className="admin-actions">
            {token ? <button type="button" onClick={() => loadAdmin()}>Refresh</button> : null}
            {token ? <button type="button" onClick={() => logout()}>Sign out</button> : null}
            <Link className="continue-shopping" href="/">View store</Link>
          </div>
        </header>

        <section className="admin-hero">
          <p className="eyebrow">Control panel</p>
          <h1>Manage products, orders, settings, and payments.</h1>
          <p>{message}</p>
        </section>

        {!token ? (
          <form className="admin-login" onSubmit={login}>
            <label>
              Admin email
              <input name="email" required type="email" placeholder="admin@karrystores.com" />
            </label>
            <label>
              Password
              <input name="password" required type="password" placeholder="Admin password" />
            </label>
            <button className="pay-button" disabled={isLoading} type="submit">
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        ) : (
          <>
            <section className="admin-stats">
              <article>
                <span>Categories</span>
                <strong>{dashboard?.totals.categories ?? "-"}</strong>
              </article>
              <article>
                <span>Gift cards</span>
                <strong>{dashboard?.totals.gift_cards ?? "-"}</strong>
              </article>
              <article>
                <span>Orders</span>
                <strong>{dashboard?.totals.orders ?? "-"}</strong>
              </article>
              <article>
                <span>Pending</span>
                <strong>{dashboard?.totals.pending_orders ?? "-"}</strong>
              </article>
              <article>
                <span>Visits today</span>
                <strong>{dashboard?.totals.visits_today ?? "-"}</strong>
              </article>
            </section>

            <section className="admin-grid">
              <article className="admin-panel admin-products-panel">
                <h2>Add product</h2>
                <form className="admin-product-form" onSubmit={createProduct}>
                  <label>
                    Category
                    <select name="category_slug" required defaultValue={categories[0]?.slug}>
                      {categories.map((category) => (
                        <option key={category.slug} value={category.slug}>{category.navLabel}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Brand
                    <input name="brand" required placeholder="Amazon" />
                  </label>
                  <label>
                    Product name
                    <input name="product_name" required placeholder="Amazon Gift Card" />
                  </label>
                  <label>
                    Brand color
                    <input name="brand_color" required type="color" defaultValue="#ff7a1a" />
                  </label>
                  <label>
                    Price
                    <input name="base_price" required min="1" step="0.01" type="number" placeholder="50" />
                  </label>
                  <label>
                    Compare price
                    <input name="compare_at_price" min="1" step="0.01" type="number" placeholder="Optional" />
                  </label>
                  <label>
                    Badge
                    <select name="badge" defaultValue="New">
                      <option>New</option>
                      <option>Popular</option>
                      <option>Deal</option>
                    </select>
                  </label>
                  <label>
                    Denominations
                    <input name="denominations" placeholder="25, 50, 100, 200" />
                  </label>
                  <label className="full">
                    Description
                    <input name="description" placeholder="Short product description" />
                  </label>
                  <button disabled={busyAction === "create-product"} type="submit">
                    {busyAction === "create-product" ? "Adding..." : "Add product"}
                  </button>
                </form>
              </article>

              <article className="admin-panel">
                <h2>Brand logos</h2>
                <div className="admin-logo-forms">
                  <form onSubmit={(event) => uploadLogo(event, "header")}>
                    <label>
                      Header logo
                      <input name="logo" required type="file" accept="image/*" />
                    </label>
                    <button disabled={busyAction === "logo-header"} type="submit">
                      {busyAction === "logo-header" ? "Uploading..." : "Upload header"}
                    </button>
                  </form>
                  <form onSubmit={(event) => uploadLogo(event, "footer")}>
                    <label>
                      Footer logo
                      <input name="logo" required type="file" accept="image/*" />
                    </label>
                    <button disabled={busyAction === "logo-footer"} type="submit">
                      {busyAction === "logo-footer" ? "Uploading..." : "Upload footer"}
                    </button>
                  </form>
                </div>
              </article>

              <article className="admin-panel">
                <h2>Gift card catalog</h2>
                <div className="admin-table">
                  {giftCards.slice(0, 24).map((card) => (
                    <form className="admin-product-row" key={card.id} onSubmit={(event) => updateProduct(event, card)}>
                      <div>
                        <strong>{card.product_name}</strong>
                        <small>{card.brand} - {card.category?.nav_label ?? card.category?.name ?? "Category"} - {card.badge}</small>
                      </div>
                      <label>
                        Price
                        <input name="base_price" min="1" step="0.01" type="number" defaultValue={card.base_price} />
                      </label>
                      <label>
                        Compare
                        <input name="compare_at_price" min="1" step="0.01" type="number" defaultValue={card.compare_at_price ?? ""} />
                      </label>
                      <label>
                        Badge
                        <select name="badge" defaultValue={card.badge}>
                          <option>New</option>
                          <option>Popular</option>
                          <option>Deal</option>
                        </select>
                      </label>
                      <label>
                        Status
                        <select name="is_active" defaultValue={String(card.is_active)}>
                          <option value="true">Active</option>
                          <option value="false">Hidden</option>
                        </select>
                      </label>
                      <label className="wide">
                        Denominations
                        <input
                          name="denominations"
                          defaultValue={card.denominations.filter((item) => item.is_active !== false).map((item) => Number(item.amount)).join(", ")}
                        />
                      </label>
                      <div className="admin-product-actions">
                        <button disabled={busyAction === `product-${card.id}`} type="submit">
                          {busyAction === `product-${card.id}` ? "Saving..." : "Save"}
                        </button>
                        <button disabled={busyAction === `delete-${card.id}`} type="button" onClick={() => deleteProduct(card)}>
                          {busyAction === `delete-${card.id}` ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </form>
                  ))}
                </div>
              </article>

              <article className="admin-panel admin-orders-panel">
                <h2>Orders</h2>
                <div className="admin-table">
                  {orders.map((order) => {
                    const payment = order.payments[0];
                    const canConfirm = payment && payment.status !== "confirmed";
                    const canStartSupplier = order.status === "paid" && order.supplier_status === "not_sent";

                    return (
                      <div className="admin-order-row" key={order.id}>
                        <div className="admin-order-top">
                          <span>
                            <strong>{order.order_number}</strong>
                            <small>{order.customer_name} - {order.customer_email}</small>
                          </span>
                          <span>{formatMoney(order.total, order.currency)}</span>
                          <em>{order.status}</em>
                        </div>

                        <div className="admin-order-meta">
                          <span>Payment: {payment ? `${payment.method} / ${payment.status}` : "missing"}</span>
                          <span>Supplier: {order.supplier_status}</span>
                          <span>{order.items.map((item) => `${item.brand} ${formatMoney(item.amount)}`).join(", ")}</span>
                        </div>

                        <div className="admin-row-actions">
                          <button disabled={!canConfirm || busyAction === `confirm-${order.id}`} type="button" onClick={() => confirmPayment(order)}>
                            {busyAction === `confirm-${order.id}` ? "Confirming..." : "Confirm payment"}
                          </button>
                          <button disabled={!canStartSupplier || busyAction === `supplier-${order.id}`} type="button" onClick={() => startSupplier(order)}>
                            {busyAction === `supplier-${order.id}` ? "Starting..." : "Start supplier"}
                          </button>
                        </div>

                        {order.deliveries.length ? (
                          <div className="admin-deliveries">
                            {order.deliveries.map((delivery) => {
                              const item = order.items.find((orderItem) => orderItem.id === delivery.order_item_id);
                              return (
                                <form className="delivery-form" key={delivery.id} onSubmit={(event) => deliverGiftCard(event, order, delivery)}>
                                  <div>
                                    <strong>{item?.product_name ?? "Gift card delivery"}</strong>
                                    <small>{delivery.supplier_name} - {delivery.status}</small>
                                  </div>
                                  <input name="code" placeholder="Gift card code" defaultValue={delivery.code ?? ""} />
                                  <input name="pin" placeholder="PIN optional" defaultValue={delivery.pin ?? ""} />
                                  <input name="claim_url" placeholder="Claim URL optional" defaultValue={delivery.claim_url ?? ""} />
                                  <input name="instructions" placeholder="Customer instructions optional" defaultValue={delivery.instructions ?? ""} />
                                  <button disabled={busyAction === `delivery-${delivery.id}`} type="submit">
                                    {busyAction === `delivery-${delivery.id}` ? "Saving..." : "Mark delivered"}
                                  </button>
                                </form>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  {!orders.length ? <p className="empty-state">No orders yet.</p> : null}
                </div>
              </article>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
