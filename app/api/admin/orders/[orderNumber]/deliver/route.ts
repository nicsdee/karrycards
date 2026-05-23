import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/server/admin-auth";
import { notifyOwner } from "../../../../../lib/server/notifications";
import { StoredDelivery, updateOrder } from "../../../../../lib/server/orders";
import { sendGiftCardDeliveryEmail } from "../../../../../lib/server/email";
import { updateCheckoutActivityByOrder } from "../../../../../lib/server/checkout-activity";

export const runtime = "nodejs";

type DeliveryBody = {
  deliveries?: Array<{
    id?: string;
    brand?: string;
    productName?: string;
    amount?: number;
    code?: string;
    pin?: string;
    claimUrl?: string;
    message?: string;
  }>;
};

export async function PATCH(request: Request, context: { params: Promise<{ orderNumber: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { orderNumber } = await context.params;
  const body = (await request.json().catch(() => ({}))) as DeliveryBody;

  if (!body.deliveries?.length) {
    return NextResponse.json({ message: "At least one delivery code or claim URL is required." }, { status: 400 });
  }

  const updated = await updateOrder(orderNumber, (order) => {
    const deliveries: StoredDelivery[] = body.deliveries!.map((delivery, index) => {
      const item = order.items[index] || order.items[0];
      return {
        id: delivery.id || crypto.randomUUID(),
        brand: delivery.brand || item.brand,
        productName: delivery.productName || item.productName,
        amount: Number(delivery.amount || item.amount),
        code: delivery.code || undefined,
        pin: delivery.pin || undefined,
        claimUrl: delivery.claimUrl || undefined,
        status: "ready",
        message: delivery.message || "Gift card delivered."
      };
    });

    return {
      ...order,
      status: "delivered",
      supplierStatus: "fulfilled",
      deliveries
    };
  });

  if (!updated) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  await updateCheckoutActivityByOrder(orderNumber, (activity) => ({
    ...activity,
    status: "delivered"
  }));
  await sendGiftCardDeliveryEmail(updated);
  await notifyOwner(updated, "delivered");
  return NextResponse.json({ order: updated });
}

