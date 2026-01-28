import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      open: false,
      setOpen: (v: boolean) => set({ open: v }),
      toggle: () => set((s) => ({ open: !s.open })),
    }),
    {
      name: "sidebar-storage",
    },
  ),
);

export default useSidebarStore;
