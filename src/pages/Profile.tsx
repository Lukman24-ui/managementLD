import { AppCard } from "@/components/couple/AppCard";
import { AvatarUpload } from "@/components/couple/AvatarUpload";
import { CoupleAvatar } from "@/components/couple/Avatar";
import { ProgressRing } from "@/components/couple/ProgressRing";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  DollarSign, 
  Palette, 
  RefreshCw, 
  ChevronRight, 
  Settings,
  LogOut,
  Shield,
  HelpCircle,
  Moon,
  Dumbbell,
  Target,
  BookHeart,
  Link2,
  Loader2
} from "lucide-react";
import { useState } from "react";
import NotificationSettings from "@/components/couple/NotificationSettings";

// --- DATA STATIS DIPINDAHKAN KE LUAR KOMPONEN ---

const STATS_DATA = [
  { icon: BookHeart, label: "Mood", value: 85, color: "turquoise" as const },
  { icon: Target, label: "Kebiasaan", value: 78, color: "mint" as const },
  { icon: Dumbbell, label: "Kebugaran", value: 92, color: "happiness" as const },
];

const SETTINGS_DATA = [
  { icon: DollarSign, label: "Format Mata Uang", value: "IDR (Rp)" },
  { icon: Palette, label: "Tema", value: "Turquoise" },
  { icon: RefreshCw, label: "Sinkronisasi Data", value: "Otomatis" },
];

const MORE_OPTIONS_DATA = [
  { icon: Shield, label: "Privasi & Keamanan", onClick: () => console.log('Navigasi ke Privasi') },
  { icon: HelpCircle, label: "Bantuan & Dukungan", onClick: () => console.log('Navigasi ke Bantuan') },
  { icon: Moon, label: "Mode Gelap", toggle: true }, 
];

// --- KOMPONEN UTAMA ---

const Profile = () => {
  const { user, profile, partnerProfile, couple, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); 

  const userName = profile?.full_name || 'Pengguna';
  
  // KUNCI PERBAIKAN: Menggunakan email dari objek user Supabase (bukan hardcode)
  const userEmail = user?.email || (profile?.full_name 
    ? `${profile.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com`
    : 'email@example.com'); // Fallback generik
  
  const partnerName = partnerProfile?.full_name?.split(' ')[0] || null;
  const isConnected = couple?.status === 'active' && partnerProfile;

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut(); 
    navigate('/auth');
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    toast.info(`Mode Gelap ${isDarkMode ? 'Dinonaktifkan' : 'Diaktifkan'}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 opacity-0 animate-fade-in-up">
          <h1 className="text-2xl font-bold text-foreground">Profil</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings-detail')}>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Profile Card */}
        <AppCard variant="gradient" className="mb-4 text-center" delay={100}>
          <div className="relative inline-block mb-4">
            {user && (
              <AvatarUpload
                userId={user.id}
                currentAvatarUrl={profile?.avatar_url}
                name={userName}
                onUploadComplete={(url) => updateProfile({ avatar_url: url })}
              />
            )}
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-1">{userName}</h2>
          <p className="text-sm text-muted-foreground mb-3">{userEmail}</p>
          
          {isConnected ? (
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-turquoise/10 inline-flex">
              <CoupleAvatar 
                src={partnerProfile?.avatar_url || undefined} 
                name={partnerName || ''} 
                size="sm" 
              />
              <span className="text-sm font-medium text-turquoise">Terhubung dengan {partnerName} 💙</span>
            </div>
          ) : (
            <Button 
              variant="mint" 
              size="sm"
              onClick={() => navigate('/couple-setup')}
              className="inline-flex"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Hubungkan dengan Pasangan
            </Button>
          )}
        </AppCard>

        {/* Stats */}
        <AppCard className="mb-4" delay={200}>
          <h3 className="text-base font-semibold text-foreground mb-4">Statistik Kamu</h3>
          
          <div className="grid grid-cols-3 gap-4">
            {STATS_DATA.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <ProgressRing
                  progress={stat.value}
                  size={64}
                  strokeWidth={6}
                  color={stat.color}
                  showLabel={false}
                />
                <div className="mt-2 text-center">
                  <p className="text-lg font-bold text-foreground">{stat.value}%</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </AppCard>

        {/* Notification Settings */}
        <div className="mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}>
          <NotificationSettings />
        </div>

        {/* Settings */}
        <AppCard className="mb-4" delay={300}>
          <h3 className="text-base font-semibold text-foreground mb-4">Pengaturan</h3>
          
          <div className="space-y-1">
            {SETTINGS_DATA.map((setting) => (
              <button
                key={setting.label}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-turquoise/10 flex items-center justify-center">
                  <setting.icon className="h-5 w-5 text-turquoise" />
                </div>
                <span className="flex-1 text-left text-sm font-medium text-foreground">
                  {setting.label}
                </span>
                <span className="text-sm text-muted-foreground">{setting.value}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
            
          </div>
        </AppCard>

        {/* More Options */}
        <AppCard className="mb-4" delay={400}>
          <h3 className="text-base font-semibold text-foreground mb-4">Lainnya</h3>
          
          <div className="space-y-1">
            {MORE_OPTIONS_DATA.map((option) => (
              <button
                key={option.label}
                onClick={option.toggle ? handleToggleDarkMode : option.onClick} 
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <option.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-left text-sm font-medium text-foreground">
                  {option.label}
                </span>
                {option.toggle ? (
                  // UI Toggle dengan state isDarkMode
                  <div className={`w-10 h-6 rounded-full relative transition-all duration-300 ${isDarkMode ? 'bg-turquoise' : 'bg-muted-foreground/50'}`}>
                    <div 
                        className={`absolute top-1 w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </div>
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </AppCard>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          Keluar
        </Button>
      </div>
    </div>
  );
};

export default Profile;