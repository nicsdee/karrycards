import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/server/admin-auth";
import { listOrders } from "../../../lib/server/orders";
import { listCheckoutActivity } from "../../../lib/server/checkout-activity";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const orders = await listOrders();
  const checkouts = await listCheckoutActivity();

  return NextResponse.json({
    totals: {
      orders: orders.length,
      paid: orders.filter((order) => order.status === "paid").length,
      pending: orders.filter((order) => order.status === "payment_pending").length,
      delivered: orders.filter((order) => order.status === "delivered").length
    },
    checkoutTotals: {
      opened: checkouts.filter((checkout) => checkout.status === "opened").length,
      pending: checkouts.filter((checkout) => checkout.status === "payment_pending").length,
      paid: checkouts.filter((checkout) => checkout.status === "paid").length,
      delivered: checkouts.filter((checkout) => checkout.status === "delivered").length,
      failed: checkouts.filter((checkout) => checkout.status === "failed").length
    },
    checkouts,
    orders
  });
}

