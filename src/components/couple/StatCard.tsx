import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: { value: number; positive: boolean };
  color?: "turquoise" | "mint" | "happiness" | "accent";
  className?: string;
}

export const StatCard = ({
  icon: Icon,
  value,
  label,
  trend,
  color = "turquoise",
  className,
}: StatCardProps) => {
  const iconColors = {
    turquoise: "bg-turquoise/10 text-turquoise",
    mint: "bg-mint text-turquoise-dark",
    happiness: "bg-happiness/10 text-happiness",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", iconColors[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">{value}</span>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium",
                trend.positive ? "text-pastel-green" : "text-destructive"
              )}
            >
              {trend.positive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
};
