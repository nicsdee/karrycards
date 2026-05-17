import { NextResponse } from "next/server";

type CheckoutItem = {
  brand: string;
  category: string;
  amount: number;
};

export async function POST(request: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      {
        error: "Paystack is not configured yet. Add PAYSTACK_SECRET_KEY to your environment."
      },
      { status: 501 }
    );
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    payment?: string;
    items?: CheckoutItem[];
  };

  if (!body.email || !body.items?.length) {
    return NextResponse.json({ error: "Email and cart items are required." }, { status: 400 });
  }

  const totalUsd = body.items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const reference = `KC-${Date.now()}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: Math.round(totalUsd * 100),
      callback_url: `${siteUrl}/checkout/complete`,
      currency: "USD",
      email: body.email,
      metadata: {
        customer_name: body.name,
        payment_route: body.payment,
        reference,
        items: body.items.map((item) => ({
          brand: item.brand,
          category: item.category,
          amount: item.amount
        }))
      },
      reference
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.message || "Paystack initialization failed." }, { status: response.status });
  }

  return NextResponse.json(data);
}
