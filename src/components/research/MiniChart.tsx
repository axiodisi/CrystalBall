type Line = {
  values: number[];
  color: string;
};

type MiniChartProps = {
  lines: Line[];
  bands?: { mean: number; std: number };
  className?: string;
};

export function MiniChart({
  lines,
  bands,
  className = "h-36 w-full",
}: MiniChartProps) {
  const values = lines.flatMap((line) => line.values);
  if (values.length < 2) {
    return <div className={`${className} rounded-md bg-raised`} />;
  }

  const extras = bands
    ? [
        bands.mean + 2 * bands.std,
        bands.mean + bands.std,
        bands.mean - bands.std,
        bands.mean - 2 * bands.std,
        bands.mean,
      ]
    : [];
  const min = Math.min(...values, ...extras);
  const max = Math.max(...values, ...extras);
  const span = max - min || 1;
  const width = 320;
  const height = 144;

  function y(value: number) {
    return height - ((value - min) / span) * (height - 8) - 4;
  }

  function points(series: number[]) {
    return series
      .map((value, index) => {
        const x = (index / (series.length - 1)) * width;
        return `${x.toFixed(1)},${y(value).toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      {bands ? (
        <>
          <rect
            x="0"
            y={y(bands.mean + 2 * bands.std)}
            width={width}
            height={y(bands.mean - 2 * bands.std) - y(bands.mean + 2 * bands.std)}
            fill="rgba(200,90,90,0.08)"
          />
          <rect
            x="0"
            y={y(bands.mean + bands.std)}
            width={width}
            height={y(bands.mean - bands.std) - y(bands.mean + bands.std)}
            fill="rgba(230,162,60,0.10)"
          />
          <line
            x1="0"
            x2={width}
            y1={y(bands.mean)}
            y2={y(bands.mean)}
            stroke="#8A97A8"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
        </>
      ) : null}
      {lines.map((line) => (
        <polyline
          key={line.color}
          fill="none"
          stroke={line.color}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points(line.values)}
        />
      ))}
    </svg>
  );
}
