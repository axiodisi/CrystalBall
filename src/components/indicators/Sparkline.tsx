type SparklineProps = {
  values: number[];
  className?: string;
  tone?: "calm" | "watch" | "elevated" | "unknown";
};

const STROKE: Record<NonNullable<SparklineProps["tone"]>, string> = {
  calm: "#6BA37A",
  watch: "#E6A23C",
  elevated: "#C85A5A",
  unknown: "#8A97A8",
};

export function Sparkline({
  values,
  className = "h-8 w-24",
  tone = "unknown",
}: SparklineProps) {
  if (values.length < 2) {
    return <div className={`${className} rounded-sm bg-raised`} />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = 96;
  const height = 32;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = values[values.length - 1];
  const lastX = width;
  const lastY = height - ((last - min) / span) * (height - 4) - 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={STROKE[tone]}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
      <circle cx={lastX} cy={lastY} r="2.2" fill={STROKE[tone]} />
    </svg>
  );
}
