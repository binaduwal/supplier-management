interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = "Loading" }: SpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700"
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
