import { cn } from "@/lib/utils";
import { useState } from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const WeekCalendar = () => {
  const [selectedDay, setSelectedDay] = useState(3); // Thursday selected by default
  
  // Generate dates for the current week
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + mondayOffset + i);
    return date.getDate();
  });

  return (
    <div className="flex items-center justify-between gap-1">
      {days.map((day, index) => {
        const isSelected = index === selectedDay;
        const isToday = index === (currentDay === 0 ? 6 : currentDay - 1);
        
        return (
          <button
            key={day}
            onClick={() => setSelectedDay(index)}
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all duration-300 min-w-[40px]",
              isSelected 
                ? "bg-turquoise text-primary-foreground shadow-soft" 
                : "hover:bg-muted"
            )}
          >
            <span className={cn(
              "text-xs font-medium",
              isSelected ? "text-primary-foreground" : "text-muted-foreground"
            )}>
              {day}
            </span>
            <span className={cn(
              "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all",
              isSelected 
                ? "bg-primary-foreground/20" 
                : isToday 
                  ? "bg-happiness/20 text-happiness" 
                  : ""
            )}>
              {weekDates[index]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
