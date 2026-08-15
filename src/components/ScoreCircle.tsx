"use client";

export default function ScoreCircle({
  score,
  size = 56,
  label,
  colorClass,
}: {
  score: number;
  size?: number;
  label?: string;
  colorClass?: string;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const color =
    colorClass ||
    (score >= 90
      ? "#ef4444"
      : score >= 80
        ? "#10b981"
        : score >= 65
          ? "#f59e0b"
          : "#64748b");

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(51, 65, 85, 0.5)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={size * 0.26}
          fontWeight="bold"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
        >
          {score}%
        </text>
      </svg>
      {label && (
        <span className="text-[10px] text-slate-400 font-medium">{label}</span>
      )}
    </div>
  );
}
