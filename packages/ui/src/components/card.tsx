import type { HTMLAttributes } from "react";

import { cn } from "@inventra/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-stone-200 bg-white/95 p-6 shadow-panel backdrop-blur",
        className
      )}
      {...props}
    />
  );
}
