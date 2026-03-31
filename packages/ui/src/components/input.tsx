import * as React from "react";

import { cn } from "@inventra/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
        className
      )}
      {...props}
    />
  );
});
