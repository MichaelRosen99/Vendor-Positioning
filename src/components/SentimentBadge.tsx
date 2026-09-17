import type { SentimentLabel } from "@/lib/types";

const STYLES: Record<SentimentLabel, string> = {
  Positive: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Mixed: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Negative: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export default function SentimentBadge({ label }: { label: SentimentLabel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[label]}`}
    >
      {label}
    </span>
  );
}
