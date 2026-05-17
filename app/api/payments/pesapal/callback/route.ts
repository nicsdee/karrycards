import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("OrderMerchantReference") || "";
  const customerUrl = new URL("/order-status", url.origin);
  customerUrl.searchParams.set("order", orderNumber);
  return NextResponse.redirect(customerUrl);
}
