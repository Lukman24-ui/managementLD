import { Home, Wallet, Target, Dumbbell, BookHeart, MessageCircleHeart, User, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Wallet, label: "Money", path: "/money" },
  { icon: Target, label: "Habits", path: "/habits" },
  { icon: BarChart3, label: "Stats", path: "/statistics" },
  { icon: BookHeart, label: "Journal", path: "/journal" },
  { icon: MessageCircleHeart, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom z-50">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all duration-300 min-w-[48px]",
                  isActive 
                    ? "text-turquoise bg-turquoise/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <div className="absolute -bottom-0 w-1 h-1 rounded-full bg-turquoise" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
