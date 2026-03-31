import Link from "next/link";

import { cn } from "@inventra/utils";

export function LinkButton({
  href,
  label,
  variant = "primary",
  className
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const variants = {
    primary:
      "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 focus-visible:ring-brand-500",
    secondary:
      "bg-teal-500 text-white shadow-lg shadow-teal-500/20 hover:bg-teal-700 focus-visible:ring-teal-500",
    ghost:
      "border border-stone-300 bg-white text-ink hover:border-brand-500 hover:text-brand-700 focus-visible:ring-brand-500"
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variants[variant],
        className
      )}
    >
      {label}
    </Link>
  );
}
