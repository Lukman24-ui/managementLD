import { useState, useEffect } from 'react';
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

  const fetchTransactions = async () => {
    if (!couple?.id) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('couple_id', couple.id)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    setTransactions(data as Transaction[]);
    setLoading(false);
  };

  const addTransaction = async (transaction: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
  }) => {
    if (!user?.id || !couple?.id) return;

    const { error } = await supabase.from('transactions').insert({
      couple_id: couple.id,
      user_id: user.id,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || null,
    });

    if (error) {
      toast.error('Gagal menambah transaksi');
      console.error(error);
      return false;
    }

    toast.success('Transaksi berhasil ditambahkan');
    fetchTransactions();
    return true;
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus transaksi');
      console.error(error);
      return false;
    }

    toast.success('Transaksi berhasil dihapus');
    fetchTransactions();
    return true;
  };

  useEffect(() => {
    fetchTransactions();
  }, [couple?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!couple?.id) return;

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => fetchTransactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id]);

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
