import React from "react";

interface RiskGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score, maxScore = 100, size = 160, label }) => {
  const center = size / 2;
  const radius = (size - 36) / 2;
  const strokeWidth = size * 0.075;

  // 270° arc: starts at 135° (bottom-left), ends at 45° (bottom-right)
  const startAngleDeg = 135;
  const totalAngleDeg = 270;
  const fraction = Math.min(Math.max(score / maxScore, 0), 1);

  // Arc circumference for 270°
  const circumference = (totalAngleDeg / 360) * 2 * Math.PI * radius;
  const filledLength = fraction * circumference;

  // Convert degrees to radians (SVG uses clockwise from 3-o'clock)
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

  const arcPath = (r: number, startDeg: number, sweepDeg: number) => {
    const startRad = toRad(startDeg);
    const endRad = toRad(startDeg + sweepDeg);
    const x1 = center + r * Math.cos(startRad);
    const y1 = center + r * Math.sin(startRad);
    const x2 = center + r * Math.cos(endRad);
    const y2 = center + r * Math.sin(endRad);
    const largeArc = sweepDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // White dot position at the end of the filled arc
  const dotAngleDeg = startAngleDeg + fraction * totalAngleDeg;
  const dotRad = toRad(dotAngleDeg);
  const dotX = center + radius * Math.cos(dotRad);
  const dotY = center + radius * Math.sin(dotRad);

  const getColor = () => {
    if (fraction >= 0.7) return "hsl(var(--score-safe))";
    if (fraction >= 0.4) return "hsl(var(--score-warning))";
    return "hsl(var(--score-danger))";
  };

  const getSeverity = () => {
    if (fraction >= 0.7) return { text: "Low Risk", colorClass: "bg-score-safe/15 text-score-safe" };
    if (fraction >= 0.4) return { text: "Medium", colorClass: "bg-score-warning/15 text-score-warning" };
    return { text: "High Risk", colorClass: "bg-score-danger/15 text-score-danger" };
  };

  const severity = getSeverity();
  const gradientId = `gauge-grad-${Math.random().toString(36).slice(2, 8)}`;

  // Scale label positions
  const startLabelRad = toRad(startAngleDeg);
  const endLabelRad = toRad(startAngleDeg + totalAngleDeg);
  const labelR = radius + strokeWidth / 2 + (size > 120 ? 18 : 14);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--score-danger))" />
            <stop offset="45%" stopColor="hsl(var(--score-warning))" />
            <stop offset="100%" stopColor="hsl(var(--score-safe))" />
          </linearGradient>
          <filter id={`glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <path
          d={arcPath(radius, startAngleDeg, totalAngleDeg)}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored arc */}
        <path
          d={arcPath(radius, startAngleDeg, totalAngleDeg)}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference - filledLength}
          className="transition-all duration-1000 ease-out"
        />

        {/* White dot at end of filled arc */}
        <circle
          cx={dotX}
          cy={dotY}
          r={strokeWidth * 0.55}
          fill="white"
          filter={`url(#glow-${gradientId})`}
          className="transition-all duration-1000 ease-out"
        />

        {/* "Score" label */}
        <text
          x={center}
          y={center - size * 0.1}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={size * 0.065}
          fontWeight="500"
          fontFamily="'Space Grotesk', sans-serif"
          letterSpacing="0.1em"
        >
          {label || "Score"}
        </text>

        {/* Score number */}
        <text
          x={center}
          y={center + size * 0.08}
          textAnchor="middle"
          className="fill-foreground"
          fontSize={size * 0.24}
          fontWeight="700"
          fontFamily="'Space Grotesk', sans-serif"
        >
          {maxScore === 100 ? score : Math.round(score * (1000 / maxScore))}
        </text>

        {/* Scale labels: 0 and max */}
        <text
          x={center + labelR * Math.cos(startLabelRad)}
          y={center + labelR * Math.sin(startLabelRad)}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={size * 0.055}
          fontWeight="500"
        >
          0
        </text>
        <text
          x={center + labelR * Math.cos(endLabelRad)}
          y={center + labelR * Math.sin(endLabelRad)}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={size * 0.055}
          fontWeight="500"
        >
          {maxScore === 100 ? "100" : "1000"}
        </text>
      </svg>

      {/* Severity pill */}
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${severity.colorClass}`}>
        {severity.text}
      </span>
    </div>
  );
};

export default RiskGauge;
