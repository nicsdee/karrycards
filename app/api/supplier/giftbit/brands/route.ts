import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = process.env.GIFTBIT_API_TOKEN;
  const configured = process.env.GIFTBIT_API_BASE_URL || "https://api-testbed.giftbit.com";
  const baseUrl = configured.endsWith("/papi/v1") ? configured : `${configured.replace(/\/$/, "")}/papi/v1`;
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const currency = url.searchParams.get("currency") || "USD";

  if (!token) {
    return NextResponse.json({ ok: false, message: "Missing GIFTBIT_API_TOKEN." }, { status: 400 });
  }

  const params = new URLSearchParams({
    currencyisocode: currency,
    limit: "50"
  });
  if (search) params.set("search", search);

  const response = await fetch(`${baseUrl}/brands?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Accept-Encoding": "identity"
    },
    cache: "no-store"
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.ok ? 200 : response.status });
}
