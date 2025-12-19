import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BranchStore {
  selectedBranch: string | null; // null = General (todas las sucursales)
  setSelectedBranch: (branchId: string | null) => void;
}

export const useBranchStore = create<BranchStore>()(
  persist(
    (set) => ({
      selectedBranch: null, // Por defecto muestra todas las sucursales
      setSelectedBranch: (branchId) => set({ selectedBranch: branchId }),
    }),
    {
      name: 'pass-branch-storage',
    }
  )
);
