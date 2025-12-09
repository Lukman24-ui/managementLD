import { cn } from "@/lib/utils";

interface EmotionBarProps {
  label: string;
  value: number;
  color: "turquoise" | "happiness" | "mint" | "accent" | "muted";
}

const colorMap = {
  turquoise: "bg-turquoise",
  happiness: "bg-happiness",
  mint: "bg-mint-dark",
  accent: "bg-accent",
  muted: "bg-muted-foreground/50",
};

export const EmotionBar = ({ label, value, color }: EmotionBarProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-32 w-10 bg-muted rounded-full overflow-hidden flex items-end relative">
        <div
          className={cn(
            "w-full rounded-full transition-all duration-1000 ease-out",
            colorMap[color]
          )}
          style={{ height: `${value}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-foreground/80 rotate-0">
            {value}%
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

interface EmotionBarsProps {
  emotions: Array<{ label: string; value: number; color: EmotionBarProps["color"] }>;
}

export const EmotionBars = ({ emotions }: EmotionBarsProps) => {
  return (
    <div className="flex items-end justify-around gap-4">
      {emotions.map((emotion) => (
        <EmotionBar key={emotion.label} {...emotion} />
      ))}
    </div>
  );
};
