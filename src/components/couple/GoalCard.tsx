import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

interface GoalCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  progress: number;
  target: string;
  current: string;
  color?: "turquoise" | "mint" | "happiness" | "accent";
}

export const GoalCard = ({
  icon: Icon,
  title,
  description,
  progress,
  target,
  current,
  color = "turquoise",
}: GoalCardProps) => {
  const iconColors = {
    turquoise: "bg-turquoise/10 text-turquoise",
    mint: "bg-mint text-turquoise-dark",
    happiness: "bg-happiness/10 text-happiness",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className="bg-card rounded-3xl p-4 shadow-card transition-all hover:shadow-elevated">
      <div className="flex items-start gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", iconColors[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{description}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{current}</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{target}</span>
          </div>
        </div>
        <ProgressRing progress={progress} size={56} strokeWidth={6} color={color} showLabel={false} />
      </div>
    </div>
  );
};
