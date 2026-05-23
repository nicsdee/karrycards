import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { serverDataFile } from "./storage-path";

export type CheckoutActivityItem = {
  slug: string;
  brand: string;
  productName: string;
  amount: number;
  quantity: number;
};

export type CheckoutActivity = {
  id: string;
  orderNumber?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  items: CheckoutActivityItem[];
  currency: "USD";
  subtotal: number;
  total: number;
  status: "opened" | "payment_pending" | "paid" | "failed" | "delivered";
  source: "checkout";
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
};

const activityFile = serverDataFile("checkout-activity.json");

async function readActivity(): Promise<CheckoutActivity[]> {
  try {
    const raw = await readFile(activityFile, "utf8");
    return JSON.parse(raw) as CheckoutActivity[];
  } catch {
    return [];
  }
}

async function writeActivity(activity: CheckoutActivity[]) {
  await mkdir(path.dirname(activityFile), { recursive: true });
  await writeFile(activityFile, JSON.stringify(activity, null, 2));
}

export async function listCheckoutActivity() {
  return readActivity();
}

export async function upsertCheckoutActivity(input: {
  id?: string;
  orderNumber?: string;
  customer?: CheckoutActivity["customer"];
  items: CheckoutActivityItem[];
  subtotal: number;
  total: number;
  status: CheckoutActivity["status"];
  userAgent?: string;
}) {
  const activity = await readActivity();
  const now = new Date().toISOString();
  const index = input.id ? activity.findIndex((entry) => entry.id === input.id) : -1;

  const next: CheckoutActivity = {
    ...(index >= 0 ? activity[index] : {
      id: input.id || crypto.randomUUID(),
      createdAt: now,
      currency: "USD",
      source: "checkout"
    }),
    orderNumber: input.orderNumber || (index >= 0 ? activity[index].orderNumber : undefined),
    customer: input.customer || (index >= 0 ? activity[index].customer : undefined),
    items: input.items,
    subtotal: input.subtotal,
    total: input.total,
    status: input.status,
    userAgent: input.userAgent || (index >= 0 ? activity[index].userAgent : undefined),
    updatedAt: now
  };

  if (index >= 0) {
    activity[index] = next;
  } else {
    activity.unshift(next);
  }

  await writeActivity(activity.slice(0, 500));
  return next;
}

export async function updateCheckoutActivity(id: string | undefined, updater: (activity: CheckoutActivity) => CheckoutActivity) {
  if (!id) return null;

  const activity = await readActivity();
  const index = activity.findIndex((entry) => entry.id === id);
  if (index === -1) return null;

  const next = updater({ ...activity[index] });
  next.updatedAt = new Date().toISOString();
  activity[index] = next;
  await writeActivity(activity);
  return next;
}

export async function updateCheckoutActivityByOrder(orderNumber: string, updater: (activity: CheckoutActivity) => CheckoutActivity) {
  const activity = await readActivity();
  const index = activity.findIndex((entry) => entry.orderNumber === orderNumber);
  if (index === -1) return null;

  const next = updater({ ...activity[index] });
  next.updatedAt = new Date().toISOString();
  activity[index] = next;
  await writeActivity(activity);
  return next;
}
