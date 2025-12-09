// src/App.tsx
import React, { Suspense } from "react"; // Hapus lazy, ganti dengan Suspense saja
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MainLayout from "@/components/MainLayout"; 
import { Loader2 } from "lucide-react"; 

// --- GANTI: Import Statis untuk SEMUA Halaman ---
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
// ----------------------------------------------

const queryClient = new QueryClient();

// Hapus RouteFallback karena kita tidak lagi menggunakan Suspense di mana-mana

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            
            {/* Rute tanpa Layout */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<NotFound />} /> 
            
            {/* Rute yang membutuhkan Otentikasi */}
            <Route path="/couple-setup" element={
              <ProtectedRoute>
                <CoupleSetup />
              </ProtectedRoute>
            } />

            {/* Rute Utama dengan Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Home />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Rute Lainnya... (Hapus semua Suspense wrapper) */}
            <Route path="/money" element={<ProtectedRoute><MainLayout><Money /></MainLayout></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute><MainLayout><Habits /></MainLayout></ProtectedRoute>} />
            <Route path="/fitness" element={<ProtectedRoute><MainLayout><Fitness /></MainLayout></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><MainLayout><Journal /></MainLayout></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><MainLayout><Goals /></MainLayout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><MainLayout><Chat /></MainLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
            <Route path="/statistics" element={<ProtectedRoute><MainLayout><Statistics /></MainLayout></ProtectedRoute>} />
            <Route path="/travel" element={<ProtectedRoute><MainLayout><TravelMilestones /></MainLayout></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;