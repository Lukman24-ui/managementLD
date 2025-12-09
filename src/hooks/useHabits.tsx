import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Habit {
  id: string;
  couple_id: string;
  title: string;
  icon: string;
  color: string;
  target_per_day: number;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
}

// Helper untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getToday = () => new Date().toISOString().split('T')[0];

export const useHabits = () => {
  const { user, couple } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Optimasi Fetching dengan useCallback ---

  const fetchHabits = useCallback(async () => {
    if (!couple?.id) {
        setLoading(false);
        return;
    }
    
    // ✅ PERBAIKAN: Selalu set loading true saat fetching dimulai
    setLoading(true);

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('couple_id', couple.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching habits:', error);
      toast.error('Gagal memuat kebiasaan.');
    } else {
        setHabits(data as Habit[]);
    }
    
    // Catatan: setLoading(false) dipindahkan ke useEffect di bawah
  }, [couple?.id]);

  const fetchCompletions = useCallback(async () => {
    if (!couple?.id) return;

    const today = getToday();
    
    // Menggunakan JOIN yang lebih eksplisit untuk filter couple_id
    const { data, error } = await supabase
      .from('habit_completions')
      .select(`*, habits!inner(couple_id)`) 
      .eq('habits.couple_id', couple.id)
      .gte('completed_at', today);

    if (error) {
      console.error('Error fetching completions:', error);
      toast.error('Gagal memuat penyelesaian.');
      return;
    }

    setCompletions(data as HabitCompletion[]);
  }, [couple?.id]);

  // --- 2. Mutasi CRUD Kebiasaan: Mengandalkan Realtime ---

  const addHabit = async (habit: {
    title: string;
    icon?: string;
    color?: string;
    target_per_day?: number;
  }) => {
    if (!couple?.id) return false;

    // ✅ PERBAIKAN: Hapus .select('*').single() untuk menghindari duplikasi
    const { error } = await supabase.from('habits').insert({
      couple_id: couple.id,
      title: habit.title,
      icon: habit.icon || '📌',
      color: habit.color || 'turquoise',
      target_per_day: habit.target_per_day || 1,
    });

    if (error) {
      toast.error('Gagal menambah kebiasaan');
      console.error(error);
      return false;
    }

    toast.success('Kebiasaan berhasil ditambahkan');
    // Biarkan Realtime Subscription yang menangani update state 'habits'
    return true;
  };

  const deleteHabit = async (id: string) => {
    // Optimistic update
    const originalHabits = habits;
    setHabits(prev => prev.filter(h => h.id !== id));
    
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus kebiasaan');
      console.error(error);
      setHabits(originalHabits); // Rollback
      return false;
    }

    toast.success('Kebiasaan berhasil dihapus');
    // Biarkan Realtime Subscription yang menangani pembersihan 'completions' terkait
    return true;
  };

  // --- 3. Mutasi Penyelesaian: Mengandalkan Realtime ---

  const toggleCompletion = async (habitId: string) => {
    if (!user?.id) return false;

    const existing = completions.find(
      c => c.habit_id === habitId && c.user_id === user.id
    );
    
    let success = false;
    // Simpan ID untuk optimistic update
    let completionIdToRemove: string | null = null;
    let newCompletionData: HabitCompletion | null = null;

    if (existing) {
        // Optimistic Delete
        completionIdToRemove = existing.id;
        setCompletions(prev => prev.filter(c => c.id !== existing.id));

      // 3a. DELETE (Batalkan)
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existing.id);

      if (error) {
        toast.error('Gagal membatalkan kebiasaan');
        // Rollback
        setCompletions(prev => [...prev, existing]); 
      } else {
        success = true;
      }

    } else {
        // Optimistic Insert (buat data sementara untuk update state)
        // Kita tidak bisa membuat ID di frontend, jadi kita biarkan Realtime update
        // ATAU menggunakan Realtime update sebagai konfirmasi.

      // 3b. INSERT (Selesaikan)
      const { data: result, error } = await supabase.from('habit_completions').insert({
        habit_id: habitId,
        user_id: user.id,
      })
        .select('*') // Minta data baru dari server untuk konfirmasi/update UI
        .single();

      if (error) {
        toast.error('Gagal menandai kebiasaan');
        console.error(error);
      } else {
        success = true;
        // ✅ PERBAIKAN: Update state langsung dari data server (Pessimistic Update)
        setCompletions(prev => [...prev, result as HabitCompletion]);
      }
    }

    // Hapus fetchCompletions()
    return success;
  };

  // --- 4. Fungsi Pelengkap ---

  const isCompletedToday = useCallback((habitId: string, userId?: string) => {
    return completions.some(
      c => c.habit_id === habitId && 
           (userId ? c.user_id === userId : c.user_id === user?.id)
    );
  }, [completions, user?.id]);

  // --- 5. Effect Awal (Initial Fetch) ---

  useEffect(() => {
    // Panggil keduanya
    Promise.all([fetchHabits(), fetchCompletions()])
        .finally(() => setLoading(false)); // ✅ PERBAIKAN: Panggil setLoading false setelah keduanya selesai
  }, [fetchHabits, fetchCompletions]); 


  // --- 6. Realtime Subscription (Optimasi dengan Payload) ---

  useEffect(() => {
    if (!couple?.id) return;

    const habitsChannel = supabase
      .channel('habits-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habits', filter: `couple_id=eq.${couple.id}` },
        (payload) => {
            const newHabit = payload.new as Habit;
            const oldHabit = payload.old as Habit;

            if (payload.eventType === 'INSERT') {
                // Mencegah duplikasi dari Realtime jika addHabit diubah ke Pessimistic update
                setHabits(prev => {
                    if (prev.some(h => h.id === newHabit.id)) return prev;
                    return [...prev, newHabit];
                });
            } else if (payload.eventType === 'DELETE') {
                setHabits(prev => prev.filter(h => h.id !== oldHabit.id));
            } else if (payload.eventType === 'UPDATE') {
                setHabits(prev => prev.map(h => h.id === newHabit.id ? newHabit : h));
            }
        }
      )
      .subscribe();

    const completionsChannel = supabase
      .channel('completions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_completions' },
        (payload) => {
            const newComp = payload.new as HabitCompletion;
            const oldComp = payload.old as HabitCompletion;
            const today = getToday();

            // ✅ PERBAIKAN UTAMA: Manipulasi state langsung, tapi cek tanggal hari ini
            if (payload.eventType === 'INSERT' && newComp.completed_at?.startsWith(today)) {
                setCompletions(prev => {
                    if (prev.some(c => c.id === newComp.id)) return prev;
                    return [...prev, newComp];
                });
            } else if (payload.eventType === 'DELETE') {
                setCompletions(prev => prev.filter(c => c.id !== oldComp.id));
            }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(habitsChannel);
      supabase.removeChannel(completionsChannel);
    };
  }, [couple?.id]); // Hapus fetchCompletions dari dependency array

  // --- Return Values ---
  return {
    habits,
    completions,
    loading,
    addHabit,
    deleteHabit,
    toggleCompletion,
    isCompletedToday,
    refetchHabits: fetchHabits,
    refetchCompletions: fetchCompletions,
  };
};