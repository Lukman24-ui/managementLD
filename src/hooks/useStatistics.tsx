import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DailyStats {
  date: string;
  moodScore: number;
  habitsCompleted: number;
  goalsProgress: number;
  transactions: number;
}

interface OverallStats {
  totalJournalEntries: number;
  avgMoodScore: number;
  totalHabitsCompleted: number;
  totalGoalsCompleted: number;
  totalTransactions: number;
  daysTogether: number;
}

export const useStatistics = (days: number = 7) => {
  const { couple } = useAuth();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!couple?.id) {
      setLoading(false);
      return;
    }

    fetchStatistics();
  }, [couple?.id, days]);

  const fetchStatistics = async () => {
    if (!couple?.id) return;

    try {
      setLoading(true);
      const startDate = subDays(new Date(), days - 1);
      const endDate = new Date();

      // Fetch journal entries for mood data
      const { data: journalData } = await supabase
        .from('journal_entries')
        .select('entry_date, mood_score')
        .eq('couple_id', couple.id)
        .gte('entry_date', format(startDate, 'yyyy-MM-dd'))
        .lte('entry_date', format(endDate, 'yyyy-MM-dd'));

      // Fetch habit completions
      const { data: habitCompletions } = await supabase
        .from('habit_completions')
        .select('completed_at, habit_id')
        .gte('completed_at', format(startDate, 'yyyy-MM-dd'))
        .lte('completed_at', format(endDate, 'yyyy-MM-dd'));

      // Filter habit completions by couple's habits
      const { data: coupleHabits } = await supabase
        .from('habits')
        .select('id')
        .eq('couple_id', couple.id);

      const coupleHabitIds = new Set(coupleHabits?.map(h => h.id) || []);
      const filteredCompletions = habitCompletions?.filter(c => coupleHabitIds.has(c.habit_id)) || [];

      // Fetch goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('couple_id', couple.id);

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('transaction_date, amount, type')
        .eq('couple_id', couple.id)
        .gte('transaction_date', format(startDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(endDate, 'yyyy-MM-dd'));

      // Build daily stats
      const dailyData: DailyStats[] = [];
      for (let i = 0; i < days; i++) {
        const date = subDays(endDate, days - 1 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const displayDate = format(date, 'dd MMM');

        // Mood for this day (convert 1-5 scale to 0-100%)
        const dayJournals = journalData?.filter(j => j.entry_date === dateStr) || [];
        const avgMood = dayJournals.length > 0
          ? Math.round((dayJournals.reduce((sum, j) => sum + (j.mood_score || 0), 0) / dayJournals.length) * 20)
          : 0;

        // Habits completed this day
        const dayHabits = filteredCompletions.filter(c => c.completed_at === dateStr).length;

        // Calculate goals progress (percentage of goals with progress)
        const goalsWithProgress = goalsData?.filter(g => 
          g.current_amount && g.target_amount && g.current_amount > 0
        ) || [];
        const goalsProgress = goalsData?.length 
          ? Math.round((goalsWithProgress.length / goalsData.length) * 100) 
          : 0;

        // Transactions count this day
        const dayTransactions = transactionsData?.filter(t => t.transaction_date === dateStr).length || 0;

        dailyData.push({
          date: displayDate,
          moodScore: avgMood,
          habitsCompleted: dayHabits,
          goalsProgress,
          transactions: dayTransactions
        });
      }

      setDailyStats(dailyData);

      // Calculate overall stats
      const allJournals = journalData || [];
      const totalMood = allJournals.reduce((sum, j) => sum + (j.mood_score || 0), 0);
      const completedGoals = goalsData?.filter(g => g.status === 'completed').length || 0;
      
      // Days together calculation
      const coupleCreatedAt = new Date(couple.created_at);
      const daysTogether = Math.floor((new Date().getTime() - coupleCreatedAt.getTime()) / (1000 * 60 * 60 * 24));

      setOverallStats({
        totalJournalEntries: allJournals.length,
        avgMoodScore: allJournals.length ? Math.round((totalMood / allJournals.length) * 20) : 0, // Convert 1-5 scale to 0-100%
        totalHabitsCompleted: filteredCompletions.length,
        totalGoalsCompleted: completedGoals,
        totalTransactions: transactionsData?.length || 0,
        daysTogether: Math.max(1, daysTogether)
      });

    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { dailyStats, overallStats, loading, refetch: fetchStatistics };
};
