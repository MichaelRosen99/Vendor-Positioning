"use client";

import { useState } from "react";
import VendorTable, { TableEntry } from "@/components/VendorTable";
import type { VendorLookupResult, VendorRow } from "@/lib/types";

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function toEntries(result: VendorLookupResult): TableEntry[] {
  return [
    { id: nextId("primary"), row: result.vendor, kind: "primary" },
    ...result.competitors.map((row) => ({
      id: nextId("competitor"),
      row,
      kind: "competitor" as const,
    })),
  ];
}

export default function Home() {
  const [vendor, setVendor] = useState("");
  const [product, setProduct] = useState("");
  const [entries, setEntries] = useState<TableEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addName, setAddName] = useState("");
  const [addProduct, setAddProduct] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor.trim()) return;

    setLoading(true);
    setError(null);
    setEntries(null);

    try {
      const res = await fetch("/api/vendor-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor, product }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      setEntries(toEntries(data as VendorLookupResult));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim() || !entries) return;

    setAddLoading(true);
    setAddError(null);

    try {
      const res = await fetch("/api/add-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName,
          product: addProduct,
          existingCompanies: entries.map((entry) => entry.row.name),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      const row = data.row as VendorRow;
      setEntries((prev) => [...(prev || []), { id: nextId("added"), row, kind: "added" }]);
      setAddName("");
      setAddProduct("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Vendor Positioning</h1>
        <p className="max-w-2xl text-gray-600">
          Enter a technology vendor — and optionally a specific product — to see how it stacks up
          against its closest competitors: size, HQ, target market, representative clients, and
          market sentiment.
        </p>
      </header>

      <form
        onSubmit={handleLookup}
        className="mb-10 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="vendor" className="mb-1 block text-sm font-medium text-gray-700">
            Vendor name
          </label>
          <input
            id="vendor"
            type="text"
            required
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. Salesforce"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="product" className="mb-1 block text-sm font-medium text-gray-700">
            Product <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="product"
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g. Sales Cloud"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Researching…" : "Compare"}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-gray-500">Gathering market data — this can take a moment…</p>
      )}

      {entries && (
        <div className="space-y-8">
          <VendorTable entries={entries} />

          <form
            onSubmit={handleAddCompany}
            className="flex flex-col gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-5 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label htmlFor="addName" className="mb-1 block text-sm font-medium text-gray-700">
                Add another company or product
              </label>
              <input
                id="addName"
                type="text"
                required
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. HubSpot"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="addProduct" className="mb-1 block text-sm font-medium text-gray-700">
                Product <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="addProduct"
                type="text"
                value={addProduct}
                onChange={(e) => setAddProduct(e.target.value)}
                placeholder="e.g. Marketing Hub"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
            <button
              type="submit"
              disabled={addLoading}
              className="rounded-lg border border-ink px-5 py-2 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addLoading ? "Adding…" : "Add to table"}
            </button>
          </form>

          {addError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {addError}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
