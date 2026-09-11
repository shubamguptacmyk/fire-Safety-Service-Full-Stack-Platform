import React from "react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export default function StatusBadge({ status, size = "sm", className = "" }: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase().replace(/[\s_-]+/g, "_");

  let colorClasses = "bg-gray-100 text-gray-700 border-gray-200";

  switch (normalized) {
    case "paid":
    case "success":
    case "completed":
    case "delivered":
    case "active":
    case "approved":
    case "confirmed":
      colorClasses = "bg-green-50 text-green-700 border-green-200";
      break;

    case "pending":
    case "requested":
    case "in_progress":
    case "processing":
    case "partially_paid":
    case "draft":
    case "assigned":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
      break;

    case "failed":
    case "rejected":
    case "cancelled":
    case "expired":
    case "unpaid":
      colorClasses = "bg-red-50 text-red-700 border-red-200";
      break;

    case "refunded":
    case "returned":
    case "dispatched":
    case "shipped":
      colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
      break;

    case "technician_on_the_way":
    case "review":
      colorClasses = "bg-purple-50 text-purple-700 border-purple-200";
      break;
  }

  const paddingClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border capitalize font-mono ${paddingClasses} ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0" />
      {status ? status.replace(/_/g, " ") : "Unknown"}
    </span>
  );
}
