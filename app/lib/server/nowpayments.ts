import crypto from "node:crypto";

const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";

export type NowPaymentsInvoice = {
  id: string;
  token_id?: string;
  order_id: string;
  order_description: string;
  price_amount: string;
  price_currency: string;
  invoice_url: string;
  success_url?: string;
  cancel_url?: string;
};

export type NowPaymentsIpn = {
  payment_id?: number;
  payment_status?: string;
  pay_address?: string;
  price_amount?: number;
  price_currency?: string;
  pay_amount?: number;
  actually_paid?: number;
  pay_currency?: string;
  order_id?: string;
  order_description?: string;
  purchase_id?: string;
  outcome_amount?: number;
  outcome_currency?: string;
  [key: string]: unknown;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}

function sortedJson(value: Record<string, unknown>) {
  return JSON.stringify(value, Object.keys(value).sort());
}

export function verifyNowPaymentsSignature(payload: NowPaymentsIpn, signature: string | null) {
  const secret = requireEnv("NOWPAYMENTS_IPN_SECRET");
  if (!signature) return false;
  const expected = crypto.createHmac("sha512", secret).update(sortedJson(payload)).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

async function nowPaymentsFetch<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${NOWPAYMENTS_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": requireEnv("NOWPAYMENTS_API_KEY"),
      ...(init.headers || {})
    }
  });
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(data.message || `NOWPayments request failed with status ${response.status}.`);
  }

  return data;
}

export async function createNowPaymentsInvoice(input: {
  orderNumber: string;
  amount: number;
  description: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://karrycards.vercel.app";
  return nowPaymentsFetch<NowPaymentsInvoice>("/invoice", {
    method: "POST",
    body: JSON.stringify({
      price_amount: input.amount,
      price_currency: "usd",
      order_id: input.orderNumber,
      order_description: input.description,
      ipn_callback_url: `${siteUrl}/api/payments/nowpayments/ipn`,
      success_url: `${siteUrl}/order-status?order=${encodeURIComponent(input.orderNumber)}`,
      cancel_url: `${siteUrl}/checkout`
    })
  });
}
