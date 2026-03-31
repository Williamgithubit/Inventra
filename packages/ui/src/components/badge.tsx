import type { HTMLAttributes } from "react";

import { cn } from "@inventra/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-stone-100 text-stone-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700"
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
