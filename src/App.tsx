import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BottomNav } from "@/components/couple/BottomNav";
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
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/install" element={<Install />} />
              
              {/* Rute yang hanya membutuhkan Autentikasi (TIDAK MEMBUTUHKAN COUPLE) */}
              <Route path="/couple-setup" element={
                <ProtectedRoute>
                  <CoupleSetup />
                </ProtectedRoute>
              } />
              {/* Rute Profile TIDAK MEMBUTUHKAN COUPLE (digunakan untuk setup awal) */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Rute yang MEMBUTUHKAN COUPLE AKTIF (requireCouple={true}) */}
              <Route path="/" element={
                <ProtectedRoute requireCouple={true}>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/money" element={
                <ProtectedRoute requireCouple={true}>
                  <Money />
                </ProtectedRoute>
              } />
              <Route path="/habits" element={
                <ProtectedRoute requireCouple={true}>
                  <Habits />
                </ProtectedRoute>
              } />
              <Route path="/fitness" element={
                <ProtectedRoute requireCouple={true}>
                  <Fitness />
                </ProtectedRoute>
              } />
              <Route path="/journal" element={
                <ProtectedRoute requireCouple={true}>
                  <Journal />
                </ProtectedRoute>
              } />
              <Route path="/goals" element={
                <ProtectedRoute requireCouple={true}>
                  <Goals />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute requireCouple={true}>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="/statistics" element={
                <ProtectedRoute requireCouple={true}>
                  <Statistics />
                </ProtectedRoute>
              } />
              <Route path="/travel" element={
                <ProtectedRoute requireCouple={true}>
                  <TravelMilestones />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;