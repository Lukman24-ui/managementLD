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

    setLoading(false);
  }, [couple?.id]);

  const fetchCompletions = useCallback(async () => {
    if (!couple?.id) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('habit_completions')
      // Filter berdasarkan couple_id (penting untuk keamanan) dan tanggal
      .select(`*, habits!inner(couple_id)`) // Join untuk filter couple_id
      .eq('habits.couple_id', couple.id)
      .gte('completed_at', today);

    if (error) {
      console.error('Error fetching completions:', error);
      toast.error('Gagal memuat penyelesaian.');
      return;
    }

    setCompletions(data as HabitCompletion[]);
  }, [couple?.id]);

  // --- 2. Mutasi CRUD Kebiasaan: Gunakan State Lokal ---

  const addHabit = async (habit: {
    title: string;
    icon?: string;
    color?: string;
    target_per_day?: number;
  }) => {
    if (!couple?.id) return false;

    // Minta Supabase mengembalikan data yang baru di-insert
    const { data: newHabit, error } = await supabase.from('habits').insert({
      couple_id: couple.id,
      title: habit.title,
      icon: habit.icon || '📌',
      color: habit.color || 'turquoise',
      target_per_day: habit.target_per_day || 1,
    })
      .select('*')
      .single();

    if (error) {
      toast.error('Gagal menambah kebiasaan');
      console.error(error);
      return false;
    }

    toast.success('Kebiasaan berhasil ditambahkan');
    // FIX: Update state lokal secara langsung
    setHabits(prev => [...prev, newHabit as Habit]); 
    // fetchHabits(); // TIDAK PERLU: Sudah ditangani oleh realtime atau update state lokal
    return true;
  };

  const deleteHabit = async (id: string) => {
    // Optimistic update (opsional): Hapus dari UI sebelum konfirmasi DB
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
    // fetchHabits(); // TIDAK PERLU
    return true;
  };

  // --- 3. Mutasi Penyelesaian: Gunakan State Lokal ---

  const toggleCompletion = async (habitId: string) => {
    if (!user?.id) return false;

    const today = new Date().toISOString().split('T')[0];
    const existing = completions.find(
      c => c.habit_id === habitId && c.user_id === user.id // Tidak perlu filter tanggal, karena fetchCompletions sudah memfilter data hari ini
    );
    
    let success = false;

    if (existing) {
      // 3a. DELETE (Batalkan)
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existing.id);

      if (error) {
        toast.error('Gagal membatalkan kebiasaan');
      } else {
        // FIX: Update state lokal
        setCompletions(prev => prev.filter(c => c.id !== existing.id));
        success = true;
    }

    } else {
      // 3b. INSERT (Selesaikan)
      const { data: newCompletion, error } = await supabase.from('habit_completions').insert({
        habit_id: habitId,
        user_id: user.id,
      })
        .select('*')
        .single();

      if (error) {
        toast.error('Gagal menandai kebiasaan');
        console.error(error);
      } else {
        // FIX: Update state lokal
        setCompletions(prev => [...prev, newCompletion as HabitCompletion]);
        success = true;
    }
    }

    // fetchCompletions(); // TIDAK PERLU
    return success;
  };

  // --- 4. Fungsi Pelengkap ---

  const isCompletedToday = useCallback((habitId: string, userId?: string) => {
    return completions.some(
      c => c.habit_id === habitId && 
           (userId ? c.user_id === userId : c.user_id === user?.id)
      // Tidak perlu filter tanggal, karena completions hanya berisi data hari ini
    );
  }, [completions, user?.id]);

  // --- 5. Effect Awal (Initial Fetch) ---

  useEffect(() => {
    // Panggil versi useCallback
    fetchHabits(); 
    fetchCompletions();
  }, [fetchHabits, fetchCompletions]); // Dependency adalah fungsi itu sendiri


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
                setHabits(prev => [...prev, newHabit]);
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
        // Karena data completions real-time tidak difilter berdasarkan tanggal, 
       // lebih aman memanggil fetchCompletions() untuk memastikan kita hanya 
       // mendapatkan data hari ini, atau memanggil fetchCompletions()
       // jika payloadnya tidak memuat kolom completed_at (yang dibutuhkan).
       () => fetchCompletions() 
      )
      .subscribe();

    return () => {
      supabase.removeChannel(habitsChannel);
      supabase.removeChannel(completionsChannel);
    };
  }, [couple?.id, fetchCompletions]); // Tambahkan fetchCompletions ke dependency array

  // --- Return Values ---
  return {
    habits,
    completions,
    loading,
    addHabit,
    deleteHabit,
    toggleCompletion,
    isCompletedToday,
    refetch: fetchHabits,
  };
};