import { cn } from "@/lib/utils";
import { Heart, Star, Gift, Trophy, Plane } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Milestone {
  icon: LucideIcon;
  title: string;
  date: string;
  completed: boolean;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export const MilestoneTimeline = ({ milestones }: MilestoneTimelineProps) => {
  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => {
        const Icon = milestone.icon;
        return (
          <div key={index} className="flex items-center gap-4">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                milestone.completed
                  ? "bg-turquoise text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-medium text-sm",
                milestone.completed ? "text-foreground" : "text-muted-foreground"
              )}>
                {milestone.title}
              </h4>
              <p className="text-xs text-muted-foreground">{milestone.date}</p>
            </div>
            {milestone.completed && (
              <div className="w-6 h-6 rounded-full bg-mint flex items-center justify-center">
                <Heart className="h-3 w-3 text-turquoise-dark" fill="currentColor" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const defaultMilestones: Milestone[] = [
  { icon: Heart, title: "First Date", date: "Jan 15, 2023", completed: true },
  { icon: Star, title: "6 Months Together", date: "Jul 15, 2023", completed: true },
  { icon: Gift, title: "First Anniversary", date: "Jan 15, 2024", completed: true },
  { icon: Plane, title: "Trip to Bali", date: "Mar 20, 2024", completed: true },
  { icon: Trophy, title: "Fitness Goal Achieved", date: "Coming soon", completed: false },
];
