import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  color?: "turquoise" | "mint" | "happiness" | "accent";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  vertical?: boolean;
}

export const ProgressBar = ({
  progress,
  className,
  color = "turquoise",
  size = "md",
  showLabel = false,
  vertical = false,
}: ProgressBarProps) => {
  const colors = {
    turquoise: "bg-turquoise",
    mint: "bg-mint-dark",
    happiness: "bg-happiness",
    accent: "bg-accent",
  };

  const sizes = {
    sm: vertical ? "w-3" : "h-2",
    md: vertical ? "w-4" : "h-3",
    lg: vertical ? "w-6" : "h-4",
  };

  if (vertical) {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <div className={cn("h-28 rounded-full bg-muted overflow-hidden relative", sizes[size])}>
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 rounded-full transition-all duration-1000 ease-out",
              colors[color]
            )}
            style={{ height: `${progress}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-sm font-semibold text-foreground">{Math.round(progress)}%</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("rounded-full bg-muted overflow-hidden", sizes[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out animate-progress-fill",
            colors[color]
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground mt-1">{Math.round(progress)}%</span>
      )}
    </div>
  );
};
