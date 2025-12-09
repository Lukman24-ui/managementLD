import React, { lazy, Suspense } from "react"; // Import React, lazy, dan Suspense
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MainLayout from "@/components/MainLayout"; 
import { Loader2 } from "lucide-react"; // Import Loader2

// --- Dynamic Imports (Code Splitting) ---
const Home = lazy(() => import("./pages/Home"));
const Money = lazy(() => import("./pages/Money"));
const Habits = lazy(() => import("./pages/Habits"));
const Fitness = lazy(() => import("./pages/Fitness"));
const Journal = lazy(() => import("./pages/Journal"));
const Goals = lazy(() => import("./pages/Goals"));
const Chat = lazy(() => import("./pages/Chat"));
const Profile = lazy(() => import("./pages/Profile"));
const Statistics = lazy(() => import("./pages/Statistics"));
const Install = lazy(() => import("./pages/Install"));
const Auth = lazy(() => import("./pages/Auth"));
const CoupleSetup = lazy(() => import("./pages/CoupleSetup"));
const TravelMilestones = lazy(() => import("./pages/TravelMilestones"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Komponen Fallback untuk Suspense
const RouteFallback = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-turquoise" />
    </div>
);


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            
            {/* Rute tanpa Layout (Login, Setup, Install, 404) */}
            <Route path="/auth" element={<Suspense fallback={<RouteFallback />}><Auth /></Suspense>} />
            <Route path="/install" element={<Suspense fallback={<RouteFallback />}><Install /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<RouteFallback />}><NotFound /></Suspense>} /> 
            
            {/* Rute yang membutuhkan Otentikasi, tidak menggunakan BottomNav */}
            <Route path="/couple-setup" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <CoupleSetup />
                </Suspense>
              </ProtectedRoute>
            } />

            {/* Rute Utama dengan Layout (termasuk BottomNav) */}
            
            {/* Rute Beranda */}
            <Route path="/" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <MainLayout>
                    <Home />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            
            {/* Rute Lainnya dengan Layout */}
            <Route path="/money" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <MainLayout><Money /></MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/habits" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <MainLayout><Habits /></MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/fitness" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <MainLayout><Fitness /></MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/journal" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <MainLayout><Journal /></MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/goals" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <MainLayout><Goals /></MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <MainLayout><Chat /></MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <MainLayout><Profile /></MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/statistics" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <MainLayout><Statistics /></MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/travel" element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <MainLayout><TravelMilestones /></MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;