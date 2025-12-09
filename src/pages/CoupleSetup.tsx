import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppCard } from '@/components/couple/AppCard';
import { Heart, Link2, Copy, CheckCircle2, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CoupleSetup = () => {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { createCouple, joinCouple, profile } = useAuth();

  const handleCreateCouple = async () => {
    setLoading(true);
    const { inviteCode, error } = await createCouple();
    setLoading(false);

    if (error) {
      toast.error('Gagal membuat kode undangan');
      return;
    }

    if (inviteCode) {
      setGeneratedCode(inviteCode);
      setMode('create');
      toast.success('Kode undangan berhasil dibuat!');
    }
  };

  const handleJoinCouple = async () => {
    if (!inviteCode.trim()) {
      toast.error('Masukkan kode undangan');
      return;
    }

    setLoading(true);
    const { error } = await joinCouple(inviteCode);
    setLoading(false);

    if (error) {
      toast.error(typeof error === 'string' ? error : 'Kode undangan tidak valid');
      return;
    }

    toast.success('Berhasil terhubung dengan pasangan!');
    navigate('/');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success('Kode berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-turquoise to-turquoise-dark flex items-center justify-center mx-auto mb-4 shadow-elevated">
            <Heart className="h-10 w-10 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Halo, {profile?.full_name?.split(' ')[0] || 'Kamu'}! 💕
          </h1>
          <p className="text-muted-foreground">
            Hubungkan akunmu dengan pasanganmu
          </p>
        </div>

        {mode === 'choose' && (
          <>
            {/* Create Couple Option */}
            <AppCard 
              className="mb-4 cursor-pointer hover:shadow-elevated transition-all"
              onClick={handleCreateCouple}
              delay={100}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-turquoise/10 flex items-center justify-center">
                  <Link2 className="h-7 w-7 text-turquoise" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Buat Kode Undangan</h3>
                  <p className="text-sm text-muted-foreground">
                    Buat kode untuk mengundang pasanganmu
                  </p>
                </div>
                {loading ? (
                  <Loader2 className="h-5 w-5 text-turquoise animate-spin" />
                ) : null}
              </div>
            </AppCard>

            {/* Join Couple Option */}
            <AppCard 
              className="mb-4 cursor-pointer hover:shadow-elevated transition-all"
              onClick={() => setMode('join')}
              delay={200}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-mint/50 flex items-center justify-center">
                  <Users className="h-7 w-7 text-turquoise-dark" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Gabung dengan Pasangan</h3>
                  <p className="text-sm text-muted-foreground">
                    Masukkan kode undangan dari pasanganmu
                  </p>
                </div>
              </div>
            </AppCard>
          </>
        )}

        {mode === 'create' && (
          <AppCard delay={100}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-mint/50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-turquoise" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Kode Undangan Berhasil Dibuat!
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Bagikan kode ini ke pasanganmu untuk terhubung
              </p>

              <div className="bg-muted rounded-2xl p-4 mb-4">
                <p className="text-3xl font-bold text-turquoise tracking-widest">
                  {generatedCode}
                </p>
              </div>

              <Button
                variant="gradient"
                className="w-full mb-3"
                onClick={copyCode}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Salin Kode
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                Menunggu pasanganmu bergabung...
              </p>
              
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => navigate('/')}
              >
                Lanjutkan ke Beranda
              </Button>
            </div>
          </AppCard>
        )}

        {mode === 'join' && (
          <AppCard delay={100}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-mint/50 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-turquoise" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Masukkan Kode Undangan
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Minta kode undangan dari pasanganmu
              </p>

              <Input
                type="text"
                placeholder="XXXXXXXX"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="h-14 rounded-2xl border-border bg-muted/50 text-center text-2xl font-bold tracking-widest uppercase mb-4"
                maxLength={8}
              />

              <Button
                variant="gradient"
                className="w-full mb-3"
                onClick={handleJoinCouple}
                disabled={loading || !inviteCode.trim()}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                Gabung
              </Button>

              <Button
                variant="ghost"
                onClick={() => setMode('choose')}
              >
                Kembali
              </Button>
            </div>
          </AppCard>
        )}
      </div>
    </div>
  );
};

export default CoupleSetup;
