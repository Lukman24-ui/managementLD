import { cn } from "@/lib/utils";
import { CoupleAvatar } from "./Avatar";
import { LucideIcon } from "lucide-react";

interface TransactionItemProps {
  icon: LucideIcon;
  category: string;
  description: string;
  amount: number;
  date: string;
  partnerName: string;
  partnerAvatar?: string;
  type: "income" | "expense";
}

export const TransactionItem = ({
  icon: Icon,
  category,
  description,
  amount,
  date,
  partnerName,
  partnerAvatar,
  type,
}: TransactionItemProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-card hover:bg-muted/50 transition-colors">
      <div className="w-11 h-11 rounded-2xl bg-turquoise/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-turquoise" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">{category}</span>
          <CoupleAvatar name={partnerName} src={partnerAvatar} size="sm" />
        </div>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <div className="text-right">
        <span
          className={cn(
            "font-bold text-sm",
            type === "income" ? "text-pastel-green" : "text-foreground"
          )}
        >
          {type === "expense" ? "-" : "+"}{formatCurrency(amount)}
        </span>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
};
