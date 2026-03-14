import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import LinkScanner from "@/pages/LinkScanner";
import ImageDetection from "@/pages/ImageDetection";
import VideoDetection from "@/pages/VideoDetection";
import AudioDetection from "@/pages/AudioDetection";
import EmailAnalysis from "@/pages/EmailAnalysis";
import BreachCheck from "@/pages/BreachCheck";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
              <Route path="/link-scanner" element={<ProtectedLayout><LinkScanner /></ProtectedLayout>} />
              <Route path="/image-detection" element={<ProtectedLayout><ImageDetection /></ProtectedLayout>} />
              <Route path="/video-detection" element={<ProtectedLayout><VideoDetection /></ProtectedLayout>} />
              <Route path="/audio-detection" element={<ProtectedLayout><AudioDetection /></ProtectedLayout>} />
              <Route path="/email-analysis" element={<ProtectedLayout><EmailAnalysis /></ProtectedLayout>} />
              <Route path="/breach-check" element={<ProtectedLayout><BreachCheck /></ProtectedLayout>} />
              <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
