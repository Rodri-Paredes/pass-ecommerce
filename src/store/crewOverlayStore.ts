import { create } from 'zustand';

interface CrewOverlayStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCrewOverlayStore = create<CrewOverlayStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
