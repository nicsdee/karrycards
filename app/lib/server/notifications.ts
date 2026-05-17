import { StoredOrder } from "./orders";

export async function notifyOwner(order: StoredOrder, event: "paid" | "delivered" | "failed") {
  const webhookUrl = process.env.OWNER_NOTIFY_WEBHOOK_URL;
  const message = `${event.toUpperCase()}: ${order.orderNumber} ${order.currency} ${order.total.toFixed(2)} for ${order.customer.email}`;

  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        message,
        ownerEmail: process.env.OWNER_EMAIL,
        ownerPhone: process.env.OWNER_PHONE,
        order
      })
    });
    return;
  }

  console.info("[owner-notification]", message);
}
