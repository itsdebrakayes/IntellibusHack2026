import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
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

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Layout>{children}</Layout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/link-scanner" element={<AppLayout><LinkScanner /></AppLayout>} />
            <Route path="/image-detection" element={<AppLayout><ImageDetection /></AppLayout>} />
            <Route path="/video-detection" element={<AppLayout><VideoDetection /></AppLayout>} />
            <Route path="/audio-detection" element={<AppLayout><AudioDetection /></AppLayout>} />
            <Route path="/email-analysis" element={<AppLayout><EmailAnalysis /></AppLayout>} />
            <Route path="/breach-check" element={<AppLayout><BreachCheck /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
