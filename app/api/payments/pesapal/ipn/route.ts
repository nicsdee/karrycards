import { NextResponse } from "next/server";
import { fulfillGiftbitOrder } from "../../../../lib/server/giftbit";
import { notifyOwner } from "../../../../lib/server/notifications";
import { updateOrder } from "../../../../lib/server/orders";
import { getPesapalTransactionStatus } from "../../../../lib/server/pesapal";

export const runtime = "nodejs";

async function handlePesapalNotification(input: {
  orderTrackingId?: string | null;
  orderMerchantReference?: string | null;
  orderNotificationType?: string | null;
}) {
  if (!input.orderTrackingId || !input.orderMerchantReference) {
    return { ok: false, status: 400, message: "Missing Pesapal order identifiers." };
  }

  const status = await getPesapalTransactionStatus(input.orderTrackingId);
  const isPaid = Number(status.status_code) === 1 || status.payment_status_description?.toUpperCase() === "COMPLETED";

  let updated = await updateOrder(input.orderMerchantReference, (order) => ({
    ...order,
    status: isPaid ? "paid" : status.status_code === 2 ? "failed" : order.status,
    pesapal: {
      ...(order.pesapal || {}),
      trackingId: input.orderTrackingId || undefined,
      paymentMethod: status.payment_method,
      confirmationCode: status.confirmation_code,
      statusDescription: status.payment_status_description,
      statusCode: status.status_code,
      raw: status
    }
  }));

  if (!updated) {
    return { ok: false, status: 404, message: "Order not found." };
  }

  if (isPaid && updated.supplierStatus === "not_started") {
    const deliveries = await fulfillGiftbitOrder(updated);
    const hasFailure = deliveries.some((delivery) => delivery.status === "failed");
    updated = await updateOrder(updated.orderNumber, (order) => ({
      ...order,
      status: hasFailure ? "supplier_failed" : "delivered",
      supplierStatus: hasFailure ? "failed" : "fulfilled",
      deliveries
    }));

    if (updated) {
      await notifyOwner(updated, hasFailure ? "failed" : "delivered");
    }
  } else if (isPaid) {
    await notifyOwner(updated, "paid");
  }

  return { ok: true, status: 200, order: updated };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = await handlePesapalNotification({
    orderTrackingId: url.searchParams.get("OrderTrackingId"),
    orderMerchantReference: url.searchParams.get("OrderMerchantReference"),
    orderNotificationType: url.searchParams.get("OrderNotificationType")
  });

  return NextResponse.json({
    orderNotificationType: "IPNCHANGE",
    orderTrackingId: url.searchParams.get("OrderTrackingId"),
    orderMerchantReference: url.searchParams.get("OrderMerchantReference"),
    status: result.status
  }, { status: result.ok ? 200 : result.status });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await handlePesapalNotification({
    orderTrackingId: body.OrderTrackingId || body.orderTrackingId,
    orderMerchantReference: body.OrderMerchantReference || body.orderMerchantReference,
    orderNotificationType: body.OrderNotificationType || body.orderNotificationType
  });

  return NextResponse.json({
    orderNotificationType: "IPNCHANGE",
    orderTrackingId: body.OrderTrackingId || body.orderTrackingId,
    orderMerchantReference: body.OrderMerchantReference || body.orderMerchantReference,
    status: result.status
  }, { status: result.ok ? 200 : result.status });
}
