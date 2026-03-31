import { Card } from "@inventra/ui";

import { LinkButton } from "../components/shared/link-button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-xl space-y-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">404</p>
        <h1 className="font-display text-5xl text-ink">This shelf is empty.</h1>
        <p className="text-sm leading-6 text-stone-500">
          The page you were looking for does not exist, or the route has moved.
        </p>
        <div className="flex justify-center">
          <LinkButton href="/" label="Back Home" />
        </div>
      </Card>
    </div>
  );
}
