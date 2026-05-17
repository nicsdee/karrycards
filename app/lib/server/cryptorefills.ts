const CRYPTOREFILLS_API_URL = "https://api.cryptorefills.com";

export type CryptoRefillsPayment = {
  coin: string;
  network: string;
};

export type CryptoRefillsDelivery = {
  brandName: string;
  countryCode: string;
  denomination: number;
  quantity: number;
};

export type CryptoRefillsOrderInput = {
  email: string;
  payment: CryptoRefillsPayment;
  deliveries: CryptoRefillsDelivery[];
};

export type CryptoRefillsOrderResponse = {
  id?: string;
  order_id?: string;
  reference?: string;
  status?: string;
  wallet_address?: string;
  payment_address?: string;
  address?: string;
  coin_amount?: string | number;
  amount?: string | number;
  payment_url?: string;
  hosted_url?: string;
  checkout_url?: string;
  [key: string]: unknown;
};

function cryptoRefillsHeaders() {
  const partnerId = process.env.CRYPTOREFILLS_PARTNER_ID;
  const appVersion = process.env.CRYPTOREFILLS_APP_VERSION || "karrycards-1.0.0";

  if (!partnerId) {
    throw new Error("Missing CRYPTOREFILLS_PARTNER_ID. Create a CryptoRefills partner account and add the partner ID to your environment.");
  }

  return {
    "Content-Type": "application/json",
    "X-Cr-Application": partnerId,
    "X-Cr-Version": appVersion
  };
}

async function cryptoRefillsFetch<T>(path: string, init: RequestInit) {
  const response = await fetch(`${CRYPTOREFILLS_API_URL}${path}`, {
    ...init,
    headers: {
      ...cryptoRefillsHeaders(),
      ...(init.headers || {})
    }
  });

  const data = (await response.json().catch(() => ({}))) as T & { message?: string; error?: string };

  if (!response.ok) {
    throw new Error(data.message || data.error || `CryptoRefills request failed with status ${response.status}.`);
  }

  return data;
}

export async function createCryptoRefillsOrder(input: CryptoRefillsOrderInput) {
  return cryptoRefillsFetch<CryptoRefillsOrderResponse>("/v5/orders", {
    method: "POST",
    body: JSON.stringify({
      deliveries: input.deliveries.map((delivery) => ({
        kind: "giftcard",
        quantity: delivery.quantity,
        deliverable: {
          brand_name: delivery.brandName,
          country_code: delivery.countryCode,
          denomination: String(delivery.denomination)
        }
      })),
      payment: {
        type: "via",
        coin: input.payment.coin,
        network: input.payment.network,
        payment_via: "USER_WALLET"
      },
      user: {
        email: input.email,
        has_accepted_newsletter: false
      },
      lang: "en",
      acquisition: {
        utm_source: "karrycards"
      }
    })
  });
}

