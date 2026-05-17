import { NextResponse } from "next/server";
import { giftCards } from "../../../../data";
import { createCryptoRefillsOrder } from "../../../../lib/server/cryptorefills";
import { createOrder, makeOrderNumber, StoredDelivery, StoredOrderItem } from "../../../../lib/server/orders";

export const runtime = "nodejs";

type CryptoOrderBody = {
  payment?: {
    coin?: string;
    network?: string;
  };
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

const allowedPayments = new Map([
  ["USDC:Solana", { coin: "USDC", network: "Solana", label: "USDC on Solana" }],
  ["USDC:Base", { coin: "USDC", network: "Base", label: "USDC on Base" }],
  ["USDC:Polygon", { coin: "USDC", network: "Polygon", label: "USDC on Polygon" }],
  ["USDT:Tron", { coin: "USDT", network: "Tron", label: "USDT on Tron" }],
  ["USDT:Solana", { coin: "USDT", network: "Solana", label: "USDT on Solana" }],
  ["USDT:BNB Smart Chain", { coin: "USDT", network: "BNB Smart Chain", label: "USDT on BNB Smart Chain" }],
  ["BTC:Lightning", { coin: "BTC", network: "Lightning", label: "BTC Lightning" }],
  ["ETH:ETH Mainnet", { coin: "ETH", network: "ETH Mainnet", label: "ETH Mainnet" }],
  ["SOL:Solana", { coin: "SOL", network: "Solana", label: "SOL on Solana" }]
]);

function selectedPayment(body: CryptoOrderBody) {
  const coin = body.payment?.coin || "USDC";
  const network = body.payment?.network || "Solana";
  const payment = allowedPayments.get(`${coin}:${network}`);

  if (!payment) {
    throw new Error("Selected crypto payment method is not supported yet.");
  }

  return payment;
}

function textValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CryptoOrderBody;
    const customer = body.customer;
    const payment = selectedPayment(body);

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
    const orderNumber = makeOrderNumber();
    const cryptoRefillsOrder = await createCryptoRefillsOrder({
      email: customer.email,
      payment,
      deliveries: items.map((item) => ({
        brandName: item.brand,
        countryCode: process.env.CRYPTOREFILLS_COUNTRY_CODE || "US",
        denomination: item.amount,
        quantity: item.quantity
      }))
    });

    const supplierOrderId = textValue(cryptoRefillsOrder.id) || textValue(cryptoRefillsOrder.order_id) || textValue(cryptoRefillsOrder.reference);
    const walletAddress =
      textValue(cryptoRefillsOrder.wallet_address) ||
      textValue(cryptoRefillsOrder.payment_address) ||
      textValue(cryptoRefillsOrder.address);
    const coinAmount = textValue(cryptoRefillsOrder.coin_amount) || textValue(cryptoRefillsOrder.amount);
    const paymentUrl =
      textValue(cryptoRefillsOrder.payment_url) ||
      textValue(cryptoRefillsOrder.hosted_url) ||
      textValue(cryptoRefillsOrder.checkout_url);

    const deliveries: StoredDelivery[] = items.map((item) => ({
      id: crypto.randomUUID(),
      brand: item.brand,
      productName: item.productName,
      amount: item.amount,
      supplierOrderId,
      status: "pending",
      message: "CryptoRefills will deliver this gift card after payment confirmation."
    }));

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
      serviceFee: 0,
      total: subtotal,
      status: "payment_pending",
      supplierStatus: "pending",
      cryptoRefills: {
        orderId: supplierOrderId,
        coin: payment.coin,
        network: payment.network,
        walletAddress,
        coinAmount,
        paymentUrl,
        status: textValue(cryptoRefillsOrder.status),
        raw: cryptoRefillsOrder
      },
      deliveries
    });

    return NextResponse.json({
      order,
      payment: {
        provider: "CryptoRefills",
        label: payment.label,
        coin: payment.coin,
        network: payment.network,
        walletAddress,
        coinAmount,
        paymentUrl,
        amount: subtotal,
        currency: "USD",
        instructions:
          "Pay the exact crypto amount within the CryptoRefills payment window. CryptoRefills handles product delivery after payment confirmation."
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "CryptoRefills order could not be created."
      },
      { status: 502 }
    );
  }
}

