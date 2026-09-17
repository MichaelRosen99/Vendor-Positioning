import type { VendorRow } from "@/lib/types";
import SentimentBadge from "./SentimentBadge";

export interface TableEntry {
  id: string;
  row: VendorRow;
  kind: "primary" | "competitor" | "added";
}

function KindTag({ kind }: { kind: TableEntry["kind"] }) {
  if (kind === "primary") {
    return (
      <span className="inline-flex items-center rounded-full bg-ink px-2 py-0.5 text-xs font-medium text-white">
        Your vendor
      </span>
    );
  }
  if (kind === "added") {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
        Added
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
      Competitor
    </span>
  );
}

function List({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-gray-400">—</span>;
  return (
    <ul className="list-disc space-y-0.5 pl-4">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function VendorTable({ entries }: { entries: TableEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {[
              "Vendor",
              "Revenue",
              "Employees",
              "HQ",
              "Products",
              "Target Market",
              "Representative Clients",
              "Market Sentiment",
            ].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map(({ id, row, kind }) => (
            <tr key={id} className={kind === "primary" ? "bg-gray-50/70" : undefined}>
              <td className="px-4 py-3 align-top">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-ink">
                    {row.name}
                    {row.product ? (
                      <span className="font-normal text-gray-500"> · {row.product}</span>
                    ) : null}
                  </span>
                  <KindTag kind={kind} />
                </div>
              </td>
              <td className="px-4 py-3 align-top whitespace-nowrap">{row.revenue}</td>
              <td className="px-4 py-3 align-top whitespace-nowrap">{row.employees}</td>
              <td className="px-4 py-3 align-top whitespace-nowrap">{row.hqLocation}</td>
              <td className="px-4 py-3 align-top">
                <List items={row.products} />
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex flex-wrap gap-1">
                  {row.targetMarket.map((market) => (
                    <span
                      key={market}
                      className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/10"
                    >
                      {market}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 align-top">
                <List items={row.representativeClients} />
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex flex-col gap-1">
                  <SentimentBadge label={row.sentiment.label} />
                  <p className="text-xs text-gray-500">{row.sentiment.summary}</p>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
