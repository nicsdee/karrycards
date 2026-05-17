type PesapalTokenResponse = {
  token?: string;
  expiryDate?: string;
  status?: string;
  message?: string;
  error?: unknown;
};

type PesapalSubmitResponse = {
  order_tracking_id?: string;
  merchant_reference?: string;
  redirect_url?: string;
  status?: string;
  message?: string;
  error?: unknown;
};

export type PesapalStatusResponse = {
  payment_method?: string;
  amount?: number;
  confirmation_code?: string;
  payment_status_description?: string;
  description?: string;
  status_code?: number;
  merchant_reference?: string;
  currency?: string;
  status?: string;
  message?: string;
  error?: unknown;
};

function pesapalBaseUrl() {
  return process.env.PESAPAL_ENV === "live"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";
}

async function pesapalFetch<T>(path: string, init: RequestInit) {
  const response = await fetch(`${pesapalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {})
    },
    cache: "no-store"
  });
  const data = (await response.json()) as T;
  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data;
}

function pesapalErrorMessage(data: PesapalSubmitResponse | PesapalTokenResponse) {
  if (data.message) return data.message;
  if (typeof data.error === "string") return data.error;
  if (data.error && typeof data.error === "object") {
    const error = data.error as { message?: string; code?: string; type?: string };
    return [error.message, error.code, error.type].filter(Boolean).join(" ");
  }
  return JSON.stringify(data);
}

export async function getPesapalToken() {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing PESAPAL_CONSUMER_KEY or PESAPAL_CONSUMER_SECRET.");
  }

  const data = await pesapalFetch<PesapalTokenResponse>("/api/Auth/RequestToken", {
    method: "POST",
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret
    })
  });

  if (!data.token) {
    throw new Error(data.message || "Pesapal did not return an access token.");
  }

  return data.token;
}

export async function submitPesapalOrder(input: {
  orderNumber: string;
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
}) {
  const token = await getPesapalToken();
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const notificationId = process.env.PESAPAL_IPN_ID;

  if (!notificationId) {
    throw new Error("Missing PESAPAL_IPN_ID.");
  }

  const [firstName, ...lastNameParts] = input.customer.name.trim().split(/\s+/);
  const data = await pesapalFetch<PesapalSubmitResponse>("/api/Transactions/SubmitOrderRequest", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      id: input.orderNumber,
      currency: input.currency,
      amount: input.amount,
      description: input.description.slice(0, 100),
      redirect_mode: "TOP_WINDOW",
      callback_url: `${appUrl}/api/payments/pesapal/callback`,
      cancellation_url: `${appUrl}/checkout`,
      notification_id: notificationId,
      branch: process.env.COMPANY_BRANCH || "Karry Cards USA",
      billing_address: {
        email_address: input.customer.email,
        ...(input.customer.phone ? { phone_number: input.customer.phone } : {}),
        country_code: process.env.PESAPAL_COUNTRY_CODE || "KE",
        first_name: firstName || input.customer.name,
        last_name: lastNameParts.join(" ") || "Customer"
      }
    })
  });

  if (!data.redirect_url || !data.order_tracking_id) {
    throw new Error(`Pesapal did not return a payment redirect: ${pesapalErrorMessage(data)}`);
  }

  return data;
}

export async function getPesapalTransactionStatus(orderTrackingId: string) {
  const token = await getPesapalToken();
  return pesapalFetch<PesapalStatusResponse>(
    `/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}
