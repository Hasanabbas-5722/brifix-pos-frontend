import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;
    theme: "light" | "dark" | "system";
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIStore>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            sidebarCollapsed: false,
            theme: "dark",
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebar: () =>
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            setTheme: (theme) => set({ theme }),
        }),
        { name: "pos-ui" }
    )
);
