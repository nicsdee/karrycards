import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/server/admin-auth";
import { listOrders } from "../../../lib/server/orders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const orders = await listOrders();

  return NextResponse.json({
    totals: {
      orders: orders.length,
      paid: orders.filter((order) => order.status === "paid").length,
      pending: orders.filter((order) => order.status === "payment_pending").length,
      delivered: orders.filter((order) => order.status === "delivered").length
    },
    orders
  });
}

