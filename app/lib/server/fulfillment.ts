import { generateTestGiftCardCode } from "./gift-card-formats";
import { StoredDelivery, StoredOrder, updateOrder } from "./orders";

function testDeliveriesForOrder(order: StoredOrder) {
  const deliveries: StoredDelivery[] = [];

  for (const item of order.items) {
    for (let index = 0; index < item.quantity; index += 1) {
      deliveries.push({
        id: `${order.orderNumber}-${item.slug}-${index + 1}`,
        brand: item.brand,
        productName: item.productName,
        amount: item.amount,
        code: generateTestGiftCardCode(item.brand),
        status: "ready",
        message: "TEST CODE - payment confirmed. This is for KarryCards testing only and is not redeemable."
      });
    }
  }

  return deliveries;
}

export async function autoFulfillPaidOrder(order: StoredOrder) {
  if (order.supplierStatus === "fulfilled") return order;

  const updated = await updateOrder(order.orderNumber, (current) => ({
    ...current,
    status: "delivered",
    supplierStatus: "fulfilled",
    deliveries: testDeliveriesForOrder(current)
  }));

  return updated || order;
}
