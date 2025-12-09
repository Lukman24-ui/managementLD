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
        setGoals([]); // Kosongkan jika tidak ada couple
        setLoading(false);
        return;
    }

    // ✅ PERBAIKAN: Selalu set loading true saat fetching dimulai
    setLoading(true);

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
  }, [couple?.id]); 

  // --- 2. Mutasi CRUD: Gunakan State Lokal ---

  const addGoal = async (goal: {
    title: string;
    description?: string;
    icon?: string;
    target_amount?: number;
    target_date?: string;
  }) => {
    if (!couple?.id) return false;

    // ✅ PERBAIKAN: Mengandalkan Real-time untuk UPDATE STATE
    // Kita tidak perlu .select('*').single() dan update state lokal.
    // Ini MENCEGAH DUPLIKASI data yang disebabkan oleh Real-time Subscription.
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
    
    // Biarkan Real-time Subscription yang menangani setGoals([newGoal, ...prev])
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
    
    // ✅ PERBAIKAN: Hapus setGoals(prev => prev.map(...)) yang ada di sini
    // Karena Optimistic Update sudah dilakukan di awal fungsi.
    // Real-time Subscription (di bawah) akan memberikan konfirmasi pembaruan
    // dari server (jika diperlukan untuk klien lain).

    toast.success('Tujuan berhasil diperbarui');
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

    // ✅ PERBAIKAN: Hapus setGoals(prev => prev.filter(...))
    // Karena Optimistic Update sudah dilakukan di awal fungsi, tidak perlu ada setGoals lagi.

    toast.success('Tujuan berhasil dihapus');
    return true;
  };

  // --- 3. Initial Fetch ---

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]); 

  // --- 4. Realtime Subscription: Menggunakan Payload ---

  useEffect(() => {
    if (!couple?.id) return;

    // Pastikan kita tidak menerima event dari mutasi yang baru saja kita lakukan
    // Supabase Realtime umumnya cerdas, tetapi kita tambahkan cek unik untuk INSERT.

    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals', filter: `couple_id=eq.${couple.id}` },
        (payload) => {
            const newGoal = payload.new as Goal;
            const oldGoal = payload.old as Goal;

            if (payload.eventType === 'INSERT') {
                setGoals(prev => {
                    // Cek jika item sudah ada (mencegah duplikasi dari Real-time)
                    if (prev.some(g => g.id === newGoal.id)) return prev; 
                    // Tambahkan di awal sesuai urutan created_at: descending
                    return [newGoal, ...prev];
                }); 
            } else if (payload.eventType === 'UPDATE') {
                // Perbarui item yang sudah ada (mengambil data final dari server)
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