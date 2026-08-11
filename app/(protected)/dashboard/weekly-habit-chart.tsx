type WeeklyHabitPoint = {
  label: string;
  completed: number;
};

type WeeklyHabitChartProps = {
  data: WeeklyHabitPoint[];
};

export function WeeklyHabitChart({ data }: WeeklyHabitChartProps) {
  const width = 560;
  const height = 240;
  const chartTop = 24;
  const chartBottom = 175;
  const chartHeight = chartBottom - chartTop;
  const barWidth = 40;
  const gap = 32;

  const maxCompleted = Math.max(...data.map((point) => point.completed), 1);

  const hasActivity = data.some((point) => point.completed > 0);

  return (
    <div>
      {hasActivity ? (
        <svg
          className="h-auto w-full"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Habit completion over the last 7 days"
        >
          <title>Habit completion over the last 7 days</title>

          <line
            x1="24"
            y1={chartBottom}
            x2={width - 24}
            y2={chartBottom}
            stroke="#e5e7eb"
            strokeWidth="2"
          />

          {data.map((point, index) => {
            const barHeight = (point.completed / maxCompleted) * chartHeight;

            const x = gap + index * (barWidth + gap);
            const y = chartBottom - barHeight;

            return (
              <g key={point.label}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="8"
                  fill="#111827"
                />

                <text
                  x={x + barWidth / 2}
                  y={chartBottom + 24}
                  textAnchor="middle"
                  className="fill-gray-500 text-xs"
                >
                  {point.label}
                </text>

                <text
                  x={x + barWidth / 2}
                  y={Math.max(y - 8, 14)}
                  textAnchor="middle"
                  className="fill-gray-900 text-xs font-medium"
                >
                  {point.completed}
                </text>
              </g>
            );
          })}
        </svg>
      ) : (
        <p className="py-8 text-sm text-gray-600">No habit activity yet.</p>
      )}
    </div>
  );
}
