import { cn } from "@/lib/utils";
import { CoupleAvatar } from "./Avatar";

interface ChatBubbleProps {
  message: string;
  time: string;
  isOwn?: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export const ChatBubble = ({ message, time, isOwn = false, senderName, senderAvatar }: ChatBubbleProps) => {
  return (
    <div className={cn("flex gap-2 max-w-[85%]", isOwn ? "ml-auto flex-row-reverse" : "mr-auto")}>
      {!isOwn && senderName && (
        <CoupleAvatar name={senderName} src={senderAvatar} size="sm" />
      )}
      <div
        className={cn(
          "rounded-3xl px-4 py-3 transition-all duration-300",
          isOwn
            ? "bg-turquoise text-primary-foreground rounded-br-lg"
            : "bg-card shadow-soft rounded-bl-lg"
        )}
      >
        <p className="text-sm">{message}</p>
        <span
          className={cn(
            "text-[10px] mt-1 block",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {time}
        </span>
      </div>
    </div>
  );
};
