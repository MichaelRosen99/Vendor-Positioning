import { NextRequest, NextResponse } from "next/server";
import { lookupSingleCompany } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { name?: string; product?: string; existingCompanies?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const product = body.product?.trim() || undefined;
  const existingCompanies = Array.isArray(body.existingCompanies)
    ? body.existingCompanies.filter((c): c is string => typeof c === "string")
    : [];

  if (!name) {
    return NextResponse.json({ error: "A company name is required." }, { status: 400 });
  }

  try {
    const row = await lookupSingleCompany(name, product, existingCompanies);
    return NextResponse.json({ row });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error looking up company.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
