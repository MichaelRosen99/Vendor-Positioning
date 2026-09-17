import { NextRequest, NextResponse } from "next/server";
import { lookupVendorAndCompetitors } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { vendor?: string; product?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const vendor = body.vendor?.trim();
  const product = body.product?.trim() || undefined;

  if (!vendor) {
    return NextResponse.json({ error: "A vendor name is required." }, { status: 400 });
  }

  try {
    const result = await lookupVendorAndCompetitors(vendor, product);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error looking up vendor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
