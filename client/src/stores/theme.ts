import { create } from "zustand";

type ThemeName = "ink" | "paper" | "night" | "forest";

const themeClassMap: Record<ThemeName, string> = {
  ink: "",
  paper: "theme-paper",
  night: "theme-night",
  forest: "theme-forest",
};

type ThemeState = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem("xilu-theme") as ThemeName) || "ink",
  setTheme: (t) => {
    // 移除旧主题 class
    const root = document.documentElement;
    Object.values(themeClassMap).forEach((cls) => cls && root.classList.remove(cls));
    // 添加新主题 class
    const newClass = themeClassMap[t];
    if (newClass) root.classList.add(newClass);
    localStorage.setItem("xilu-theme", t);
    set({ theme: t });
  },
}));
