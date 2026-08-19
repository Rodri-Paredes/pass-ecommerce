import { create } from 'zustand';
import { passCrewService } from '../services/passCrewService';
import type { CrewBenefit, CrewMembership, CrewMembershipRequest, CrewPlan, CrewSettings } from '../types';

interface PassCrewStore {
  plan: CrewPlan | null;
  benefits: CrewBenefit[];
  settings: CrewSettings | null;
  membership: CrewMembership | null;
  activeRequest: CrewMembershipRequest | null;
  requests: CrewMembershipRequest[];
  isLoading: boolean;
  error: string | null;

  loadLandingData: () => Promise<void>;
  loadSettings: () => Promise<void>;
  loadMyStatus: (customerId: string) => Promise<void>;
  submitRequest: (customerId: string) => Promise<CrewMembershipRequest>;
  uploadReceiptForRequest: (customerId: string, requestId: string, file: File) => Promise<void>;
}

export const usePassCrewStore = create<PassCrewStore>((set, get) => ({
  plan: null,
  benefits: [],
  settings: null,
  membership: null,
  activeRequest: null,
  requests: [],
  isLoading: false,
  error: null,

  loadLandingData: async () => {
    try {
      set({ isLoading: true, error: null });

      const plan = await passCrewService.getActivePlan();
      const benefits = await passCrewService.getCrewBenefits(plan?.id ?? null);

      set({ plan, benefits, isLoading: false });
    } catch (error) {
      console.error('Error cargando datos de PASS CREW:', error);
      set({
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false,
      });
    }
  },

  loadSettings: async () => {
    try {
      const settings = await passCrewService.getCrewSettings();
      set({ settings });
    } catch (error) {
      console.error('Error cargando configuración de PASS CREW:', error);
      set({ error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  },

  loadMyStatus: async (customerId: string) => {
    try {
      set({ isLoading: true, error: null });

      const [membership, requests] = await Promise.all([
        passCrewService.getMyMembership(customerId),
        passCrewService.getMyRequests(customerId),
      ]);

      const activeRequest = requests.find((r) => r.status === 'pending') ?? null;

      set({ membership, requests, activeRequest, isLoading: false });
    } catch (error) {
      console.error('Error cargando estado de PASS CREW:', error);
      set({
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false,
      });
    }
  },

  submitRequest: async (customerId: string) => {
    let plan = get().plan;
    if (!plan) {
      plan = await passCrewService.getActivePlan();
      set({ plan });
    }
    if (!plan) {
      throw new Error('No hay un plan PASS CREW disponible');
    }

    const request = await passCrewService.createMembershipRequest(customerId, plan.id, plan.price);
    set({ activeRequest: request, requests: [request, ...get().requests] });
    return request;
  },

  uploadReceiptForRequest: async (customerId: string, requestId: string, file: File) => {
    const path = await passCrewService.uploadReceipt(customerId, requestId, file);

    set((state) => ({
      activeRequest: state.activeRequest && state.activeRequest.id === requestId
        ? { ...state.activeRequest, receipt_url: path }
        : state.activeRequest,
      requests: state.requests.map((r) => (r.id === requestId ? { ...r, receipt_url: path } : r)),
    }));
  },
}));
