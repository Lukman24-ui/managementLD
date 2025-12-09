import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface JournalEntry {
  id: string;
  couple_id: string;
  user_id: string;
  content: string;
  mood_score: number | null;
  gratitude: string | null;
  tags: string[] | null;
  entry_date: string;
  created_at: string;
}

export const useJournal = () => {
  const { user, couple } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Optimasi Fetching dengan useCallback ---

  const fetchEntries = useCallback(async () => {
    if (!couple?.id) {
        setLoading(false);
        setEntries([]);
        return;
    }

    // ✅ PERBAIKAN: Selalu set loading true saat fetching dimulai
    setLoading(true);

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('couple_id', couple.id)
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching journal entries:', error);
      toast.error('Gagal memuat jurnal.');
    } else {
        setEntries(data as JournalEntry[]);
    }

    setLoading(false);
  }, [couple?.id]); 

  // --- 2. Mutasi CRUD: Sinkronisasi dengan Realtime ---

  const addEntry = async (entry: {
    content: string;
    mood_score?: number;
    gratitude?: string;
    tags?: string[];
  }) => {
    if (!user?.id || !couple?.id) return false;

    // ✅ PERBAIKAN: Hapus .select('*').single() dan setEntries di sini.
    // Kita mengandalkan Real-time Subscription (di bawah) untuk memperbarui state.
    const { error } = await supabase.from('journal_entries').insert({
      couple_id: couple.id,
      user_id: user.id,
      content: entry.content,
      mood_score: entry.mood_score || null,
      gratitude: entry.gratitude || null,
      tags: entry.tags || null,
    });

    if (error) {
      toast.error('Gagal menambah jurnal');
      console.error(error);
      return false;
    }

    toast.success('Jurnal berhasil ditambahkan');
    
    // Biarkan Real-time Subscription yang menangani penambahan ke state.
    return true;
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    // Optimistic Update: Perbarui UI sebelum konfirmasi DB
    const originalEntries = entries;
    setEntries(prev => 
        prev.map(e => e.id === id ? { ...e, ...updates } : e)
    );
    
    // Minta data terbaru dari server untuk memastikan konsistensi
    const { data: updatedEntry, error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single(); 

    if (error) {
      toast.error('Gagal memperbarui jurnal');
      console.error(error);
      setEntries(originalEntries); // Rollback jika gagal
      return false;
    }

    toast.success('Jurnal berhasil diperbarui');
    // ✅ PERBAIKAN: Update state secara Pessimistic di sini
    // Real-time listener akan menerima update ini (yang sudah kita terapkan secara Optimistic)
    // dan memastikan data final yang benar dari server.
    setEntries(prev => prev.map(e => e.id === id ? updatedEntry as JournalEntry : e));
    
    return true;
  };

  const deleteEntry = async (id: string) => {
    // Optimistic Update: Hapus dari UI sebelum konfirmasi DB
    const originalEntries = entries;
    setEntries(prev => prev.filter(e => e.id !== id));
    
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus jurnal');
      console.error(error);
      setEntries(originalEntries); // Rollback jika gagal
      return false;
    }

    toast.success('Jurnal berhasil dihapus');
    // Biarkan Real-time Subscription yang menangani penghapusan final.
    return true;
  };

  // --- 3. Initial Fetch ---

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]); 

  // --- 4. Realtime Subscription: Menggunakan Payload ---

  useEffect(() => {
    if (!couple?.id) return;

    const channel = supabase
      .channel('journal-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries', filter: `couple_id=eq.${couple.id}` },
        (payload) => {
            const newEntry = payload.new as JournalEntry;
            const oldEntry = payload.old as JournalEntry;

            if (payload.eventType === 'INSERT') {
                // ✅ PERBAIKAN: Cek duplikasi untuk menghindari masalah Realtime
                setEntries(prev => {
                    if (prev.some(e => e.id === newEntry.id)) return prev;
                    // Tambahkan di awal sesuai urutan entry_date: descending
                    return [newEntry, ...prev];
                }); 
            } else if (payload.eventType === 'UPDATE') {
                // Perbarui item yang sudah ada
                setEntries(prev => prev.map(e => e.id === newEntry.id ? newEntry : e));
            } else if (payload.eventType === 'DELETE') {
                // Hapus item dari state berdasarkan ID
                setEntries(prev => prev.filter(e => e.id !== oldEntry.id));
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
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
};