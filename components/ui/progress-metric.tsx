type ProgressMetricProps = {
  label: string;
  value: number | null | undefined;
  goal: number;
  unit: string;
};

export function ProgressMetric({
  label,
  value,
  goal,
  unit,
}: ProgressMetricProps) {
  const currentValue = value ?? 0;
  const percentage =
    goal > 0 ? Math.min(Math.round((currentValue / goal) * 100), 100) : 0;

  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="mt-2 text-base font-semibold text-gray-900">
            {currentValue} / {goal} {unit}
          </p>
        </div>
        <span className="text-sm font-medium text-gray-900">{percentage}%</span>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Math.min(currentValue, goal)}
      >
        <div
          className="h-full rounded-full bg-gray-900 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
