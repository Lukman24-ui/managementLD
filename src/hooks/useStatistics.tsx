import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
// Import startOfDay dan endOfDay untuk akurasi query database
import { format, subDays, startOfDay, endOfDay, differenceInDays } from 'date-fns';

interface DailyStats {
    date: string;
    moodScore: number;
    habitsCompleted: number;
    // GoalsProgress dihapus dari daily karena biasanya bersifat kumulatif/harian tidak relevan
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

    const fetchStatistics = useCallback(async () => {
        if (!couple?.id) return;

        try {
            setLoading(true);
            const today = new Date();
            const startDate = subDays(today, days - 1); // Titik awal range
            
            // Format tanggal untuk query Supabase (ISO 8601: YYYY-MM-DDTHH:MM:SSZ)
            const queryStartDate = format(startOfDay(startDate), 'yyyy-MM-dd');
            const queryEndDate = format(endOfDay(today), 'yyyy-MM-dd');

            // --- 1. Optimalisasi Database dengan Promise.all ---
            const [
                journalResult,
                habitCompletionsResult,
                coupleHabitsResult,
                goalsResult,
                transactionsResult,
            ] = await Promise.all([
                // A. Journal Entries (Mood)
                supabase.from('journal_entries')
                    .select('entry_date, mood_score')
                    .eq('couple_id', couple.id)
                    .gte('entry_date', queryStartDate)
                    .lte('entry_date', queryEndDate),

                // B. Habit Completions
                supabase.from('habit_completions')
                    .select('completed_at, habit_id')
                    .gte('completed_at', queryStartDate)
                    .lte('completed_at', queryEndDate),
                
                // C. Couple Habits (untuk filtering completions)
                supabase.from('habits')
                    .select('id')
                    .eq('couple_id', couple.id),

                // D. Goals (diperlukan untuk overall stats)
                supabase.from('goals')
                    .select('status, current_amount, target_amount'),

                // E. Transactions
                supabase.from('transactions')
                    .select('transaction_date, amount, type')
                    .eq('couple_id', couple.id)
                    .gte('transaction_date', queryStartDate)
                    .lte('transaction_date', queryEndDate),
            ]);
            
            // --- Cek Error Database ---
            if (journalResult.error || habitCompletionsResult.error || goalsResult.error || transactionsResult.error) {
                 throw new Error("Gagal mengambil data dari Supabase.");
            }

            const journalData = journalResult.data || [];
            const habitCompletions = habitCompletionsResult.data || [];
            const goalsData = goalsResult.data || [];
            const transactionsData = transactionsResult.data || [];

            // Filter habit completions berdasarkan ID kebiasaan pasangan
            const coupleHabitIds = new Set(coupleHabitsResult.data?.map(h => h.id) || []);
            const filteredCompletions = habitCompletions.filter(c => coupleHabitIds.has(c.habit_id));


            // --- 2. Build Daily Stats ---
            const dailyData: DailyStats[] = [];
            for (let i = 0; i < days; i++) {
                const date = subDays(today, days - 1 - i);
                const dateStr = format(date, 'yyyy-MM-dd');
                const displayDate = format(date, 'dd MMM');

                // Mood for this day (Filter berdasarkan dateStr)
                const dayJournals = journalData.filter(j => format(new Date(j.entry_date), 'yyyy-MM-dd') === dateStr);
                const avgMood = dayJournals.length > 0
                    ? Math.round((dayJournals.reduce((sum, j) => sum + (j.mood_score || 0), 0) / dayJournals.length) * 20)
                    : 0;

                // Habits completed this day (Filter berdasarkan dateStr)
                // Menggunakan Set untuk menghitung completion unik per hari (opsional, tergantung kebutuhan)
                const uniqueDayHabits = new Set(filteredCompletions.filter(c => format(new Date(c.completed_at), 'yyyy-MM-dd') === dateStr).map(c => c.habit_id));
                const dayHabitsCount = uniqueDayHabits.size; // Jumlah kebiasaan unik yang diselesaikan

                // Transactions count this day
                const dayTransactions = transactionsData.filter(t => format(new Date(t.transaction_date), 'yyyy-MM-dd') === dateStr).length;

                dailyData.push({
                    date: displayDate,
                    moodScore: avgMood,
                    habitsCompleted: dayHabitsCount,
                    transactions: dayTransactions
                    // goalsProgress (dihapus/perlu logika terpisah jika ingin dimasukkan)
                });
            }

            setDailyStats(dailyData);

            // --- 3. Calculate Overall Stats ---
            const allJournals = journalData;
            const totalMood = allJournals.reduce((sum, j) => sum + (j.mood_score || 0), 0);
            const completedGoals = goalsData.filter(g => g.status === 'completed').length;
            
            // Days together calculation
            // Asumsi: couple.created_at selalu ada jika couple.id ada
            const coupleCreatedAt = new Date(couple.created_at); 
            const daysTogether = differenceInDays(new Date(), startOfDay(coupleCreatedAt));

            setOverallStats({
                totalJournalEntries: allJournals.length,
                avgMoodScore: allJournals.length ? Math.round((totalMood / allJournals.length) * 20) : 0, 
                totalHabitsCompleted: filteredCompletions.length,
                totalGoalsCompleted: completedGoals,
                totalTransactions: transactionsData.length,
                daysTogether: Math.max(1, daysTogether) // Minimal 1 hari
            });

        } catch (error) {
            console.error('Error fetching statistics:', error);
            setDailyStats([]);
            setOverallStats(null);
        } finally {
            setLoading(false);
        }
    }, [couple?.id, days]); // Fungsi dibuat ulang hanya jika couple.id atau days berubah

    // --- Initial Fetch Effect ---
    useEffect(() => {
        if (couple?.id) {
            fetchStatistics();
        } else {
            setLoading(false);
        }
    }, [fetchStatistics]);

    return { dailyStats, overallStats, loading, refetch: fetchStatistics };
};