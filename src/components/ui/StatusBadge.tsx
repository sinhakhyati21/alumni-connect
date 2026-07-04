import type { ReactNode } from "react";
import {
  CheckCircle2,
  Clock3,
  XCircle,
  Sparkles,
  Trophy,
} from "lucide-react";

type Variant =
  | "pending"
  | "accepted"
  | "declined"
  | "match"
  | "score"
  | "success";

interface StatusBadgeProps {
  variant: Variant;
  children: ReactNode;
}

const styles = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200",

  accepted:
    "bg-emerald-50 text-emerald-700 border-emerald-200",

  declined:
    "bg-red-50 text-red-700 border-red-200",

  match:
    "bg-blue-50 text-blue-700 border-blue-200",

  score:
    "bg-purple-50 text-purple-700 border-purple-200",

  success:
    "bg-green-50 text-green-700 border-green-200",
};

const icons = {
  pending: <Clock3 size={14} />,
  accepted: <CheckCircle2 size={14} />,
  declined: <XCircle size={14} />,
  match: <Sparkles size={14} />,
  score: <Trophy size={14} />,
  success: <CheckCircle2 size={14} />,
};

export default function StatusBadge({
  variant,
  children,
}: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        ${styles[variant]}
      `}
    >
      {icons[variant]}
      {children}
    </span>
  );
}