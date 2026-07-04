import type { LucideIcon } from "lucide-react";

export default function CredentialStat({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
}) {
  return (
    <div className="relative flex flex-col items-center gap-1 rounded-xl border border-ink/10 bg-white px-4 py-6 text-center">
      <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-brass" />
      <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-full border border-brass/30 text-brass">
        <Icon size={16} />
      </div>
      <span className="font-display text-2xl font-semibold text-ink">{value}</span>
      <span className="text-xs uppercase tracking-wide text-charcoal/70">{label}</span>
    </div>
  );
}