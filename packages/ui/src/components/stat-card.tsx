import { Card } from "./card";

export interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <Card className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{label}</p>
      <p className="font-display text-3xl text-ink">{value}</p>
      {helper ? <p className="text-sm text-stone-500">{helper}</p> : null}
    </Card>
  );
}
