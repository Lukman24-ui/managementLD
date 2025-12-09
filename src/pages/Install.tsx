import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/couple/AppCard";
import { Download, Smartphone, Check, Share, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-turquoise/20 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-turquoise" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Sudah Terinstal!</h1>
        <p className="text-muted-foreground text-center mb-8">
          CoupleSync sudah terinstal di perangkat kamu
        </p>
        <Button onClick={() => navigate("/home")} className="w-full max-w-xs">
          Buka Aplikasi
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="w-24 h-24 bg-gradient-to-br from-turquoise to-mint rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft">
            <Smartphone className="w-12 h-12 text-background" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Install CoupleSync</h1>
          <p className="text-muted-foreground">
            Pasang aplikasi di HP kamu untuk pengalaman terbaik
          </p>
        </div>

        {/* Benefits */}
        <AppCard className="mb-6">
          <h2 className="font-semibold text-foreground mb-4">Keuntungan Install:</h2>
          <div className="space-y-3">
            {[
              "Akses cepat dari home screen",
              "Bisa dipakai offline",
              "Notifikasi pengingat",
              "Loading lebih cepat",
              "Seperti aplikasi native",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-turquoise/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-turquoise" />
                </div>
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </AppCard>

        {/* Install Instructions */}
        {isIOS ? (
          <AppCard className="mb-6">
            <h2 className="font-semibold text-foreground mb-4">Cara Install di iPhone:</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-turquoise text-background rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="text-sm text-foreground">Ketuk tombol Share</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Share className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">di bagian bawah Safari</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-turquoise text-background rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="text-sm text-foreground">Pilih "Add to Home Screen"</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">scroll ke bawah jika perlu</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-turquoise text-background rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="text-sm text-foreground">Ketuk "Add" di pojok kanan atas</p>
                </div>
              </div>
            </div>
          </AppCard>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} className="w-full h-14 text-lg gap-3 mb-6">
            <Download className="w-6 h-6" />
            Install Sekarang
          </Button>
        ) : (
          <AppCard className="mb-6">
            <h2 className="font-semibold text-foreground mb-4">Cara Install di Android:</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-turquoise text-background rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <p className="text-sm text-foreground">Ketuk menu ⋮ di pojok kanan atas browser</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-turquoise text-background rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <p className="text-sm text-foreground">Pilih "Install app" atau "Add to Home screen"</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-turquoise text-background rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <p className="text-sm text-foreground">Konfirmasi dengan ketuk "Install"</p>
              </div>
            </div>
          </AppCard>
        )}

        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="w-full text-muted-foreground"
        >
          Lanjut tanpa install
        </Button>
      </div>
    </div>
  );
};

export default Install;
