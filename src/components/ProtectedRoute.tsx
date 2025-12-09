import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireCouple?: boolean;
}

export const ProtectedRoute = ({ children, requireCouple = false }: ProtectedRouteProps) => {
  // Mengambil state yang diperlukan dari AuthProvider
  const { user, couple, loading } = useAuth();

  // --- 1. Status Loading ---
  // Tampilkan spinner jika data autentikasi/profil masih dimuat
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          {/* Pastikan Loader2 ter-import dari 'lucide-react' */}
          <Loader2 className="h-10 w-10 text-turquoise animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // --- 2. Status Tidak Terautentikasi ---
  // Redirect ke halaman login jika user tidak ada
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // --- 3. Status Membutuhkan Pasangan ---
  // Redirect ke halaman setup jika requireCouple true dan couple belum ada
  if (requireCouple && !couple) {
    return <Navigate to="/couple-setup" replace />;
  }

  // --- 4. Akses Diberikan ---
  // Render children jika semua kondisi terpenuhi
  return <>{children}</>;
};