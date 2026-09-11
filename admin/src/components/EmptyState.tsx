import { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-black/10 rounded-xl p-12 text-center space-y-3 shadow-sm">
      <div className="mx-auto w-12 h-12 rounded-full bg-paper flex items-center justify-center text-steel border border-black/5">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <div className="max-w-sm mx-auto space-y-1">
        <h3 className="font-display font-bold text-sm text-ink">{title}</h3>
        <p className="text-xs text-steel leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
