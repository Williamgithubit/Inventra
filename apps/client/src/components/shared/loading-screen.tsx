export function LoadingScreen({ label = "Loading Inventra..." }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-600 shadow-panel">
        {label}
      </div>
    </div>
  );
}
