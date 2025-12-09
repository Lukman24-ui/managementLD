import { AppCard } from "@/components/couple/AppCard";
import { CoupleAvatars } from "@/components/couple/Avatar";
import { WeekCalendar } from "@/components/couple/WeekCalendar";
import { QuickAction } from "@/components/couple/QuickAction";
import { ProgressBar } from "@/components/couple/ProgressBar";
import { SunIllustration, LandscapeIllustration } from "@/components/couple/SunIllustration";
import { Wallet, Target, Dumbbell, BookHeart, PiggyBank, CheckCircle2, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useHabits } from "@/hooks/useHabits";
import { useGoals } from "@/hooks/useGoals";
import { useTransactions } from "@/hooks/useTransactions";

const Home = () => {
  const { profile, partnerProfile, couple } = useAuth();
  const navigate = useNavigate();
  const { habits, isCompletedToday } = useHabits();
  const { goals } = useGoals();
  const { balance } = useTransactions();
  
  const userName = profile?.full_name?.split(' ')[0] || 'Kamu';
  const partnerName = partnerProfile?.full_name?.split(' ')[0] || 'Pasangan';
  const isConnected = couple?.status === 'active' && partnerProfile;
  
  const completedHabits = habits.filter(h => isCompletedToday(h.id)).length;
  const totalHabits = habits.length;
  const habitProgress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  
  const activeGoals = goals.filter(g => g.status === 'active');
  const totalGoalProgress = activeGoals.length > 0 
    ? Math.round(activeGoals.reduce((acc, g) => {
        if (g.target_amount && Number(g.target_amount) > 0) {
          return acc + (Number(g.current_amount) / Number(g.target_amount)) * 100;
        }
        return acc;
      }, 0) / activeGoals.length)
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Hai, {userName} {isConnected ? `& ${partnerName}` : ''} 💙
            </h1>
            <p className="text-sm text-muted-foreground">
              {isConnected ? 'Mari buat hari ini luar biasa bersama' : 'Selamat datang kembali'}
            </p>
          </div>
          <CoupleAvatars
            partner1={{ name: userName }}
            partner2={{ name: partnerName }}
            size="md"
          />
        </div>

        {/* Couple Setup Banner */}
        {!isConnected && (
          <AppCard 
            variant="gradient" 
            className="mb-4 cursor-pointer" 
            delay={50}
            onClick={() => navigate('/couple-setup')}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">💕</div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Hubungkan dengan Pasangan</h3>
                <p className="text-sm text-muted-foreground">
                  Buat atau masukkan kode undangan untuk mulai
                </p>
              </div>
            </div>
          </AppCard>
        )}

        {/* Week Calendar */}
        <AppCard className="mb-4" delay={100}>
          <WeekCalendar />
        </AppCard>

        {/* Daily Overview Card */}
        <AppCard variant="sunset" className="mb-4 overflow-hidden relative cursor-pointer" delay={200} onClick={() => navigate('/journal')}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-charcoal/70 mb-1">Jurnal Ku</h3>
              <h2 className="text-xl font-bold text-charcoal mb-2">Mulai harimu</h2>
              <p className="text-sm text-charcoal/70">Awali dengan refleksi pagi yang mindful bersama.</p>
            </div>
            <div className="relative -mr-2 -mt-2">
              <SunIllustration />
            </div>
          </div>
          <div className="mt-4 h-20 -mx-5 -mb-5">
            <LandscapeIllustration />
          </div>
        </AppCard>

        {/* Quick Actions */}
        <div className="mb-6 opacity-0 animate-fade-in-up stagger-3">
          <h3 className="text-lg font-semibold text-foreground mb-3">Aksi Cepat Bersama</h3>
          <div className="grid grid-cols-5 gap-2">
            <QuickAction icon={Wallet} label="Keuangan" color="turquoise" onClick={() => navigate('/money')} />
            <QuickAction icon={Target} label="Kebiasaan" color="mint" onClick={() => navigate('/habits')} />
            <QuickAction icon={Dumbbell} label="Tujuan" color="happiness" onClick={() => navigate('/goals')} />
            <QuickAction icon={BookHeart} label="Jurnal" color="accent" onClick={() => navigate('/journal')} />
            <QuickAction icon={Plane} label="Travel" color="turquoise" onClick={() => navigate('/travel')} />
          </div>
        </div>

        {/* Stats Preview */}
        <AppCard delay={400}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Ringkasan Hari Ini</h3>
          
          <div className="space-y-4">
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-mint-dark" />
                  <span className="text-sm font-medium">Saldo Bersama</span>
                </div>
                <span className="text-sm font-bold text-turquoise">{formatCurrency(balance)}</span>
              </div>
              <ProgressBar progress={Math.min(100, Math.max(0, balance > 0 ? 100 : 50))} color="mint" size="md" />
              <p className="text-xs text-muted-foreground mt-1">
                {balance >= 0 ? 'Keuangan sehat!' : 'Perlu ditingkatkan'}
              </p>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-happiness" />
                  <span className="text-sm font-medium">Kebiasaan Selesai</span>
                </div>
                <span className="text-sm font-bold text-happiness">{completedHabits}/{totalHabits}</span>
              </div>
              <ProgressBar progress={habitProgress} color="happiness" size="md" />
              <p className="text-xs text-muted-foreground mt-1">
                {habitProgress === 100 ? 'Luar biasa! Semua selesai!' : `${totalHabits - completedHabits} kebiasaan lagi`}
              </p>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-turquoise" />
                  <span className="text-sm font-medium">Progress Tujuan</span>
                </div>
                <span className="text-sm font-bold text-turquoise">{totalGoalProgress}%</span>
              </div>
              <ProgressBar progress={totalGoalProgress} color="turquoise" size="md" />
              <p className="text-xs text-muted-foreground mt-1">
                {activeGoals.length > 0 ? `${activeGoals.length} tujuan aktif` : 'Belum ada tujuan'}
              </p>
            </div>
          </div>
        </AppCard>

        {/* Quick Journal Cards */}
        <div className="mt-6 opacity-0 animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">Jurnal Cepat</h3>
            <Button variant="ghost" size="sm" className="text-turquoise" onClick={() => navigate('/journal')}>Lihat semua</Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            <button onClick={() => navigate('/journal')} className="min-w-[160px] p-4 rounded-3xl bg-mint/30 shadow-soft text-left hover:bg-mint/50 transition-colors">
              <span className="text-xl mb-2 block">🌱</span>
              <h4 className="font-semibold text-sm text-foreground mb-1">Jeda & refleksi</h4>
              <p className="text-xs text-muted-foreground mb-3">Apa yang kamu syukuri hari ini?</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Hari ini</span>
                <span className="px-2 py-0.5 rounded-full bg-mint text-xs font-medium text-turquoise-dark">Personal</span>
              </div>
            </button>
            <button onClick={() => navigate('/journal')} className="min-w-[160px] p-4 rounded-3xl bg-happiness/10 shadow-soft text-left hover:bg-happiness/20 transition-colors">
              <span className="text-xl mb-2 block">😊</span>
              <h4 className="font-semibold text-sm text-foreground mb-1">Tetapkan Niat</h4>
              <p className="text-xs text-muted-foreground mb-3">Bagaimana perasaan yang kamu inginkan?</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Hari ini</span>
                <span className="px-2 py-0.5 rounded-full bg-happiness/20 text-xs font-medium text-happiness">Keluarga</span>
              </div>
            </button>
            <button onClick={() => navigate('/chat')} className="min-w-[160px] p-4 rounded-3xl bg-turquoise/10 shadow-soft text-left hover:bg-turquoise/20 transition-colors">
              <span className="text-xl mb-2 block">💑</span>
              <h4 className="font-semibold text-sm text-foreground mb-1">Chat Pasangan</h4>
              <p className="text-xs text-muted-foreground mb-3">Kirim pesan ke pasangan</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Hari ini</span>
                <span className="px-2 py-0.5 rounded-full bg-turquoise/20 text-xs font-medium text-turquoise">Bersama</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
