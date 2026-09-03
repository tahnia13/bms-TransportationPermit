import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
  XCircle,
  Wrench,
  Ban,
  ShieldCheck,
  CalendarDays,
  FileCheck2,
  Car,
  Archive,
} from "lucide-react";

/**
 * Universal status badge for PT Besmindo Makmur Transportation System
 * Supports various entity statuses with consistent color schemes, icons, and micro-animations.
 */
export default function StatusBadge({
  status = "Active",
  size = "md",
  showDot = false,
  className = "",
}) {
  const normalized = String(status || "").trim().toLowerCase();

  let config = {
    label: status || "Unknown",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-400",
    icon: Clock3,
  };

  switch (normalized) {
    // Green / Positive
    case "approved":
    case "active":
    case "completed":
    case "valid":
    case "ready":
      config = {
        label: status || "Active",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200/80",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
      };
      break;

    // Amber / Warning
    case "pending":
    case "planned":
    case "scheduled":
    case "expiring soon":
    case "will expire soon":
    case "warning":
      config = {
        label: status || "Pending",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200/80",
        dot: "bg-amber-500",
        icon: Clock3,
      };
      break;

    // Blue / Info / Operational
    case "in transit":
    case "on duty":
    case "in progress":
    case "running":
      config = {
        label: status || "In Transit",
        bg: "bg-sky-50",
        text: "text-sky-700",
        border: "border-sky-200/80",
        dot: "bg-sky-500",
        icon: Car,
      };
      break;

    // Orange / Maintenance
    case "maintenance":
    case "in maintenance":
    case "repair":
      config = {
        label: status || "Maintenance",
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200/80",
        dot: "bg-orange-500",
        icon: Wrench,
      };
      break;

    // Red / Negative / Expired
    case "expired":
    case "rejected":
    case "inactive":
    case "cancelled":
    case "banned":
    case "danger":
      config = {
        label: status || "Expired",
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200/80",
        dot: "bg-rose-500",
        icon: normalized === "expired" ? AlertTriangle : XCircle,
      };
      break;

    // Purple / Archive
    case "archived":
      config = {
        label: status || "Archived",
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-200",
        dot: "bg-slate-500",
        icon: Archive,
      };
      break;

    default:
      config = {
        label: status || "Default",
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200",
        dot: "bg-gray-400",
        icon: Clock3,
      };
      break;
  }

  const sizeClasses = {
    xs: "text-[10px] px-2 py-0.5 gap-1 font-medium",
    sm: "text-[11px] px-2.5 py-0.5 gap-1.5 font-medium",
    md: "text-xs px-3 py-1 gap-1.5 font-semibold",
    lg: "text-sm px-3.5 py-1.5 gap-2 font-semibold",
  };

  const iconSizes = {
    xs: 11,
    sm: 12,
    md: 13,
    lg: 15,
  };

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors shadow-xs ${config.bg} ${config.text} ${config.border} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {showDot ? (
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      ) : (
        <IconComponent
          size={iconSizes[size] || 13}
          strokeWidth={2.2}
          className="shrink-0"
        />
      )}
      <span className="whitespace-nowrap tracking-wide">{config.label}</span>
    </span>
  );
}
