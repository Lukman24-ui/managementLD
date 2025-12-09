import { cn } from "@/lib/utils";
import { MapPin, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PolaroidCardProps {
  title: string;
  location?: string | null;
  photoUrl?: string | null;
  caption?: string | null;
  visited?: boolean;
  onToggleVisited?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export const PolaroidCard = ({
  title,
  location,
  photoUrl,
  caption,
  visited = false,
  onToggleVisited,
  onDelete,
  onClick,
}: PolaroidCardProps) => {
  return (
    <div
      className={cn(
        "relative bg-white rounded-sm shadow-lg p-3 pb-16 transition-all duration-300 hover:shadow-xl cursor-pointer",
        "transform hover:-rotate-1 hover:scale-105",
        visited && "ring-2 ring-turquoise"
      )}
      onClick={onClick}
      style={{
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Photo area */}
      <div className="aspect-square bg-muted rounded-sm overflow-hidden mb-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-mint to-turquoise/20">
            <MapPin className="h-12 w-12 text-turquoise/50" />
          </div>
        )}
      </div>

      {/* Caption overlay on photo */}
      {caption && (
        <div className="absolute top-6 left-6 right-6">
          <div 
            className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm transform -rotate-2"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            <p className="text-sm text-foreground/80 text-center">{caption}</p>
          </div>
        </div>
      )}

      {/* Title and location */}
      <div className="absolute bottom-3 left-3 right-3">
        <h3 
          className="font-medium text-foreground text-center truncate mb-1"
          style={{ fontFamily: "'Caveat', cursive", fontSize: "1.25rem" }}
        >
          {title}
        </h3>
        {location && (
          <div className="flex items-center justify-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="text-xs truncate">{location}</span>
          </div>
        )}
      </div>

      {/* Visited badge */}
      {visited && (
        <div className="absolute top-2 right-2 bg-turquoise text-white rounded-full p-1 shadow-md">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute top-2 left-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
        {onToggleVisited && (
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisited();
            }}
          >
            <Check className={cn("h-3 w-3", visited && "text-turquoise")} />
          </Button>
        )}
        {onDelete && (
          <Button
            size="icon"
            variant="destructive"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
