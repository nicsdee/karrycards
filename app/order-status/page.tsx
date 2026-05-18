"use client";

import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Nav from "../components/nav";
import { API_BASE_URL } from "../lib/api";
import { fallbackCatalog } from "../lib/catalog";

type StatusResponse = {
  order: {
    order_number: string;
    status: string;
    supplier_status: string;
    total: string;
    currency: string;
    deliveries: Array<{
      id: number;
      brand: string | null;
      product_name: string | null;
      amount: string | null;
      code: string | null;
      pin: string | null;
      claim_url: string | null;
      instructions: string | null;
    }>;
  };
  timeline: Array<{
    label: string;
    complete: boolean;
  }>;
};

export default function OrderStatusPage() {
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const order = searchParams.get("order");
    if (order) setReference(order);
  }, []);

  async function checkStatus() {
    setIsLoading(true);
    setMessage("");
    setStatus(null);

    try {
      const params = new URLSearchParams({
        order_number: reference
      });
      const response = await fetch(`${API_BASE_URL || "/api"}/orders/status?${params.toString()}`, {
        headers: { Accept: "application/json" }
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Order not found. Check the order number.");
        return;
      }

      setStatus(data);
    } catch {
      setMessage("Order service is not reachable. Please try again shortly.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Nav categories={fallbackCatalog.categories} showSearch={false} />
      <main className="legal-page">
        <h1>Order Status</h1>
        <p>Enter your order number to check payment, supplier, and delivery status.</p>
        <label className="status-search">
          Order number
          <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="KC-20260512-ABC123" />
        </label>
        <button className="pay-button" disabled={!reference || isLoading} type="button" onClick={checkStatus}>
          {isLoading ? "Checking..." : "Check status"}
        </button>
        {message ? <p className="checkout-message">{message}</p> : null}
        {status ? (
          <section className="status-card">
            <h2>{status.order.order_number}</h2>
            <p>Total: {status.order.currency} {Number(status.order.total).toFixed(2)}</p>
            <p>Payment: {status.order.status}</p>
            <p>Supplier: {status.order.supplier_status}</p>
            <div className="status-timeline">
              {status.timeline.map((item) => (
                <span className={item.complete ? "complete" : ""} key={item.label}>
                  {item.label}
                </span>
              ))}
            </div>
            {status.order.deliveries.length ? (
              <div className="delivered-codes">
                <h3>Delivered gift cards</h3>
                {status.order.deliveries.map((delivery) => (
                  <article key={delivery.id}>
                    <strong>{delivery.product_name ?? delivery.brand ?? "Gift card"}</strong>
                    {delivery.amount ? <span>Amount: {status.order.currency} {Number(delivery.amount).toFixed(2)}</span> : null}
                    {delivery.code ? <code>{delivery.code}</code> : null}
                    {delivery.pin ? <span>PIN: {delivery.pin}</span> : null}
                    {delivery.claim_url ? <a href={delivery.claim_url}>Open claim link</a> : null}
                    {delivery.instructions ? <p>{delivery.instructions}</p> : null}
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
