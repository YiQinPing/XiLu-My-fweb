import { create } from "zustand";

interface ProjectState {
  selectedProjectId: string | null;
  setSelectedProject: (id: string) => void;
  clearSelectedProject: () => void;
}

// 从 localStorage 恢复上次选择的项目
const stored = typeof window !== "undefined" ? localStorage.getItem("selectedProjectId") : null;

export const useProjectStore = create<ProjectState>((set) => ({
  selectedProjectId: stored || null,
  setSelectedProject: (id: string) => {
    localStorage.setItem("selectedProjectId", id);
    set({ selectedProjectId: id });
  },
  clearSelectedProject: () => {
    localStorage.removeItem("selectedProjectId");
    set({ selectedProjectId: null });
  },
}));
