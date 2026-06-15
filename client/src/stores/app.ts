import { create } from "zustand";

type AppState = {
  focusMode: boolean;
  toggleFocusMode: () => void;
  writingGoal: number;
  setWritingGoal: (goal: number) => void;
  currentWordCount: number;
  setCurrentWordCount: (count: number) => void;
};

export const useAppStore = create<AppState>((set) => ({
  focusMode: false,
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  writingGoal: 500,
  setWritingGoal: (goal) => set({ writingGoal: goal }),
  currentWordCount: 0,
  setCurrentWordCount: (count) => set({ currentWordCount: count }),
}));
