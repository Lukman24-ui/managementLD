import { AppCard } from "@/components/couple/AppCard";
import { CoupleAvatars } from "@/components/couple/Avatar";
import { ProgressRing } from "@/components/couple/ProgressRing";
import { TransactionItem } from "@/components/couple/TransactionItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShoppingCart, 
  Utensils, 
  Car, 
  Film,
  Plus,
  TrendingUp,
  PiggyBank,
  Home,
  Plane,
  Trash2,
  X,
  Loader2
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const categoryIcons: Record<string, any> = {
  'Belanja': ShoppingCart,
  'Makanan': Utensils,
  'Transport': Car,
  'Hiburan': Film,
  'Gaji': TrendingUp,
  'Tabungan': PiggyBank,
  'Rumah': Home,
  'Liburan': Plane,
};

const Money = () => {
  const { profile, partnerProfile } = useAuth();
  const { transactions, loading, addTransaction, deleteTransaction, totalIncome, totalExpense, balance } = useTransactions();
  const userName = profile?.full_name?.split(' ')[0] || 'Kamu';
  const partnerName = partnerProfile?.full_name?.split(' ')[0] || 'Pasangan';

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Belanja',
    description: '',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async () => {
    if (!formData.amount) return;
    setSaving(true);
    const success = await addTransaction({
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
    });
    setSaving(false);
    if (success) {
      setShowAddDialog(false);
      setFormData({ amount: '', type: 'expense', category: 'Belanja', description: '' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteTransaction(deleteId);
    setDeleteId(null);
  };

  const getTransactionIcon = (category: string) => {
    return categoryIcons[category] || ShoppingCart;
  };

  // Calculate category spending
  const categorySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const totalCategorySpending = Object.values(categorySpending).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Keuangan Bersama</h1>
            <p className="text-sm text-muted-foreground">Kelola uang bersama</p>
          </div>
          <CoupleAvatars
            partner1={{ name: userName }}
            partner2={{ name: partnerName }}
            size="md"
          />
        </div>

        {/* Balance Card */}
        <AppCard variant="gradient" className="mb-4" delay={100}>
          <p className="text-sm text-charcoal/70 mb-1">Total Saldo</p>
          <h2 className="text-3xl font-bold text-turquoise mb-4">{formatCurrency(balance)}</h2>
          
          <div className="flex gap-4">
            <div className="flex-1 bg-card/50 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-mint flex items-center justify-center">
                  <ArrowDownLeft className="h-3 w-3 text-turquoise-dark" />
                </div>
                <span className="text-xs text-muted-foreground">Pemasukan</span>
              </div>
              <p className="font-bold text-foreground">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="flex-1 bg-card/50 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                  <ArrowUpRight className="h-3 w-3 text-destructive" />
                </div>
                <span className="text-xs text-muted-foreground">Pengeluaran</span>
              </div>
              <p className="font-bold text-foreground">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </AppCard>

        {/* Spending by Category */}
        <AppCard className="mb-4" delay={200}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Pengeluaran Bulan Ini</h3>
          
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(categorySpending).slice(0, 4).map(([category, amount]) => {
              const Icon = getTransactionIcon(category);
              const percent = totalCategorySpending > 0 ? Math.round((amount / totalCategorySpending) * 100) : 0;
              return (
                <div key={category} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-turquoise/10 flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-turquoise" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{category}</span>
                  <span className="text-[10px] text-muted-foreground">{percent}%</span>
                </div>
              );
            })}
          </div>
        </AppCard>

        {/* Transactions */}
        <AppCard delay={400}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Transaksi Terbaru</h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-turquoise" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada transaksi</p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((tx) => {
                const Icon = getTransactionIcon(tx.category);
                return (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <TransactionItem 
                        icon={Icon}
                        category={tx.category}
                        description={tx.description || tx.category}
                        amount={Number(tx.amount)}
                        date={new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        partnerName={userName}
                        type={tx.type}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(tx.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </AppCard>

        {/* Add Transaction FAB */}
        <Button 
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-elevated z-40"
          size="icon-lg"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Transaksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipe</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as 'income' | 'expense' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jumlah (Rp)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <Label>Kategori</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryIcons).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Input
                placeholder="Deskripsi transaksi..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={saving || !formData.amount}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Money;
