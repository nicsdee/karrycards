import { NextResponse } from "next/server";
import { getOrder } from "../../../lib/server/orders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("order_number") || url.searchParams.get("order") || "";
  const order = await getOrder(orderNumber);

  if (!order) {
    return NextResponse.json({ message: "Order not found. Check the order number." }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      order_number: order.orderNumber,
      status: order.status,
      supplier_status: order.supplierStatus,
      subtotal: order.subtotal,
      service_fee: order.serviceFee,
      total: order.total,
      currency: order.currency,
      deliveries: order.deliveries.map((delivery) => ({
        id: delivery.id,
        brand: delivery.brand,
        product_name: delivery.productName,
        amount: delivery.amount,
        code: delivery.code || null,
        pin: delivery.pin || null,
        claim_url: delivery.claimUrl || null,
        instructions: delivery.message || null
      }))
    },
    timeline: [
      { label: "Order created", complete: true },
      { label: "Payment verified", complete: ["paid", "delivered", "supplier_failed"].includes(order.status) },
      { label: "Supplier fulfilled", complete: order.supplierStatus === "fulfilled" },
      { label: "Delivered to customer", complete: order.status === "delivered" }
    ]
  });
}
