import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { ProjectDetail } from "@/pages/ProjectDetail";
import { Write } from "@/pages/Write";
import { Outline } from "@/pages/Outline";
import { World } from "@/pages/World";
import { Characters } from "@/pages/Characters";
import { Relationships } from "@/pages/Relationships";
import { Foreshadowing } from "@/pages/Foreshadowing";
import { Timeline } from "@/pages/Timeline";
import { Inspiration } from "@/pages/Inspiration";
import { Stats } from "@/pages/Stats";
import { Search } from "@/pages/Search";
import { AiAssistant } from "@/pages/AiAssistant";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetPassword } from "@/pages/ResetPassword";
import { ConfirmEmailChange } from "@/pages/ConfirmEmailChange";
import { AccountSettings } from "@/pages/AccountSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AppInitializer({ children }: { children: React.ReactNode }) {
  const setTheme = useThemeStore((s) => s.setTheme);
  const theme = useThemeStore((s) => s.theme);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    setTheme(theme);
    checkAuth();
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirm-email" element={<ConfirmEmailChange />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="project/:id" element={<ProjectDetail />} />
              <Route path="write" element={<Write />} />
              <Route path="outline" element={<Outline />} />
              <Route path="world" element={<World />} />
              <Route path="characters" element={<Characters />} />
              <Route path="relationships" element={<Relationships />} />
              <Route path="foreshadowing" element={<Foreshadowing />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="inspiration" element={<Inspiration />} />
              <Route path="stats" element={<Stats />} />
              <Route path="search" element={<Search />} />
              <Route path="ai" element={<AiAssistant />} />
              <Route path="account" element={<AccountSettings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppInitializer>
    </QueryClientProvider>
  );
}
