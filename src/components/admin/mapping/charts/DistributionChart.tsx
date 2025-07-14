
interface DistributionChartProps {
  data: Record<string, number>;
  total: number;
  colors: Record<string, string>;
}

export function DistributionChart({
  data,
  total,
  colors,
}: DistributionChartProps) {
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No data available
      </div>
    );
  }

  const segments = Object.entries(data).map(([key, value]) => ({
    key,
    value,
    percentage: (value / total) * 100,
    color: colors[key] || "#64748b",
  }));

  // Calculate cumulative percentages for SVG paths
  let cumulativePercentage = 0;
  const segmentsWithAngles = segments.map((segment) => {
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + segment.percentage) / 100) * 360;
    cumulativePercentage += segment.percentage;

    return {
      ...segment,
      startAngle,
      endAngle,
    };
  });

  const createArcPath = (
    startAngle: number,
    endAngle: number,
    radius = 40,
    innerRadius = 20
  ) => {
    const start = polarToCartesian(50, 50, radius, endAngle);
    const end = polarToCartesian(50, 50, radius, startAngle);
    const innerStart = polarToCartesian(50, 50, innerRadius, endAngle);
    const innerEnd = polarToCartesian(50, 50, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "L",
      innerEnd.x,
      innerEnd.y,
      "A",
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      1,
      innerStart.x,
      innerStart.y,
      "Z",
    ].join(" ");
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="flex items-center space-x-6">
      {/* Donut Chart */}
      <div className="relative">
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          className="transform -rotate-90"
        >
          {segmentsWithAngles.map((segment) => (
            <path
              key={segment.key}
              d={createArcPath(segment.startAngle, segment.endAngle)}
              fill={segment.color}
              className="transition-opacity hover:opacity-80"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 flex-1">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm capitalize">{segment.key}</span>
            </div>
            <div className="text-sm font-medium">
              {segment.value} ({segment.percentage.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
