import type { ReactNode } from "react";

interface SkillPillProps {
  children: ReactNode;
  color?:
    | "blue"
    | "green"
    | "purple"
    | "amber"
    | "red"
    | "gray";
}

const variants = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  red: "bg-red-50 text-red-700 border-red-100",
  gray: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function SkillPill({
  children,
  color = "blue",
}: SkillPillProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-medium
        transition-colors
        ${variants[color]}
      `}
    >
      {children}
    </span>
  );
}