import { cn } from "@/lib/utils";

interface ActivityRingProps {
  steps: { current: number; goal: number };
  calories: { current: number; goal: number };
  minutes: { current: number; goal: number };
  size?: number;
}

export const ActivityRing = ({ steps, calories, minutes, size = 160 }: ActivityRingProps) => {
  const strokeWidth = 12;
  const gap = 4;
  
  const rings = [
    { progress: (steps.current / steps.goal) * 100, color: "stroke-turquoise", radius: (size - strokeWidth) / 2 },
    { progress: (calories.current / calories.goal) * 100, color: "stroke-happiness", radius: (size - strokeWidth) / 2 - strokeWidth - gap },
    { progress: (minutes.current / minutes.goal) * 100, color: "stroke-mint-dark", radius: (size - strokeWidth) / 2 - 2 * (strokeWidth + gap) },
  ];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {rings.map((ring, index) => {
          const circumference = ring.radius * 2 * Math.PI;
          const offset = circumference - (Math.min(ring.progress, 100) / 100) * circumference;
          
          return (
            <g key={index}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={ring.radius}
                fill="none"
                strokeWidth={strokeWidth}
                className="stroke-muted"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={ring.radius}
                fill="none"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={cn(ring.color, "transition-all duration-1000 ease-out")}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{steps.current.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">steps</span>
      </div>
    </div>
  );
};
