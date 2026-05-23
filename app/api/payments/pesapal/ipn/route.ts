import { NextResponse } from "next/server";
import { updateCheckoutActivityByOrder } from "../../../../lib/server/checkout-activity";
import { sendGiftCardDeliveryEmail } from "../../../../lib/server/email";
import { autoFulfillPaidOrder } from "../../../../lib/server/fulfillment";
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

  if (isPaid) {
    const fulfilled = await autoFulfillPaidOrder(updated);
    await updateCheckoutActivityByOrder(updated.orderNumber, (activity) => ({
      ...activity,
      status: fulfilled.status === "delivered" ? "delivered" : "paid"
    }));

    if (fulfilled.status === "delivered") {
      await sendGiftCardDeliveryEmail(fulfilled);
      await notifyOwner(fulfilled, "delivered");
    } else {
      await notifyOwner(fulfilled, "paid");
    }
  } else if (status.status_code === 2) {
    await updateCheckoutActivityByOrder(updated.orderNumber, (activity) => ({
      ...activity,
      status: "failed"
    }));
    await notifyOwner(updated, "failed");
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
