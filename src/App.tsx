
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Index from "./pages/Index";
import JobsPage from "./pages/JobsPage";
import ProjectJobsPage from "./pages/ProjectJobsPage";
import LogsPage from "./pages/LogsPage";
import UserManagementPage from "./pages/UserManagementPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const isLoggedIn = !!localStorage.getItem("user");

  // Setup mock data when running in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("Setting up mock data for development...");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="cron-hub-theme">
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />} 
            />
            <Route 
              path="/" 
              element={isLoggedIn ? <Index /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/jobs" 
              element={isLoggedIn ? <JobsPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/jobs/:projectId" 
              element={isLoggedIn ? <ProjectJobsPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/logs" 
              element={isLoggedIn ? <LogsPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/users" 
              element={isLoggedIn ? <UserManagementPage /> : <Navigate to="/login" />}
            />
            <Route 
              path="/settings" 
              element={isLoggedIn ? <SettingsPage /> : <Navigate to="/login" />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
