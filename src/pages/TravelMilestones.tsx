import { useState } from "react";
import { BottomNav } from "@/components/couple/BottomNav";
import { PolaroidCard } from "@/components/couple/PolaroidCard";
import { AddMilestoneDialog } from "@/components/couple/AddMilestoneDialog";
import { useTravelMilestones, TravelMilestone } from "@/hooks/useTravelMilestones";
import { MapPin, Plane, Check, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const TravelMilestones = () => {
  const { milestones, loading, updateMilestone, deleteMilestone } = useTravelMilestones();
  const [selectedMilestone, setSelectedMilestone] = useState<TravelMilestone | null>(null);
  const [editCaption, setEditCaption] = useState("");

  const visitedMilestones = milestones.filter((m) => m.visited);
  const wishlistMilestones = milestones.filter((m) => !m.visited);

  const handleToggleVisited = async (milestone: TravelMilestone) => {
    await updateMilestone(milestone.id, {
      visited: !milestone.visited,
      visited_at: !milestone.visited ? new Date().toISOString() : null,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus tempat ini?")) {
      await deleteMilestone(id);
    }
  };

  const handleOpenDetail = (milestone: TravelMilestone) => {
    setSelectedMilestone(milestone);
    setEditCaption(milestone.photo_caption || "");
  };

  const handleSaveCaption = async () => {
    if (selectedMilestone) {
      await updateMilestone(selectedMilestone.id, {
        photo_caption: editCaption.trim() || null,
      });
      setSelectedMilestone(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-turquoise to-turquoise-dark text-white p-6 pt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Plane className="h-6 w-6" />
              Travel Bucket List
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Tempat impian yang ingin dikunjungi bersama
            </p>
          </div>
          <AddMilestoneDialog />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Wishlist</span>
            </div>
            <p className="text-2xl font-bold">{wishlistMilestones.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <Check className="h-4 w-4" />
              <span className="text-sm">Dikunjungi</span>
            </div>
            <p className="text-2xl font-bold">{visitedMilestones.length}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs defaultValue="wishlist" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="wishlist" className="gap-2">
              <Clock className="h-4 w-4" />
              Wishlist ({wishlistMilestones.length})
            </TabsTrigger>
            <TabsTrigger value="visited" className="gap-2">
              <Check className="h-4 w-4" />
              Dikunjungi ({visitedMilestones.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist">
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : wishlistMilestones.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada tempat di wishlist</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tambahkan tempat impian kalian!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {wishlistMilestones.map((milestone) => (
                  <PolaroidCard
                    key={milestone.id}
                    title={milestone.title}
                    location={milestone.location}
                    photoUrl={milestone.photo_url}
                    caption={milestone.photo_caption}
                    visited={milestone.visited}
                    onToggleVisited={() => handleToggleVisited(milestone)}
                    onDelete={() => handleDelete(milestone.id)}
                    onClick={() => handleOpenDetail(milestone)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="visited">
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : visitedMilestones.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada tempat yang dikunjungi</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tandai tempat yang sudah dikunjungi!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {visitedMilestones.map((milestone) => (
                  <PolaroidCard
                    key={milestone.id}
                    title={milestone.title}
                    location={milestone.location}
                    photoUrl={milestone.photo_url}
                    caption={milestone.photo_caption}
                    visited={milestone.visited}
                    onToggleVisited={() => handleToggleVisited(milestone)}
                    onDelete={() => handleDelete(milestone.id)}
                    onClick={() => handleOpenDetail(milestone)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedMilestone} onOpenChange={() => setSelectedMilestone(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedMilestone?.title}</DialogTitle>
          </DialogHeader>
          {selectedMilestone && (
            <div className="space-y-4">
              {/* Polaroid preview */}
              <div className="bg-white p-3 rounded shadow-lg mx-auto max-w-[280px]">
                <div className="aspect-square bg-muted rounded-sm overflow-hidden relative">
                  {selectedMilestone.photo_url ? (
                    <img
                      src={selectedMilestone.photo_url}
                      alt={selectedMilestone.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-mint to-turquoise/20">
                      <MapPin className="h-16 w-16 text-turquoise/50" />
                    </div>
                  )}
                  {editCaption && (
                    <div className="absolute top-4 left-4 right-4">
                      <div 
                        className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded shadow-sm transform -rotate-2"
                        style={{ fontFamily: "'Caveat', cursive" }}
                      >
                        <p className="text-sm text-foreground/80 text-center">{editCaption}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <h3 
                    className="font-medium text-foreground"
                    style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem" }}
                  >
                    {selectedMilestone.title}
                  </h3>
                  {selectedMilestone.location && (
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs">{selectedMilestone.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit caption */}
              <div className="space-y-2">
                <Label htmlFor="edit-caption">Teks di Foto</Label>
                <Input
                  id="edit-caption"
                  placeholder="Tulis pesan di foto..."
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                />
              </div>

              {/* Description */}
              {selectedMilestone.description && (
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <p className="text-sm text-muted-foreground">{selectedMilestone.description}</p>
                </div>
              )}

              {/* Visited date */}
              {selectedMilestone.visited && selectedMilestone.visited_at && (
                <div className="flex items-center gap-2 text-sm text-turquoise">
                  <Check className="h-4 w-4" />
                  <span>
                    Dikunjungi: {new Date(selectedMilestone.visited_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleToggleVisited(selectedMilestone)}
                >
                  {selectedMilestone.visited ? "Tandai Belum Dikunjungi" : "Tandai Sudah Dikunjungi"}
                </Button>
                <Button
                  className="flex-1 bg-turquoise hover:bg-turquoise-dark"
                  onClick={handleSaveCaption}
                >
                  Simpan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default TravelMilestones;
