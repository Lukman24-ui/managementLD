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
              <Route path="/couple-setup" element={
                <ProtectedRoute>
                  <CoupleSetup />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/money" element={
                <ProtectedRoute>
                  <Money />
                </ProtectedRoute>
              } />
              <Route path="/habits" element={
                <ProtectedRoute>
                  <Habits />
                </ProtectedRoute>
              } />
              <Route path="/fitness" element={
                <ProtectedRoute>
                  <Fitness />
                </ProtectedRoute>
              } />
              <Route path="/journal" element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              } />
              <Route path="/goals" element={
                <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/statistics" element={
                <ProtectedRoute>
                  <Statistics />
                </ProtectedRoute>
              } />
              <Route path="/travel" element={
                <ProtectedRoute>
                  <TravelMilestones />
                </ProtectedRoute>
              } />
              <Route path="/install" element={<Install />} />
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
