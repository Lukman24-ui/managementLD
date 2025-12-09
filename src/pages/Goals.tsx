import { AppCard } from "@/components/couple/AppCard";
import { CoupleAvatars } from "@/components/couple/Avatar";
import { ProgressRing } from "@/components/couple/ProgressRing";
import { ProgressBar } from "@/components/couple/ProgressBar";
import { MilestoneTimeline, defaultMilestones } from "@/components/couple/MilestoneTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useGoals } from "@/hooks/useGoals";
import { 
  Plane, 
  Home, 
  Dumbbell, 
  GraduationCap, 
  Trophy,
  Star,
  Plus,
  CheckCircle2,
  Target,
  Trash2,
  Loader2
} from "lucide-react";
import { useState, useMemo } from "react"; // ✅ PERBAIKAN: Import useMemo untuk badges
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

const iconOptions = ['🎯', '✈️', '🏠', '💪', '📚', '💰', '❤️', '🌟'];

const Goals = () => {
  const { profile, partnerProfile } = useAuth();
  // Pastikan useGoals mengembalikan nilai yang benar
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useGoals(); 
  const userName = profile?.full_name?.split(' ')[0] || 'Kamu';
  const partnerName = partnerProfile?.full_name?.split(' ')[0] || 'Pasangan';

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🎯',
    // ✅ PERBAIKAN: Gunakan string untuk target_amount di state form
    target_amount: '', 
  });

  const handleSubmit = async () => {
    if (!formData.title) return;
    
    // ✅ PERBAIKAN: Validasi sederhana untuk target amount
    const targetAmountFloat = formData.target_amount ? parseFloat(formData.target_amount.replace(/[^0-9.]/g, '')) : undefined;
    
    if (formData.target_amount && (isNaN(targetAmountFloat) || targetAmountFloat < 0)) {
        toast.error('Target jumlah harus berupa angka positif.');
        return;
    }

    setSaving(true);
    const success = await addGoal({
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      // Kirim sebagai number ke hook
      target_amount: targetAmountFloat, 
    });
    setSaving(false);
    if (success) {
      setShowAddDialog(false);
      setFormData({ title: '', description: '', icon: '🎯', target_amount: '' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteGoal(deleteId);
    setDeleteId(null);
  };

  const formatCurrency = (value: number) => {
    // Memastikan nilai adalah angka sebelum diformat
    if (isNaN(value) || value === null) return 'Rp0';
    
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // ✅ PERBAIKAN: Gunakan useMemo untuk menghitung badge state
  const badges = useMemo(() => {
    const goalsCompleted = goals.filter(g => g.status === 'completed').length;
    const hasSavings = goals.some(g => Number(g.current_amount) > 0);

    return [
        { icon: Trophy, title: "Tujuan Pertama", earned: goals.length > 0 },
        { icon: Star, title: "Master Streak", earned: goalsCompleted > 0 },
        { icon: Target, title: "Penabung Hebat", earned: hasSavings },
        // Asumsi "Pahlawan Kebiasaan" merujuk pada badge lain yang belum terhubung ke data goals
        { icon: CheckCircle2, title: "Pahlawan Kebiasaan", earned: false }, 
    ];
  }, [goals]);


  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tujuan Couple</h1>
            <p className="text-sm text-muted-foreground">Tumbuh bersama, raih bersama</p>
          </div>
          <CoupleAvatars
            partner1={{ name: userName, avatarUrl: profile?.avatar_url }}
            partner2={{ name: partnerName, avatarUrl: partnerProfile?.avatar_url }}
            size="md"
          />
        </div>

        {/* Milestone Timeline */}
        <AppCard variant="gradient" className="mb-4" delay={100}>
          <h3 className="text-base font-semibold text-foreground mb-4">Perjalanan Kita 💕</h3>
          <MilestoneTimeline milestones={defaultMilestones} />
        </AppCard>

        {/* Goals */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">Tujuan Aktif</h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-turquoise" />
            </div>
          ) : goals.length === 0 ? (
            <AppCard className="text-center py-8">
              <p className="text-muted-foreground">Belum ada tujuan. Tambahkan tujuan pertamamu!</p>
            </AppCard>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => {
                const progress = goal.target_amount 
                  ? Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100))
                  : 0;
                return (
                  <AppCard key={goal.id} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-turquoise/10 flex items-center justify-center text-2xl">
                      {goal.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground mb-2">{goal.description}</p>
                      )}
                      {goal.target_amount && (
                        <>
                          <ProgressBar progress={progress} size="sm" color="turquoise" />
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(Number(goal.current_amount))}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(Number(goal.target_amount))}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(goal.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AppCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Achievement Badges */}
        <AppCard delay={400}>
          <h3 className="text-base font-semibold text-foreground mb-4">Lencana Penghargaan</h3>
          
          <div className="grid grid-cols-4 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.title}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    badge.earned
                      ? "bg-happiness/10"
                      : "bg-muted"
                  }`}
                >
                  <badge.icon
                    className={`h-6 w-6 ${
                      badge.earned ? "text-happiness" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <span className="text-[10px] font-medium text-center text-muted-foreground">
                  {badge.title}
                </span>
              </div>
            ))}
          </div>
        </AppCard>

        {/* Add Goal FAB */}
        <Button 
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-elevated z-40"
          size="icon-lg"
          onClick={() => setShowAddDialog(true)}
          type="button"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tujuan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Judul Tujuan</Label>
              <Input
                placeholder="Contoh: Liburan Bali"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                placeholder="Deskripsi tujuan..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Icon</Label>
              <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target (Rp) - Opsional</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.target_amount}
                // Pastikan input hanya menerima angka
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={saving || !formData.title} type="button">
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
            <AlertDialogTitle>Hapus Tujuan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Tujuan akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" type="button">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Goals;