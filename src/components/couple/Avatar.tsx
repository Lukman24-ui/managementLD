import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  ring?: boolean;
  className?: string;
}

export const CoupleAvatar = ({ src, name, size = "md", ring = false, className }: AvatarProps) => {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center font-semibold overflow-hidden transition-transform duration-300 hover:scale-105",
        sizes[size],
        ring && "ring-3 ring-turquoise ring-offset-2 ring-offset-background",
        !src && "bg-gradient-to-br from-turquoise to-turquoise-dark text-primary-foreground",
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

interface CoupleAvatarsProps {
  partner1: { name: string; src?: string };
  partner2: { name: string; src?: string };
  size?: "sm" | "md" | "lg";
}

export const CoupleAvatars = ({ partner1, partner2, size = "md" }: CoupleAvatarsProps) => {
  return (
    <div className="flex items-center -space-x-3">
      <CoupleAvatar {...partner1} size={size} ring className="z-10" />
      <CoupleAvatar {...partner2} size={size} ring className="z-0" />
    </div>
  );
};
