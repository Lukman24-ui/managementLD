import { useState, useEffect, useCallback } from 'react';
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

  // --- 1. Optimasi Fetching dengan useCallback ---

  const fetchGoals = useCallback(async () => {
    if (!couple?.id) {
        setLoading(false);
        return;
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('couple_id', couple.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      toast.error('Gagal memuat tujuan.');
    } else {
        setGoals(data as Goal[]);
    }

    setLoading(false);
  }, [couple?.id]); // Fungsi hanya dibuat ulang jika couple.id berubah

  // --- 2. Mutasi CRUD: Gunakan State Lokal ---

  const addGoal = async (goal: {
    title: string;
    description?: string;
    icon?: string;
    target_amount?: number;
    target_date?: string;
  }) => {
    if (!couple?.id) return false;

    // Minta Supabase mengembalikan data yang baru di-insert
    const { data: newGoal, error } = await supabase.from('goals').insert({
      couple_id: couple.id,
      title: goal.title,
      description: goal.description || null,
      icon: goal.icon || '🎯',
      target_amount: goal.target_amount || null,
      target_date: goal.target_date || null,
    })
        .select('*')
        .single(); // Penting: Mengembalikan data lengkap

    if (error) {
      toast.error('Gagal menambah tujuan');
      console.error(error);
      return false;
    }

    toast.success('Tujuan berhasil ditambahkan');
    
    // FIX: Update state lokal secara langsung (Optimistic/Pessimistic Update)
    // Menambahkan di awal karena order dibuat ascending: false
    setGoals(prev => [newGoal as Goal, ...prev]); 
    
    // fetchGoals(); // TIDAK PERLU
    return true;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    // Optimistic Update: Perbarui UI sebelum konfirmasi DB
    const originalGoals = goals;
    setGoals(prev => 
        prev.map(g => g.id === id ? { ...g, ...updates } : g)
    );
    
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Gagal memperbarui tujuan');
      console.error(error);
      setGoals(originalGoals); // Rollback jika gagal
      return false;
    }

    toast.success('Tujuan berhasil diperbarui');
    // fetchGoals(); // TIDAK PERLU
    return true;
  };

  const deleteGoal = async (id: string) => {
    // Optimistic Update: Hapus dari UI sebelum konfirmasi DB
    const originalGoals = goals;
    setGoals(prev => prev.filter(g => g.id !== id));
    
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus tujuan');
      console.error(error);
      setGoals(originalGoals); // Rollback jika gagal
      return false;
    }

    toast.success('Tujuan berhasil dihapus');
    // fetchGoals(); // TIDAK PERLU
    return true;
  };

  // --- 3. Initial Fetch ---

  useEffect(() => {
    // Panggil versi useCallback
    fetchGoals();
  }, [fetchGoals]); // Dependency adalah fungsi fetchGoals itu sendiri

  // --- 4. Realtime Subscription: Menggunakan Payload ---

  useEffect(() => {
    if (!couple?.id) return;

    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals', filter: `couple_id=eq.${couple.id}` },
        (payload) => {
            const newGoal = payload.new as Goal;
            const oldGoal = payload.old as Goal;

            if (payload.eventType === 'INSERT') {
                // Tambahkan di awal sesuai urutan created_at: descending
                setGoals(prev => [newGoal, ...prev]); 
            } else if (payload.eventType === 'UPDATE') {
                // Perbarui item yang sudah ada
                setGoals(prev => prev.map(g => g.id === newGoal.id ? newGoal : g));
            } else if (payload.eventType === 'DELETE') {
                // Hapus item dari state berdasarkan ID
                setGoals(prev => prev.filter(g => g.id !== oldGoal.id));
            }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id]);

  // --- Return Values ---
  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals,
  };
};