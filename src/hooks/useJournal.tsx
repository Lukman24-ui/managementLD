import { useState, useEffect } from 'react';
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

  const fetchEntries = async () => {
    if (!couple?.id) return;

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('couple_id', couple.id)
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching journal entries:', error);
      return;
    }

    setEntries(data as JournalEntry[]);
    setLoading(false);
  };

  const addEntry = async (entry: {
    content: string;
    mood_score?: number;
    gratitude?: string;
    tags?: string[];
  }) => {
    if (!user?.id || !couple?.id) return;

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
    fetchEntries();
    return true;
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    const { error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Gagal memperbarui jurnal');
      console.error(error);
      return false;
    }

    toast.success('Jurnal berhasil diperbarui');
    fetchEntries();
    return true;
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus jurnal');
      console.error(error);
      return false;
    }

    toast.success('Jurnal berhasil dihapus');
    fetchEntries();
    return true;
  };

  useEffect(() => {
    fetchEntries();
  }, [couple?.id]);

  useEffect(() => {
    if (!couple?.id) return;

    const channel = supabase
      .channel('journal-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries' },
        () => fetchEntries()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id]);

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
};
