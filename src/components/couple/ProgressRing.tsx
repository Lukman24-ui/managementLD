import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: "turquoise" | "mint" | "happiness" | "accent";
  showLabel?: boolean;
  label?: string;
}

export const ProgressRing = ({
  progress,
  size = 80,
  strokeWidth = 8,
  className,
  color = "turquoise",
  showLabel = true,
  label,
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colors = {
    turquoise: "stroke-turquoise",
    mint: "stroke-mint-dark",
    happiness: "stroke-happiness",
    accent: "stroke-accent",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(colors[color], "transition-all duration-1000 ease-out")}
          style={{
            animation: "progress-ring 1.5s ease-out forwards",
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-foreground">{Math.round(progress)}%</span>
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
      )}
    </div>
  );
};
