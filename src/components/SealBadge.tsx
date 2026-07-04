export default function SealBadge({ value, label }: { value: number; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-brass/40 bg-white px-2.5 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-brass" />
      <span className="font-display text-sm font-semibold text-ink">{value}</span>
      <span className="text-xs text-charcoal/60">{label}</span>
    </div>
  );
}