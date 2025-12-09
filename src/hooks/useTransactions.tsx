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

  // 1. Optimasi Fungsi Fetch dengan useCallback
  const fetchTransactions = useCallback(async () => {
    if (!couple?.id) {
      setLoading(false); // Penting: Jika tidak ada couple, tetap hentikan loading
      return;
    }
    
    // Set loading ke true hanya jika belum loading, atau jika dipanggil secara manual
    if (transactions.length === 0 && !loading) {
        setLoading(true); 
    }

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
  }, [couple?.id]); // Fungsi ini hanya dibuat ulang jika couple.id berubah

  // Fetch data awal saat couple.id berubah atau saat hook mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]); // Dependency fetchTransactions (yang dibuat ulang hanya jika couple.id berubah)


  // 2. Optimasi Mutasi: Menggunakan State Lokal (Pessimistic Update)
  const addTransaction = async (transaction: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
  }) => {
    if (!user?.id || !couple?.id) return false;

    // Supabase harus mengembalikan data yang baru di-insert agar kita bisa update state lokal
    const { data: newTransaction, error } = await supabase
      .from('transactions')
      .insert({
        couple_id: couple.id,
        user_id: user.id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || null,
      })
      .select('*') // Meminta data transaksi lengkap yang baru dibuat
      .single();

    if (error) {
      toast.error('Gagal menambah transaksi');
      console.error(error);
      return false;
    }

    toast.success('Transaksi berhasil ditambahkan');
    
    // FIX: Update state lokal secara langsung (lebih cepat dari full fetch)
    setTransactions(prev => [newTransaction as Transaction, ...prev]);

    // Kita tidak perlu memanggil fetchTransactions() karena sudah ditangani oleh Realtime (Langkah 3)
    return true;
  };

  const deleteTransaction = async (id: string) => {
    // Optimistic Update (opsional): Hapus dari UI sebelum konfirmasi DB
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
    // Tidak perlu fetchTransactions() karena sudah ditangani oleh Realtime
    return true;
  };


  // 3. Optimasi Realtime: Menggunakan Payload (Manipulasi State Langsung)
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
            setTransactions(prev => [newTransaction, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => prev.filter(t => t.id !== oldTransaction.id));
          } 
          // Jika UPDATE diperlukan, logikanya akan diletakkan di sini
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