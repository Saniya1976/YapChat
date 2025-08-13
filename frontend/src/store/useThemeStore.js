import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("yapchat-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("yapchat-theme", theme);
    set({ theme });
  },
}));