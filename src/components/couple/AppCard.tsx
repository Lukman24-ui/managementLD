import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface AppCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "mint" | "elevated" | "sunset";
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
}

export const AppCard = ({ 
  children, 
  className, 
  variant = "default",
  animate = true,
  delay = 0,
  onClick
}: AppCardProps) => {
  const variants = {
    default: "bg-card shadow-card",
    gradient: "gradient-card shadow-card",
    mint: "bg-mint/30 shadow-soft",
    elevated: "bg-card shadow-elevated",
    sunset: "gradient-sunset shadow-card",
  };

  return (
    <div 
      className={cn(
        "rounded-3xl p-5 transition-all duration-300",
        variants[variant],
        animate && "opacity-0 animate-fade-in-up",
        onClick && "cursor-pointer",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
