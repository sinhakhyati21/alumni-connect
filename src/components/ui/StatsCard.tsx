import type { ReactNode } from "react";
import Card from "./Card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconColor?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "bg-blue-100 text-blue-700",
}: StatsCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconColor}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}