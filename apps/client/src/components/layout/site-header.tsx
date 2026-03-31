import Link from "next/link";

import { Logo } from "./logo";
import { LinkButton } from "../shared/link-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-stone-600 md:flex">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Login</Link>
        </nav>
        <LinkButton href="/register" label="Start Free Trial" />
      </div>
    </header>
  );
}
