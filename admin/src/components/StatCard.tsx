import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: string;
  changePositive?: boolean;
  icon: LucideIcon;
  iconColorClass?: string;
}

export default function StatCard({
  title,
  value,
  subtext,
  change,
  changePositive,
  icon: Icon,
  iconColorClass = "text-brand bg-brand/10",
}: StatCardProps) {
  return (
    <div className="bg-white border border-black/10 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-steel uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${iconColorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-display font-bold text-ink font-mono">{value}</span>
        {change && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              changePositive
                ? "text-green-700 bg-green-50"
                : "text-red-700 bg-red-50"
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtext && <p className="text-[11px] text-steel leading-relaxed">{subtext}</p>}
    </div>
  );
}
