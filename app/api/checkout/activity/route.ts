import { NextResponse } from "next/server";
import { giftCards } from "../../../data";
import { upsertCheckoutActivity } from "../../../lib/server/checkout-activity";
import { quoteCart } from "../../../lib/pricing";

export const runtime = "nodejs";

type CheckoutActivityBody = {
  id?: string;
  items?: Array<{
    slug?: string;
    amount?: number;
    quantity?: number;
  }>;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CheckoutActivityBody;

  if (!body.items?.length) {
    return NextResponse.json({ message: "Cart items are required." }, { status: 400 });
  }

  const items = body.items.map((item) => {
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
  const quote = quoteCart(items);
  const activity = await upsertCheckoutActivity({
    id: body.id,
    items,
    subtotal: quote.original,
    total: quote.total,
    status: "opened",
    userAgent: request.headers.get("user-agent") || undefined
  });

  return NextResponse.json({ activity });
}
