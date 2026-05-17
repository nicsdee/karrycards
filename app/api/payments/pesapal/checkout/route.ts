import { NextResponse } from "next/server";
import { giftCards } from "../../../../data";
import { createOrder, makeOrderNumber, StoredOrderItem } from "../../../../lib/server/orders";
import { submitPesapalOrder } from "../../../../lib/server/pesapal";

export const runtime = "nodejs";

type CheckoutBody = {
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  items?: Array<{
    slug?: string;
    amount?: number;
    quantity?: number;
  }>;
};

function serviceFee(subtotal: number) {
  return Number(Math.max(1.5, subtotal * 0.035).toFixed(2));
}

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutBody;
  const customer = body.customer;

  if (!customer?.name || !customer.email || !body.items?.length) {
    return NextResponse.json({ message: "Customer name, email, and cart items are required." }, { status: 400 });
  }

  const items: StoredOrderItem[] = body.items.map((item) => {
    const card = giftCards.find((giftCard) => giftCard.slug === item.slug);
    const amount = Number(item.amount);
    const quantity = Math.max(1, Number(item.quantity || 1));

    if (!card || !card.denominations.includes(amount)) {
      throw new Error(`Invalid gift card selection: ${item.slug}`);
    }

    return {
      slug: card.slug,
      brand: card.brand,
      productName: card.productName,
      amount,
      quantity
    };
  });

  const subtotal = Number(items.reduce((sum, item) => sum + item.amount * item.quantity, 0).toFixed(2));
  const fee = serviceFee(subtotal);
  const total = Number((subtotal + fee).toFixed(2));
  const orderNumber = makeOrderNumber();

  const order = await createOrder({
    orderNumber,
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    },
    items,
    currency: "USD",
    subtotal,
    serviceFee: fee,
    total,
    status: "created",
    supplierStatus: "not_started",
    deliveries: []
  });

  try {
    const pesapal = await submitPesapalOrder({
      orderNumber,
      amount: total,
      currency: process.env.PESAPAL_CURRENCY || "USD",
      description: `KarryCards gift card order ${orderNumber}`,
      customer: order.customer
    });

    return NextResponse.json({
      order: {
        ...order,
        status: "payment_pending",
        pesapal: {
          trackingId: pesapal.order_tracking_id,
          redirectUrl: pesapal.redirect_url
        }
      },
      redirectUrl: pesapal.redirect_url
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Pesapal checkout failed.",
        order
      },
      { status: 502 }
    );
  }
}
