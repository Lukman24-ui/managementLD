import { cn } from "@/lib/utils";
import { Check, LucideIcon } from "lucide-react";
import { ProgressBar } from "./ProgressBar";

interface HabitCardProps {
  icon: LucideIcon;
  title: string;
  progress: number;
  streak: number;
  completed?: boolean;
  partner1Progress?: number;
  partner2Progress?: number;
  onToggle?: () => void;
  color?: "turquoise" | "mint" | "happiness" | "accent";
}

export const HabitCard = ({
  icon: Icon,
  title,
  progress,
  streak,
  completed = false,
  partner1Progress,
  partner2Progress,
  onToggle,
  color = "turquoise",
}: HabitCardProps) => {
  const iconColors = {
    turquoise: "bg-turquoise/10 text-turquoise",
    mint: "bg-mint text-turquoise-dark",
    happiness: "bg-happiness/10 text-happiness",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className="bg-card rounded-3xl p-4 shadow-card transition-all duration-300 hover:shadow-elevated">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center", iconColors[color])}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground">🔥 {streak} day streak</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
            completed
              ? "bg-turquoise text-primary-foreground"
              : "border-2 border-border hover:border-turquoise"
          )}
        >
          {completed && <Check className="h-4 w-4" />}
        </button>
      </div>

      <ProgressBar progress={progress} color={color} size="sm" className="mb-3" />

      {partner1Progress !== undefined && partner2Progress !== undefined && (
        <div className="flex gap-4 pt-2 border-t border-border">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">You</span>
              <span className="text-xs font-medium">{partner1Progress}%</span>
            </div>
            <ProgressBar progress={partner1Progress} color="turquoise" size="sm" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Partner</span>
              <span className="text-xs font-medium">{partner2Progress}%</span>
            </div>
            <ProgressBar progress={partner2Progress} color="mint" size="sm" />
          </div>
        </div>
      )}
    </div>
  );
};
