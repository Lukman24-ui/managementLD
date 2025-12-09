import { AppCard } from "@/components/couple/AppCard";
import { CoupleAvatars } from "@/components/couple/Avatar";
import { ActivityRing } from "@/components/couple/ActivityRing";
import { ProgressBar } from "@/components/couple/ProgressBar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Dumbbell, Timer, Flame, Footprints, Play, Calendar, Users, Loader2 } from "lucide-react";
import { useState, useEffect } from 'react';

// NOTE: Karena data fitness tidak disediakan hook, kita hanya menggunakan state loading dummy
const Fitness = () => {
  const { profile, partnerProfile, loading: authLoading } = useAuth();
  
  // State loading dummy untuk simulasi fetching data fitness
  const [dataLoading, setDataLoading] = useState(true);

  const userName = profile?.full_name?.split(' ')[0] || 'Kamu';
  const partnerName = partnerProfile?.full_name?.split(' ')[0] || 'Pasangan';
  // Cek apakah pasangan terhubung (misalnya, jika partnerProfile ada)
  const isPartnerConnected = !!partnerProfile;

  const workouts = [
    { icon: "🧘", title: "Yoga Pagi", duration: "30 menit", calories: 150, time: "07:00" },
    { icon: "🏃", title: "Lari Sore", duration: "45 menit", calories: 350, time: "18:00" },
    { icon: "💪", title: "Latihan Kekuatan", duration: "40 menit", calories: 280, time: "17:00" },
  ];

  // Simulasi data yang mungkin diambil dari hook fitness (jika ada)
  const mockActivity = {
    user: { steps: 9200, calories: 480, activeMinutes: 35 },
    partner: { steps: 7700, calories: 360, activeMinutes: 25 },
    goals: { steps: 10000, calories: 500, minutes: 45 }
  };

  // ✅ PERBAIKAN: Gunakan useEffect untuk simulasi loading/data fetching
  useEffect(() => {
      if (!authLoading) {
          // Ganti dengan fetch actual data dari useFitness hook jika sudah ada
          const timer = setTimeout(() => setDataLoading(false), 800);
          return () => clearTimeout(timer);
      }
  }, [authLoading]);

  // Tampilkan loading utama jika authLoading atau dataLoading
  if (authLoading || dataLoading) {
      return (
          <div className="min-h-screen bg-background flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-turquoise" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kebugaran Bersama</h1>
            <p className="text-sm text-muted-foreground">Tetap aktif sebagai pasangan</p>
          </div>
          <CoupleAvatars
            // Menggunakan data nyata jika tersedia
            partner1={{ name: userName, avatarUrl: profile?.avatar_url }} 
            partner2={{ name: partnerName, avatarUrl: partnerProfile?.avatar_url }}
            size="md"
          />
        </div>

        {/* Activity Rings */}
        <AppCard variant="gradient" className="mb-4" delay={100}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground mb-4">Aktivitas Hari Ini</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-turquoise" />
                  <span className="text-sm text-muted-foreground flex-1">Langkah</span>
                  <span className="text-sm font-semibold">{mockActivity.user.steps.toLocaleString()} / {mockActivity.goals.steps.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-happiness" />
                  <span className="text-sm text-muted-foreground flex-1">Kalori</span>
                  <span className="text-sm font-semibold">{mockActivity.user.calories} / {mockActivity.goals.calories}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-mint-dark" />
                  <span className="text-sm text-muted-foreground flex-1">Menit Aktif</span>
                  <span className="text-sm font-semibold">{mockActivity.user.activeMinutes} / {mockActivity.goals.minutes}</span>
                </div>
              </div>
            </div>
            
            <ActivityRing
              steps={{ current: mockActivity.user.steps, goal: mockActivity.goals.steps }}
              calories={{ current: mockActivity.user.calories, goal: mockActivity.goals.calories }}
              minutes={{ current: mockActivity.user.activeMinutes, goal: mockActivity.goals.minutes }}
              size={140}
            />
          </div>
        </AppCard>

        {/* Partner Comparison */}
        <AppCard className="mb-4" delay={200}>
          <h3 className="text-base font-semibold text-foreground mb-4">Perbandingan Pasangan</h3>
          
          {isPartnerConnected ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-turquoise/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-turquoise">{userName.charAt(0)}</span>
                  </div>
                  <p className="font-semibold text-sm">{userName}</p>
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <Footprints className="h-3 w-3 text-muted-foreground" />
                        <span>{mockActivity.user.steps.toLocaleString()}</span>
                      </div>
                      <ProgressBar progress={Math.min(100, (mockActivity.user.steps / mockActivity.goals.steps) * 100)} color="turquoise" size="sm" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <Flame className="h-3 w-3 text-muted-foreground" />
                        <span>{mockActivity.user.calories}</span>
                      </div>
                      <ProgressBar progress={Math.min(100, (mockActivity.user.calories / mockActivity.goals.calories) * 100)} color="happiness" size="sm" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-mint/50 flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-turquoise-dark">{partnerName.charAt(0)}</span>
                  </div>
                  <p className="font-semibold text-sm">{partnerName}</p>
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <Footprints className="h-3 w-3 text-muted-foreground" />
                        <span>{mockActivity.partner.steps.toLocaleString()}</span>
                      </div>
                      <ProgressBar progress={Math.min(100, (mockActivity.partner.steps / mockActivity.goals.steps) * 100)} color="turquoise" size="sm" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <Flame className="h-3 w-3 text-muted-foreground" />
                        <span>{mockActivity.partner.calories}</span>
                    </div>
                      <ProgressBar progress={Math.min(100, (mockActivity.partner.calories / mockActivity.goals.calories) * 100)} color="happiness" size="sm" />
                    </div>
                  </div>
                </div>
              </div>
          ) : (
              <div className="text-center py-4">
                  <Users className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Hubungkan akun untuk melihat perbandingan aktivitas pasangan.</p>
              </div>
          )}
        </AppCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6 opacity-0 animate-fade-in-up stagger-3">
          <Button variant="gradient" className="h-auto py-4 flex-col gap-2" disabled={!isPartnerConnected}>
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Play className="h-5 w-5" />
            </div>
            <span>Mulai Olahraga Bersama</span>
          </Button>
          <Button variant="secondary" className="h-auto py-4 flex-col gap-2" disabled={!isPartnerConnected}>
            <div className="w-10 h-10 rounded-xl bg-turquoise/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-turquoise" />
            </div>
            <span className="text-foreground">Jadwal Olahraga</span>
          </Button>
        </div>

        {/* Workout Plans */}
        <AppCard delay={400}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Olahraga Hari Ini</h3>
            <Button variant="ghost" size="sm" className="text-turquoise" disabled={!isPartnerConnected}>Lihat semua</Button>
          </div>
          
          <div className="space-y-3">
            {workouts.map((workout, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-card shadow-soft flex items-center justify-center text-2xl">
                  {workout.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground">{workout.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {workout.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {workout.calories} kal
                    </span>
                </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">{workout.time}</span>
                  <Button variant="ghost" size="icon-sm" className="ml-2" type="button" disabled={!isPartnerConnected}>
                    <Play className="h-4 w-4 text-turquoise" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      </div>
    </div>
  );
};

export default Fitness;