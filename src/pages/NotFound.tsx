import { useLocation, useNavigate } from "react-router-dom"; // ✅ PERBAIKAN: Import useNavigate
import { useEffect } from "react";
import { Button } from "@/components/ui/button"; // ✅ PERBAIKAN: Import Button
import { Frown } from 'lucide-react'; // ✅ PERBAIKAN: Icon untuk UX

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ PERBAIKAN: Gunakan useNavigate untuk navigasi

  useEffect(() => {
    // Log error ke konsol untuk tujuan debugging
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center animate-fade-in-up">
        
        {/* Desain 404 yang Lebih Menarik */}
        <div className="mx-auto mb-6 w-24 h-24 rounded-3xl bg-destructive/10 flex items-center justify-center">
            <Frown className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="mb-2 text-6xl font-extrabold text-foreground">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Halaman tidak ditemukan.</p>
        
        <p className="mb-8 text-sm text-muted-foreground">
            Kami tidak dapat menemukan rute <span className="font-mono bg-muted p-1 rounded-md text-foreground/70">{location.pathname}</span>.
        </p>
        
        {/* Gunakan komponen Button untuk konsistensi UI */}
        <Button 
            onClick={() => navigate('/')} 
            variant="gradient"
            size="lg"
            className="w-full max-w-[200px]"
        >
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
};

export default NotFound;