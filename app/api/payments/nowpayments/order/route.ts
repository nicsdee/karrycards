import { NextResponse } from "next/server";
import { giftCards } from "../../../../data";
import { createNowPaymentsInvoice } from "../../../../lib/server/nowpayments";
import { createOrder, makeOrderNumber, StoredDelivery, StoredOrderItem } from "../../../../lib/server/orders";
import { quoteCart } from "../../../../lib/pricing";

export const runtime = "nodejs";

type NowPaymentsOrderBody = {
  items?: Array<{
    slug?: string;
    amount?: number;
    quantity?: number;
  }>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NowPaymentsOrderBody;

    if (!body.items?.length) {
      return NextResponse.json({ message: "Cart items are required." }, { status: 400 });
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
        category: card.category,
        productName: card.productName,
        amount,
        quantity
      };
    });

    const quote = quoteCart(items);
    const subtotal = quote.original;
    const serviceFee = -quote.discount;
    const total = quote.total;
    const orderNumber = makeOrderNumber();

    const invoice = await createNowPaymentsInvoice({
      orderNumber,
      amount: total,
      description: `KarryCards ${orderNumber}`
    });

    const deliveries: StoredDelivery[] = items.map((item) => ({
      id: crypto.randomUUID(),
      brand: item.brand,
      productName: item.productName,
      amount: item.amount,
      status: "pending",
      message: "Payment is pending. Fulfillment starts after crypto payment confirmation."
    }));

    const order = await createOrder({
      orderNumber,
      customer: {
        name: "Customer",
        email: "Provided on payment page"
      },
      items,
      currency: "USD",
      subtotal,
      serviceFee,
      total,
      status: "payment_pending",
      supplierStatus: "not_started",
      nowPayments: {
        invoiceId: invoice.id,
        invoiceUrl: invoice.invoice_url,
        status: "waiting",
        raw: invoice
      },
      deliveries
    });

    return NextResponse.json({
      order,
      payment: {
        provider: "NOWPayments",
        checkoutUrl: invoice.invoice_url,
        amount: total,
        supplierCost: subtotal,
        profit: serviceFee,
        currency: "USD",
        instructions: "Choose any supported crypto coin/network. Your gift card code is sent to your email after payment confirmation."
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "NOWPayments invoice could not be created."
      },
      { status: 502 }
    );
  }
}
