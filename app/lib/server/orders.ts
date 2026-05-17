import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredOrderItem = {
  slug: string;
  brand: string;
  productName: string;
  amount: number;
  quantity: number;
  supplierCode?: string;
};

export type StoredDelivery = {
  id: string;
  brand: string;
  productName: string;
  amount: number;
  claimUrl?: string;
  supplierOrderId?: string;
  status: "pending" | "ready" | "failed";
  message?: string;
};

export type StoredOrder = {
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: StoredOrderItem[];
  currency: "USD";
  subtotal: number;
  serviceFee: number;
  total: number;
  status: "created" | "payment_pending" | "paid" | "failed" | "delivered" | "supplier_failed";
  supplierStatus: "not_started" | "pending" | "fulfilled" | "failed";
  pesapal?: {
    trackingId?: string;
    redirectUrl?: string;
    paymentMethod?: string;
    confirmationCode?: string;
    statusDescription?: string;
    statusCode?: number;
    raw?: unknown;
  };
  cryptoRefills?: {
    orderId?: string;
    coin?: string;
    network?: string;
    walletAddress?: string;
    coinAmount?: string;
    paymentUrl?: string;
    status?: string;
    raw?: unknown;
  };
  deliveries: StoredDelivery[];
  createdAt: string;
  updatedAt: string;
};

const ordersFile = path.join(process.cwd(), "data", "orders.json");

async function readOrders(): Promise<StoredOrder[]> {
  try {
    const raw = await readFile(ordersFile, "utf8");
    return JSON.parse(raw) as StoredOrder[];
  } catch {
    return [];
  }
}

async function writeOrders(orders: StoredOrder[]) {
  await mkdir(path.dirname(ordersFile), { recursive: true });
  await writeFile(ordersFile, JSON.stringify(orders, null, 2));
}

export function makeOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `KC-${date}-${random}`;
}

export async function createOrder(order: Omit<StoredOrder, "createdAt" | "updatedAt">) {
  const orders = await readOrders();
  const now = new Date().toISOString();
  const stored: StoredOrder = { ...order, createdAt: now, updatedAt: now };
  orders.unshift(stored);
  await writeOrders(orders);
  return stored;
}

export async function getOrder(orderNumber: string) {
  const orders = await readOrders();
  return orders.find((order) => order.orderNumber === orderNumber);
}

export async function updateOrder(orderNumber: string, updater: (order: StoredOrder) => StoredOrder) {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.orderNumber === orderNumber);
  if (index === -1) return null;

  const next = updater({ ...orders[index] });
  next.updatedAt = new Date().toISOString();
  orders[index] = next;
  await writeOrders(orders);
  return next;
}
