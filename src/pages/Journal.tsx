import { AppCard } from "@/components/couple/AppCard";
import { CoupleAvatars } from "@/components/couple/Avatar";
import { EmotionBars } from "@/components/couple/EmotionBar";
import { ProgressRing } from "@/components/couple/ProgressRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useJournal } from "@/hooks/useJournal";
import { Plus, Heart, Sparkles, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const moodOptions = [
  { emoji: '😊', label: 'Bahagia', score: 5 },
  { emoji: '🥰', label: 'Cinta', score: 5 },
  { emoji: '😌', label: 'Tenang', score: 4 },
  { emoji: '😐', label: 'Biasa', score: 3 },
  { emoji: '😔', label: 'Sedih', score: 2 },
  { emoji: '😰', label: 'Cemas', score: 1 },
];

const Journal = () => {
  const { profile, partnerProfile, user } = useAuth();
  const { entries, loading, addEntry, deleteEntry } = useJournal();
  const userName = profile?.full_name?.split(' ')[0] || 'Kamu';
  const partnerName = partnerProfile?.full_name?.split(' ')[0] || 'Pasangan';

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    gratitude: '',
    mood_score: 5,
    tags: '',
  });

  const handleSubmit = async () => {
    if (!formData.content) return;
    setSaving(true);
    const success = await addEntry({
      content: formData.content,
      gratitude: formData.gratitude || undefined,
      mood_score: formData.mood_score,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
    });
    setSaving(false);
    if (success) {
      setShowAddDialog(false);
      setFormData({ content: '', gratitude: '', mood_score: 5, tags: '' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteEntry(deleteId);
    setDeleteId(null);
  };

  const getMoodEmoji = (score: number | null) => {
    if (!score) return '😊';
    const mood = moodOptions.find(m => m.score === score);
    return mood?.emoji || '😊';
  };

  // Calculate mood stats
  const avgMood = entries.length > 0 
    ? Math.round(entries.reduce((sum, e) => sum + (e.mood_score || 3), 0) / entries.length * 20)
    : 0;

  const emotions = [
    { label: "Bahagia", value: avgMood, color: "happiness" as const },
    { label: "Tenang", value: Math.max(0, avgMood - 10), color: "mint" as const },
    { label: "Cemas", value: Math.max(0, 100 - avgMood), color: "accent" as const },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Jurnal Ku</h1>
            <p className="text-sm text-muted-foreground">Lacak mood bersama</p>
          </div>
          <CoupleAvatars
            partner1={{ name: userName }}
            partner2={{ name: partnerName }}
            size="md"
          />
        </div>

        {/* Mood Score */}
        <AppCard variant="elevated" className="mb-4 text-center" delay={100}>
          <h2 className="text-6xl font-bold text-foreground mb-2">{entries.length}</h2>
          <p className="text-muted-foreground mb-4">Total Jurnal</p>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-turquoise" fill="currentColor" />
            <span className="text-sm font-medium">Rata-rata Mood: {avgMood}%</span>
          </div>
          <ProgressRing progress={avgMood} size={48} strokeWidth={4} color="turquoise" showLabel={false} className="mx-auto" />
        </AppCard>

        {/* Emotions */}
        <AppCard className="mb-4" delay={200}>
          <h3 className="text-base font-semibold text-foreground mb-2">Emosi</h3>
          <p className="text-sm text-muted-foreground mb-4">Ringkasan mood kamu</p>
          
          <EmotionBars emotions={emotions} />
        </AppCard>

        {/* Gratitude Section */}
        {entries.length > 0 && entries[0].gratitude && (
          <div className="grid grid-cols-2 gap-3 mb-6 opacity-0 animate-fade-in-up stagger-3">
            <AppCard className="bg-mint/30">
              <Sparkles className="h-5 w-5 text-turquoise mb-2" />
              <h4 className="font-semibold text-sm mb-1">Syukur Terakhir</h4>
              <p className="text-xs text-muted-foreground">"{entries[0].gratitude}"</p>
            </AppCard>
          </div>
        )}

        {/* Journal Entries */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">Entri Terbaru</h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-turquoise" />
            </div>
          ) : entries.length === 0 ? (
            <AppCard className="text-center py-8">
              <p className="text-muted-foreground">Belum ada jurnal. Tulis jurnal pertamamu!</p>
            </AppCard>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <AppCard key={entry.id} className="hover:shadow-elevated transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-turquoise/10 flex items-center justify-center text-xl">
                      {getMoodEmoji(entry.mood_score)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.entry_date).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 mb-2">{entry.content}</p>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-mint/50 text-[10px] font-medium text-turquoise-dark"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </AppCard>
              ))}
            </div>
          )}
        </div>

        {/* Create Journal Button */}
        <Button className="w-full" variant="happiness" size="lg" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Buat Jurnal Baru
        </Button>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tulis Jurnal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Mood Hari Ini</Label>
              <div className="flex gap-2 mt-2">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.score}
                    onClick={() => setFormData({ ...formData, mood_score: mood.score })}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                      formData.mood_score === mood.score 
                        ? 'bg-turquoise scale-110' 
                        : 'bg-muted hover:bg-turquoise/20'
                    }`}
                  >
                    {mood.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Apa yang kamu rasakan hari ini?</Label>
              <Textarea
                placeholder="Tulis perasaanmu..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>Apa yang kamu syukuri hari ini? (Opsional)</Label>
              <Input
                placeholder="Aku bersyukur untuk..."
                value={formData.gratitude}
                onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })}
              />
            </div>
            <div>
              <Label>Tags (pisahkan dengan koma)</Label>
              <Input
                placeholder="cinta, syukur, bahagia"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={saving || !formData.content}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jurnal?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Jurnal akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Journal;
