import type { ReactNode } from "react";

import { Card } from "./card";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="space-y-3 border-dashed text-center">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mx-auto max-w-lg text-sm text-stone-500">{description}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </Card>
  );
}
