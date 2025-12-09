import { useState, useEffect } from 'react';
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

  const fetchHabits = async () => {
    if (!couple?.id) return;

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('couple_id', couple.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching habits:', error);
      return;
    }

    setHabits(data as Habit[]);
    setLoading(false);
  };

  const fetchCompletions = async () => {
    if (!couple?.id) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .gte('completed_at', today);

    if (error) {
      console.error('Error fetching completions:', error);
      return;
    }

    setCompletions(data as HabitCompletion[]);
  };

  const addHabit = async (habit: {
    title: string;
    icon?: string;
    color?: string;
    target_per_day?: number;
  }) => {
    if (!couple?.id) return;

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
    fetchHabits();
    return true;
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus kebiasaan');
      console.error(error);
      return false;
    }

    toast.success('Kebiasaan berhasil dihapus');
    fetchHabits();
    return true;
  };

  const toggleCompletion = async (habitId: string) => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    const existing = completions.find(
      c => c.habit_id === habitId && c.user_id === user.id && c.completed_at === today
    );

    if (existing) {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existing.id);

      if (error) {
        toast.error('Gagal membatalkan kebiasaan');
        return false;
      }
    } else {
      const { error } = await supabase.from('habit_completions').insert({
        habit_id: habitId,
        user_id: user.id,
      });

      if (error) {
        toast.error('Gagal menandai kebiasaan');
        console.error(error);
        return false;
      }
    }

    fetchCompletions();
    return true;
  };

  const isCompletedToday = (habitId: string, userId?: string) => {
    const today = new Date().toISOString().split('T')[0];
    return completions.some(
      c => c.habit_id === habitId && 
           (userId ? c.user_id === userId : c.user_id === user?.id) && 
           c.completed_at === today
    );
  };

  useEffect(() => {
    fetchHabits();
    fetchCompletions();
  }, [couple?.id]);

  useEffect(() => {
    if (!couple?.id) return;

    const channel = supabase
      .channel('habits-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habits' },
        () => fetchHabits()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_completions' },
        () => fetchCompletions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id]);

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
