import { useState } from "react";
import { AppCard } from "@/components/couple/AppCard";
import { useStatistics } from "@/hooks/useStatistics";
import { useAuth } from "@/hooks/useAuth";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { 
  Heart, 
  Calendar, 
  Target, 
  BookHeart, 
  TrendingUp,
  Sparkles,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Statistics = () => {
  const { couple, profile, partnerProfile } = useAuth();
  const [period, setPeriod] = useState<7 | 14 | 30>(7);
  const { dailyStats, overallStats, loading } = useStatistics(period);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <Loader2 className="h-8 w-8 animate-spin text-turquoise" />
      </div>
    );
  }

  if (!couple) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-lg mx-auto px-4 pt-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Statistik</h1>
          <AppCard className="text-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Hubungkan dengan Pasangan
            </h3>
            <p className="text-sm text-muted-foreground">
              Statistik hubungan akan tersedia setelah Anda terhubung dengan pasangan.
            </p>
          </AppCard>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      icon: Calendar, 
      label: "Hari Bersama", 
      value: overallStats?.daysTogether || 0,
      suffix: "hari",
      color: "turquoise" 
    },
    { 
      icon: BookHeart, 
      label: "Rata-rata Mood", 
      value: overallStats?.avgMoodScore || 0,
      suffix: "%",
      color: "mint" 
    },
    { 
      icon: Target, 
      label: "Kebiasaan Selesai", 
      value: overallStats?.totalHabitsCompleted || 0,
      suffix: "",
      color: "happiness" 
    },
    { 
      icon: Sparkles, 
      label: "Goals Tercapai", 
      value: overallStats?.totalGoalsCompleted || 0,
      suffix: "",
      color: "turquoise" 
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Statistik</h1>
            <p className="text-sm text-muted-foreground">
              Perkembangan hubungan {profile?.full_name?.split(' ')[0]} & {partnerProfile?.full_name?.split(' ')[0]}
            </p>
          </div>
          <TrendingUp className="h-6 w-6 text-turquoise" />
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {[7, 14, 30].map((days) => (
            <Button
              key={days}
              variant={period === days ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(days as 7 | 14 | 30)}
              className={cn(
                "flex-1",
                period === days && "bg-turquoise hover:bg-turquoise-dark"
              )}
            >
              {days} Hari
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {statCards.map((stat, index) => (
            <AppCard 
              key={stat.label} 
              className="text-center" 
              delay={150 + index * 50}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center",
                stat.color === "turquoise" && "bg-turquoise/10",
                stat.color === "mint" && "bg-mint/10",
                stat.color === "happiness" && "bg-happiness/10"
              )}>
                <stat.icon className={cn(
                  "h-5 w-5",
                  stat.color === "turquoise" && "text-turquoise",
                  stat.color === "mint" && "text-mint",
                  stat.color === "happiness" && "text-happiness"
                )} />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stat.value}{stat.suffix}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </AppCard>
          ))}
        </div>

        {/* Mood Chart */}
        <AppCard className="mb-4" delay={350}>
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookHeart className="h-4 w-4 text-turquoise" />
            Perkembangan Mood
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--turquoise))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--turquoise))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="moodScore" 
                  stroke="hsl(var(--turquoise))" 
                  strokeWidth={2}
                  fill="url(#moodGradient)"
                  name="Mood Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AppCard>

        {/* Habits Chart */}
        <AppCard className="mb-4" delay={400}>
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-mint" />
            Kebiasaan Harian
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="habitsCompleted" 
                  fill="hsl(var(--mint))" 
                  radius={[4, 4, 0, 0]}
                  name="Kebiasaan Selesai"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AppCard>

        {/* Goals Progress Chart */}
        <AppCard className="mb-4" delay={450}>
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-happiness" />
            Progress Goals
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="goalsProgress" 
                  stroke="hsl(var(--happiness))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--happiness))', strokeWidth: 2 }}
                  name="Progress (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AppCard>
      </div>
    </div>
  );
};

export default Statistics;
