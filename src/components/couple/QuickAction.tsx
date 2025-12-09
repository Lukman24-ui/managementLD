import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  color?: "turquoise" | "mint" | "happiness" | "accent";
  className?: string;
}

export const QuickAction = ({ 
  icon: Icon, 
  label, 
  onClick,
  color = "turquoise",
  className 
}: QuickActionProps) => {
  const colors = {
    turquoise: "bg-turquoise/10 text-turquoise hover:bg-turquoise/20",
    mint: "bg-mint/50 text-turquoise-dark hover:bg-mint",
    happiness: "bg-happiness/10 text-happiness hover:bg-happiness/20",
    accent: "bg-accent/10 text-accent hover:bg-accent/20",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-3xl transition-all duration-300 active:scale-95",
        colors[color],
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-card shadow-soft flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-xs font-medium text-center leading-tight">{label}</span>
    </button>
  );
};
