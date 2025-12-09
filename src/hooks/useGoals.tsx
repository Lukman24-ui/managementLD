import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  icon: string;
  target_amount: number | null;
  current_amount: number;
  target_date: string | null;
  status: string;
  created_at: string;
}

export const useGoals = () => {
  const { couple } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!couple?.id) return;

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('couple_id', couple.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return;
    }

    setGoals(data as Goal[]);
    setLoading(false);
  };

  const addGoal = async (goal: {
    title: string;
    description?: string;
    icon?: string;
    target_amount?: number;
    target_date?: string;
  }) => {
    if (!couple?.id) return;

    const { error } = await supabase.from('goals').insert({
      couple_id: couple.id,
      title: goal.title,
      description: goal.description || null,
      icon: goal.icon || '🎯',
      target_amount: goal.target_amount || null,
      target_date: goal.target_date || null,
    });

    if (error) {
      toast.error('Gagal menambah tujuan');
      console.error(error);
      return false;
    }

    toast.success('Tujuan berhasil ditambahkan');
    fetchGoals();
    return true;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Gagal memperbarui tujuan');
      console.error(error);
      return false;
    }

    toast.success('Tujuan berhasil diperbarui');
    fetchGoals();
    return true;
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus tujuan');
      console.error(error);
      return false;
    }

    toast.success('Tujuan berhasil dihapus');
    fetchGoals();
    return true;
  };

  useEffect(() => {
    fetchGoals();
  }, [couple?.id]);

  useEffect(() => {
    if (!couple?.id) return;

    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals' },
        () => fetchGoals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id]);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals,
  };
};
