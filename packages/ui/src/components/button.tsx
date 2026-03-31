import * as React from "react";

import { cn } from "@inventra/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 focus-visible:ring-brand-500",
  secondary:
    "bg-teal-500 text-white shadow-lg shadow-teal-500/20 hover:bg-teal-700 focus-visible:ring-teal-500",
  ghost:
    "border border-stone-300 bg-white text-ink hover:border-brand-500 hover:text-brand-700 focus-visible:ring-brand-500",
  danger:
    "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 focus-visible:ring-rose-500"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
