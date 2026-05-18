import { NextResponse } from "next/server";
import { notifyOwner } from "../../../../lib/server/notifications";
import { updateOrder } from "../../../../lib/server/orders";
import { NowPaymentsIpn, verifyNowPaymentsSignature } from "../../../../lib/server/nowpayments";

export const runtime = "nodejs";

const paidStatuses = new Set(["confirmed", "sending", "finished"]);
const failedStatuses = new Set(["failed", "refunded", "expired"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as NowPaymentsIpn;
  const signature = request.headers.get("x-nowpayments-sig");

  if (!verifyNowPaymentsSignature(body, signature)) {
    return NextResponse.json({ message: "Invalid NOWPayments signature." }, { status: 401 });
  }

  const orderNumber = body.order_id || "";
  const status = String(body.payment_status || "").toLowerCase();

  if (!orderNumber) {
    return NextResponse.json({ message: "Missing order id." }, { status: 400 });
  }

  const isPaid = paidStatuses.has(status);
  const isFailed = failedStatuses.has(status);

  const updated = await updateOrder(orderNumber, (order) => ({
    ...order,
    status: isPaid ? "paid" : isFailed ? "failed" : order.status,
    nowPayments: {
      ...(order.nowPayments || {}),
      paymentId: body.payment_id ? String(body.payment_id) : order.nowPayments?.paymentId,
      purchaseId: body.purchase_id || order.nowPayments?.purchaseId,
      status,
      payCurrency: body.pay_currency || order.nowPayments?.payCurrency,
      actuallyPaid: body.actually_paid,
      outcomeCurrency: body.outcome_currency,
      outcomeAmount: body.outcome_amount,
      raw: body
    }
  }));

  if (!updated) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  if (isPaid) {
    await notifyOwner(updated, "paid");
  } else if (isFailed) {
    await notifyOwner(updated, "failed");
  }

  return NextResponse.json({ ok: true });
}

