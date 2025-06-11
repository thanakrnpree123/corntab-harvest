import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const ProjectJobsPage = lazy(() => import("./pages/ProjectJobsPage"));
const LogsPage = lazy(() => import("./pages/LogsPage"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

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
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
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
                  element={isLoggedIn ? <UserManagement /> : <Navigate to="/login" />}
                />
                <Route 
                  path="/settings" 
                  element={isLoggedIn ? <SettingsPage /> : <Navigate to="/login" />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
