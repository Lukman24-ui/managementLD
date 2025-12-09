import { Toaster as Sonner } from "@/components/ui/sonner"; // Hapus impor Toaster Radix yang tidak digunakan
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
// Hapus impor BottomNav dari sini karena sudah dipindahkan ke MainLayout
import MainLayout from "@/components/MainLayout"; // Import komponen layout baru

// Import Halaman
import Home from "./pages/Home";
import Money from "./pages/Money";
import Habits from "./pages/Habits";
import Fitness from "./pages/Fitness";
import Journal from "./pages/Journal";
import Goals from "./pages/Goals";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import CoupleSetup from "./pages/CoupleSetup";
import TravelMilestones from "./pages/TravelMilestones";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Hapus <Toaster /> (Radix/shadcn) karena Auth.tsx menggunakan Sonner */}
      <Sonner /> {/* ✅ Toaster Sonner tetap di sini sebagai root portal */}
      
      <BrowserRouter>
        <AuthProvider>
          {/* ✅ Hapus <div> wrapper di sini, karena sudah ada di MainLayout */}
          <Routes>
            {/* Rute tanpa Layout (Login, Setup, Install, 404) */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<NotFound />} /> 
            
            {/* Rute yang membutuhkan Otentikasi DAN BottomNav */}
            <Route path="/couple-setup" element={
              <ProtectedRoute>
                <CoupleSetup /> {/* CoupleSetup biasanya tidak butuh BottomNav, tapi dimasukkan ke sini jika memang bagian dari app utama */}
              </ProtectedRoute>
            } />

            {/* Rute Utama dengan Layout (termasuk BottomNav) */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Home />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/money" element={
              <ProtectedRoute>
                <MainLayout><Money /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/habits" element={
              <ProtectedRoute>
                <MainLayout><Habits /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/fitness" element={
              <ProtectedRoute>
                <MainLayout><Fitness /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/journal" element={
              <ProtectedRoute>
                <MainLayout><Journal /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/goals" element={
              <ProtectedRoute>
                <MainLayout><Goals /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <MainLayout><Chat /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout><Profile /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/statistics" element={
              <ProtectedRoute>
                <MainLayout><Statistics /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/travel" element={
              <ProtectedRoute>
                <MainLayout><TravelMilestones /></MainLayout>
              </ProtectedRoute>
            } />
          </Routes>
          
          {/* ✅ Hapus <BottomNav /> dari sini */}
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;