import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3 text-ink">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-lg font-bold text-canvas">
        I
      </span>
      <span className="flex flex-col">
        <span className="font-display text-2xl leading-none">Inventra</span>
        <span className="text-[11px] uppercase tracking-[0.26em] text-stone-500">Stock + POS</span>
      </span>
    </Link>
  );
}
