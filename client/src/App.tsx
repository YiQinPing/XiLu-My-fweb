import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
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
import { Login } from "@/pages/Login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const setTheme = useThemeStore((s) => s.setTheme);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    setTheme(theme);
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
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
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeInitializer>
    </QueryClientProvider>
  );
}
