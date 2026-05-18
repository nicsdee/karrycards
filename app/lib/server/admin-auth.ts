import { NextResponse } from "next/server";

export function requireAdmin(request: Request) {
  const expected = process.env.ADMIN_TOKEN || process.env.KARRYCARDS_ADMIN_TOKEN;

  if (!expected) {
    return NextResponse.json({ message: "Set ADMIN_TOKEN in .env.local before using the admin API." }, { status: 501 });
  }

  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

  if (token !== expected) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  return null;
}

