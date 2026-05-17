import { StoredDelivery, StoredOrder } from "./orders";

type GiftbitEmbeddedResponse = {
  status?: number;
  gift_link?: string;
  campaign?: {
    uuid?: string;
    id?: string;
    brand_code?: string;
    status?: string;
  };
  info?: {
    code?: string;
    name?: string;
    message?: string;
  };
  error?: {
    code?: string;
    name?: string;
    message?: string;
  };
};

const defaultBrandCodes: Record<string, string> = {
  amazon: "AMZNCOM",
  "amazon-prime": "AMZNCOM",
  starbucks: "STARBUCKS",
  walmart: "WALMART",
  target: "TARGET",
  "playstation": "PLAYSTATION",
  steam: "STEAM",
  roblox: "ROBLOX",
  "xbox": "XBOX",
  "nintendo": "NINTENDO",
  doordash: "DOORDASH",
  "uber-eats": "UBER",
  uber: "UBER",
  netflix: "NETFLIX",
  "apple-tvplus": "APPLE"
};

function giftbitBaseUrl() {
  const configured = process.env.GIFTBIT_API_BASE_URL || "https://api.giftbit.com";
  return configured.endsWith("/papi/v1") ? configured : `${configured.replace(/\/$/, "")}/papi/v1`;
}

function giftbitBrandCode(slug: string, explicit?: string) {
  if (explicit) return explicit;

  try {
    const envMap = process.env.GIFTBIT_BRAND_MAP ? JSON.parse(process.env.GIFTBIT_BRAND_MAP) as Record<string, string> : {};
    return envMap[slug] || defaultBrandCodes[slug] || slug.toUpperCase().replaceAll("-", "");
  } catch {
    return defaultBrandCodes[slug] || slug.toUpperCase().replaceAll("-", "");
  }
}

async function giftbitFetch<T>(path: string, init: RequestInit) {
  const token = process.env.GIFTBIT_API_TOKEN;
  if (!token) {
    throw new Error("Missing GIFTBIT_API_TOKEN.");
  }

  const response = await fetch(`${giftbitBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Encoding": "identity",
      Authorization: `Bearer ${token}`,
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

export async function fulfillGiftbitOrder(order: StoredOrder) {
  const deliveries: StoredDelivery[] = [];

  for (const item of order.items) {
    for (let index = 0; index < item.quantity; index += 1) {
      const deliveryId = `${order.orderNumber}-${item.slug}-${index + 1}`;
      try {
        const data = await giftbitFetch<GiftbitEmbeddedResponse>("/embedded", {
          method: "POST",
          body: JSON.stringify({
            id: deliveryId,
            brand_code: giftbitBrandCode(item.slug, item.supplierCode),
            price_in_cents: Math.round(item.amount * 100)
          })
        });

        deliveries.push({
          id: deliveryId,
          brand: item.brand,
          productName: item.productName,
          amount: item.amount,
          claimUrl: data.gift_link,
          supplierOrderId: data.campaign?.uuid || data.campaign?.id,
          status: data.gift_link ? "ready" : "pending",
          message: data.info?.message
        });
      } catch (error) {
        deliveries.push({
          id: deliveryId,
          brand: item.brand,
          productName: item.productName,
          amount: item.amount,
          status: "failed",
          message: error instanceof Error ? error.message : "Giftbit fulfillment failed."
        });
      }
    }
  }

  return deliveries;
}
