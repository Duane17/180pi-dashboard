import * as React from "react";

/** Simple class combiner (avoid extra deps) */
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ChipVariant = "default" | "muted" | "success" | "warning" | "destructive";
type ChipSize = "xs" | "sm";

export type ChipProps = {
  /** Optional short label shown before the value, e.g. "Women:" */
  label?: React.ReactNode;
  /** Main content/value, e.g. "42%" */
  value?: React.ReactNode;
  /** Optional icon placed before the label */
  icon?: React.ReactNode;
  /** Visual style */
  variant?: ChipVariant;
  /** Size */
  size?: ChipSize;
  /** Additional classes */
  className?: string;
};

const VARIANT_MAP: Record<ChipVariant, string> = {
  default: "border-gray-300/70 bg-white/70 text-gray-800",
  muted: "border-gray-200/60 bg-gray-100/60 text-gray-700",
  success: "border-green-300/60 bg-green-50 text-green-800",
  warning: "border-amber-300/60 bg-amber-50 text-amber-800",
  destructive: "border-red-300/60 bg-red-50 text-red-800",
};

const SIZE_MAP: Record<ChipSize, string> = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-[6px] text-sm",
};

export function Chip({
  label,
  value,
  icon,
  variant = "default",
  size = "xs",
  className,
}: ChipProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border",
        VARIANT_MAP[variant],
        SIZE_MAP[size],
        className
      )}
    >
      {icon ? <span className="mr-0.5">{icon}</span> : null}
      {label ? <span className="font-medium">{label}:</span> : null}
      {value != null ? <span>{value}</span> : null}
    </span>
  );
}
