import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { formatGiftCardCode } from "./gift-card-formats";
import { StoredOrder } from "./orders";
import { serverDataFile } from "./storage-path";

type OutboxMessage = {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  orderNumber: string;
  createdAt: string;
  status: "queued" | "sent";
  provider?: string;
};

const outboxFile = serverDataFile("email-outbox.json");

async function readOutbox(): Promise<OutboxMessage[]> {
  try {
    const raw = await readFile(outboxFile, "utf8");
    return JSON.parse(raw) as OutboxMessage[];
  } catch {
    return [];
  }
}

async function writeOutbox(messages: OutboxMessage[]) {
  await mkdir(path.dirname(outboxFile), { recursive: true });
  await writeFile(outboxFile, JSON.stringify(messages, null, 2));
}

function deliveryLines(order: StoredOrder) {
  return order.deliveries
    .filter((delivery) => delivery.status === "ready" && (delivery.code || delivery.claimUrl))
    .map((delivery) => {
      const code = formatGiftCardCode(delivery.brand, delivery.code);
      return {
        ...delivery,
        displayCode: code
      };
    });
}

function escapeHtml(value: string | number | undefined) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildDeliveryEmail(order: StoredOrder) {
  const lines = deliveryLines(order);
  const subject = `Your KarryCards order ${order.orderNumber}`;
  const text = [
    `Order ${order.orderNumber}`,
    "TEST CODE ONLY - this code is for KarryCards testing and is not redeemable.",
    "",
    ...lines.flatMap((delivery) => [
      `${delivery.productName} - $${delivery.amount}`,
      delivery.displayCode ? `Code: ${delivery.displayCode}` : "",
      delivery.pin ? `PIN: ${delivery.pin}` : "",
      delivery.claimUrl ? `Claim URL: ${delivery.claimUrl}` : "",
      ""
    ])
  ].filter(Boolean).join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#07172f;line-height:1.5">
      <h1 style="margin:0 0 12px">Your gift card code is ready</h1>
      <p>Order <strong>${escapeHtml(order.orderNumber)}</strong></p>
      <p style="border:1px solid #f5c26b;border-radius:12px;padding:12px;background:#fff8e8;color:#7a4500;font-weight:700">
        TEST CODE ONLY - this code is for KarryCards testing and is not redeemable. Real supplier codes will be connected after launch.
      </p>
      ${lines.map((delivery) => `
        <div style="border:1px solid #dde8f3;border-radius:14px;padding:16px;margin:12px 0;background:#f8fbff">
          <strong style="display:block;font-size:18px">${escapeHtml(delivery.productName)}</strong>
          <span style="display:block;color:#40516a">$${escapeHtml(delivery.amount)} USD</span>
          ${delivery.displayCode ? `<p style="font-size:22px;font-weight:800;letter-spacing:1px">${escapeHtml(delivery.displayCode)}</p>` : ""}
          ${delivery.pin ? `<p><strong>PIN:</strong> ${escapeHtml(delivery.pin)}</p>` : ""}
          ${delivery.claimUrl ? `<p><a href="${escapeHtml(delivery.claimUrl)}">Open claim link</a></p>` : ""}
        </div>
      `).join("")}
      <p style="color:#40516a">Keep this email safe during testing. Real supplier-backed codes will be enabled when KarryCards is ready for launch.</p>
    </div>
  `;

  return { subject, text, html };
}

async function sendOrQueue(message: Omit<OutboxMessage, "id" | "createdAt" | "status" | "provider">) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  const hasRealResendKey = Boolean(apiKey && apiKey !== "your_resend_key");

  if (hasRealResendKey && from) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text
      })
    });

    if (response.ok) {
      return;
    }
  }

  const outbox = await readOutbox();
  outbox.unshift({
    ...message,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "queued",
    provider: hasRealResendKey ? "resend-failed" : "local-outbox"
  });
  await writeOutbox(outbox.slice(0, 500));
}

export async function sendGiftCardDeliveryEmail(order: StoredOrder) {
  const lines = deliveryLines(order);
  if (!lines.length) return;

  const email = buildDeliveryEmail(order);
  await sendOrQueue({
    to: order.customer.email,
    orderNumber: order.orderNumber,
    ...email
  });

  const ownerEmail = process.env.OWNER_EMAIL;
  if (ownerEmail) {
    await sendOrQueue({
      to: ownerEmail,
      orderNumber: order.orderNumber,
      subject: `Admin copy: ${email.subject}`,
      text: email.text,
      html: email.html
    });
  }
}
