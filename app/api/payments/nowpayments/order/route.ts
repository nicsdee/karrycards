import { NextResponse } from "next/server";
import { giftCards } from "../../../../data";
import { createNowPaymentsInvoice } from "../../../../lib/server/nowpayments";
import { createOrder, makeOrderNumber, StoredDelivery, StoredOrderItem } from "../../../../lib/server/orders";
import { quoteCart } from "../../../../lib/pricing";
import { upsertCheckoutActivity } from "../../../../lib/server/checkout-activity";

export const runtime = "nodejs";

type NowPaymentsOrderBody = {
  checkoutActivityId?: string;
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NowPaymentsOrderBody;

    if (!body.items?.length) {
      return NextResponse.json({ message: "Cart items are required." }, { status: 400 });
    }

    const customerEmail = String(body.customer?.email || "").trim().toLowerCase();
    if (!customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json({ message: "Customer email is required for gift card delivery." }, { status: 400 });
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
      message: "Payment is pending. Automatic email delivery starts after blockchain confirmation."
    }));

    const order = await createOrder({
      orderNumber,
      checkoutActivityId: body.checkoutActivityId,
      customer: {
        name: String(body.customer?.name || "Customer").trim() || "Customer",
        email: customerEmail,
        phone: body.customer?.phone ? String(body.customer.phone).trim() : undefined
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

    await upsertCheckoutActivity({
      id: body.checkoutActivityId,
      orderNumber,
      customer: order.customer,
      items,
      subtotal,
      total,
      status: "payment_pending",
      userAgent: request.headers.get("user-agent") || undefined
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
        instructions: "Choose any supported crypto coin/network. Your gift card code is sent to your email automatically after blockchain confirmation."
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
