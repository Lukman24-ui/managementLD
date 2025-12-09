import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, X, MapPin, Image } from "lucide-react";
import { useTravelMilestones } from "@/hooks/useTravelMilestones";

export const AddMilestoneDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addMilestone, uploadPhoto } = useTravelMilestones();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    let photoUrl = null;
    if (photoFile) {
      photoUrl = await uploadPhoto(photoFile);
    }

    await addMilestone({
      title: title.trim(),
      location: location.trim() || null,
      description: description.trim() || null,
      photo_url: photoUrl,
      photo_caption: caption.trim() || null,
      visited: false,
      visited_at: null,
    });

    // Reset form
    setTitle("");
    setLocation("");
    setDescription("");
    setCaption("");
    setPhotoPreview(null);
    setPhotoFile(null);
    setLoading(false);
    setOpen(false);
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-turquoise hover:bg-turquoise-dark">
          <Plus className="h-4 w-4" />
          Tambah Tempat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-turquoise" />
            Tambah Tempat Impian
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nama Tempat *</Label>
            <Input
              id="title"
              placeholder="Contoh: Menara Eiffel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <Input
              id="location"
              placeholder="Contoh: Paris, France"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Kenapa ingin kesini?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Foto Polaroid</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative">
                <div className="aspect-square max-w-[200px] mx-auto bg-white p-2 rounded shadow-lg">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-sm"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-0 right-0 h-6 w-6"
                  onClick={clearPhoto}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Upload foto
                  </span>
                </div>
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Teks di Foto</Label>
            <Input
              id="caption"
              placeholder="Contoh: Our dream destination! 💕"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-turquoise hover:bg-turquoise-dark"
            disabled={loading || !title.trim()}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
