import { AppCard } from "@/components/couple/AppCard";
import { CoupleAvatars } from "@/components/couple/Avatar";
import { ProgressBar } from "@/components/couple/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { Moon, Brain, Droplets, BookOpen, Dumbbell, Apple, Plus, Trash2, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const iconMap: Record<string, any> = {
  '🌙': Moon,
  '🧠': Brain,
  '💧': Droplets,
  '📖': BookOpen,
  '💪': Dumbbell,
  '🍎': Apple,
};

const colorOptions = ['turquoise', 'mint', 'happiness', 'accent'];

const Habits = () => {
  const { profile, partnerProfile, user } = useAuth();
  const { habits, loading, addHabit, deleteHabit, toggleCompletion, isCompletedToday } = useHabits();
  const userName = profile?.full_name?.split(' ')[0] || 'Kamu';
  const partnerName = partnerProfile?.full_name?.split(' ')[0] || 'Pasangan';

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    icon: '🌙',
    color: 'turquoise',
  });

  const handleSubmit = async () => {
    if (!formData.title) return;
    setSaving(true);
    const success = await addHabit({
      title: formData.title,
      icon: formData.icon,
      color: formData.color,
    });
    setSaving(false);
    if (success) {
      setShowAddDialog(false);
      setFormData({ title: '', icon: '🌙', color: 'turquoise' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteHabit(deleteId);
    setDeleteId(null);
  };

  const completedCount = habits.filter(h => isCompletedToday(h.id)).length;
  const totalProgress = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kebiasaan Bersama</h1>
            <p className="text-sm text-muted-foreground">Bangun kebiasaan bersama</p>
          </div>
          <CoupleAvatars
            partner1={{ name: userName }}
            partner2={{ name: partnerName }}
            size="md"
          />
        </div>

        {/* Progress Overview */}
        <AppCard variant="gradient" className="mb-4" delay={100}>
          <h3 className="text-base font-semibold text-foreground mb-4">Progres Hari Ini</h3>
          
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-turquoise mb-1">{totalProgress}%</p>
            <p className="text-sm text-muted-foreground">{completedCount} dari {habits.length} kebiasaan selesai</p>
          </div>
          
          <ProgressBar progress={totalProgress} size="lg" color="turquoise" />
        </AppCard>

        {/* Couple Comparison */}
        <AppCard className="mb-4" delay={200}>
          <h3 className="text-base font-semibold text-foreground mb-4">Pencapaian Couple</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-turquoise" />
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                <span className="text-sm font-bold text-turquoise">{totalProgress}%</span>
              </div>
              <ProgressBar progress={totalProgress} color="turquoise" size="md" />
            </div>
          </div>
        </AppCard>

        {/* Habit List */}
        <div className="mb-6 opacity-0 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">Kebiasaan Harian</h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-turquoise" />
            </div>
          ) : habits.length === 0 ? (
            <AppCard className="text-center py-8">
              <p className="text-muted-foreground">Belum ada kebiasaan. Tambahkan kebiasaan pertamamu!</p>
            </AppCard>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const completed = isCompletedToday(habit.id);
                const Icon = iconMap[habit.icon] || Moon;
                return (
                  <AppCard key={habit.id} className={`flex items-center gap-3 ${completed ? 'bg-turquoise/10' : ''}`}>
                    <button
                      onClick={() => toggleCompletion(habit.id)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        completed 
                          ? 'bg-turquoise text-primary-foreground' 
                          : 'bg-muted hover:bg-turquoise/20'
                      }`}
                    >
                      {completed ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6 text-turquoise" />}
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {habit.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {completed ? 'Selesai hari ini!' : 'Belum selesai'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(habit.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AppCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Habit FAB */}
        <Button 
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-elevated z-40"
          size="icon-lg"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kebiasaan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama Kebiasaan</Label>
              <Input
                placeholder="Contoh: Tidur 8 Jam"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Icon</Label>
              <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(iconMap).map((icon) => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Warna</Label>
              <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={saving || !formData.title}>
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
            <AlertDialogTitle>Hapus Kebiasaan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kebiasaan akan dihapus secara permanen.
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

export default Habits;
