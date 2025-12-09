import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  couple_id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

export const useTransactions = () => {
  const { user, couple } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fungsi Fetch Transaksi
  const fetchTransactions = useCallback(async () => {
    if (!couple?.id) {
      setTransactions([]); // Kosongkan jika tidak ada couple
      setLoading(false);
      return;
    }
    
    // ✅ PERBAIKAN: Selalu set loading true saat fetching dimulai
    setLoading(true); 

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('couple_id', couple.id)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Gagal memuat transaksi.');
    } else {
      setTransactions(data as Transaction[]);
    }

    setLoading(false);
  }, [couple?.id]);

  // Fetch data awal
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);


  // 2. Mutasi: Tambah Transaksi (Hanya Mengandalkan Real-time untuk Update State)
  const addTransaction = async (transaction: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
  }) => {
    if (!user?.id || !couple?.id) return false;

    // Tidak perlu .select('*').single() jika hanya butuh konfirmasi
    const { error } = await supabase
      .from('transactions')
      .insert({
        couple_id: couple.id,
        user_id: user.id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || null,
      });
        // NOTE: Kita tidak lagi memanggil .select() karena kita mengandalkan Real-time

    if (error) {
      toast.error('Gagal menambah transaksi');
      console.error(error);
      return false;
    }

    toast.success('Transaksi berhasil ditambahkan');
    // ✅ PERBAIKAN: Hapus update state lokal (setTransactions) di sini
    // Biarkan Real-time Subscription (useEffect di bawah) yang menangani penambahan ke state.
    return true;
  };

  // 3. Mutasi: Hapus Transaksi (Optimistic Update)
  const deleteTransaction = async (id: string) => {
    // Optimistic Update: Hapus dari UI sebelum konfirmasi DB
    const originalTransactions = transactions;
    setTransactions(prev => prev.filter(t => t.id !== id)); 
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus transaksi');
      console.error(error);
      // Rollback jika gagal
      setTransactions(originalTransactions);
      return false;
    }

    toast.success('Transaksi berhasil dihapus');
    // ✅ PERBAIKAN: Hapus setTransactions(prev => prev.filter(...)) di sini
    // Biarkan Real-time Subscription yang menangani penghapusan final.
    return true;
  };


  // 4. Optimasi Realtime: Menggunakan Payload
  useEffect(() => {
    if (!couple?.id) return;

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `couple_id=eq.${couple.id}` },
        (payload) => {
          // Tangani perubahan berdasarkan payload realtime
          const newTransaction = payload.new as Transaction;
          const oldTransaction = payload.old as Transaction;

          if (payload.eventType === 'INSERT') {
                // Tambahkan hanya jika belum ada (optional check)
                setTransactions(prev => {
                    if (prev.some(t => t.id === newTransaction.id)) return prev;
                    return [newTransaction, ...prev];
                });
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => prev.filter(t => t.id !== oldTransaction.id));
          } else if (payload.eventType === 'UPDATE') {
                // Tambahkan logika update jika ada kolom yang bisa diubah
                setTransactions(prev => 
                    prev.map(t => (t.id === newTransaction.id ? newTransaction : t))
                );
            }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id]);


  // Penghitungan total (tetap sama)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance,
    refetch: fetchTransactions,
  };
};