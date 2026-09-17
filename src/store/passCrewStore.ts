import { create } from 'zustand';
import { passCrewService } from '../services/passCrewService';
import type { CrewBenefit, CrewMembership, CrewMembershipRequest, CrewPlan, CrewSettings } from '../types';

interface State {
  plans: CrewPlan[]; selectedPlan: CrewPlan | null; benefits: CrewBenefit[]; settings: CrewSettings | null;
  membership: CrewMembership | null; scheduledMembership: CrewMembership | null; activeRequest: CrewMembershipRequest | null;
  requests: CrewMembershipRequest[]; isLoading: boolean; error: string | null;
  loadLandingData: () => Promise<void>; selectPlan: (plan: CrewPlan) => Promise<void>; loadSettings: () => Promise<void>;
  loadMyStatus: (customerId: string) => Promise<void>; submitRequest: (planId: string) => Promise<CrewMembershipRequest>;
  uploadReceiptForRequest: (requestId: string, file: File) => Promise<void>;
}

export const usePassCrewStore = create<State>((set, get) => ({
  plans: [], selectedPlan: null, benefits: [], settings: null, membership: null, scheduledMembership: null, activeRequest: null, requests: [], isLoading: false, error: null,
  loadLandingData: async () => { set({ isLoading: true, error: null }); try { const plans = await passCrewService.getActivePlans(); const selectedPlan = get().selectedPlan && plans.some(p => p.id === get().selectedPlan?.id) ? get().selectedPlan : plans[0] || null; const benefits = await passCrewService.getCrewBenefits(selectedPlan?.id); set({ plans, selectedPlan, benefits, isLoading: false }); } catch (e) { set({ error: e instanceof Error ? e.message : 'No se pudo cargar PASS Crew', isLoading: false }); } },
  selectPlan: async (selectedPlan) => { set({ selectedPlan, isLoading: true }); try { set({ benefits: await passCrewService.getCrewBenefits(selectedPlan.id), isLoading: false }); } catch (e) { set({ error: e instanceof Error ? e.message : 'No se pudieron cargar los beneficios', isLoading: false }); } },
  loadSettings: async () => { try { set({ settings: await passCrewService.getCrewSettings() }); } catch (e) { set({ error: e instanceof Error ? e.message : 'No se pudo cargar el pago' }); } },
  loadMyStatus: async (customerId) => { set({ isLoading: true, error: null }); try { const [memberships, requests] = await Promise.all([passCrewService.getMyMemberships(customerId), passCrewService.getMyRequests(customerId)]); const now = Date.now(); set({ membership: memberships.find(m => m.status === 'active' && new Date(m.expires_at).getTime() > now) || null, scheduledMembership: memberships.find(m => m.status === 'scheduled') || null, activeRequest: requests.find(r => r.status === 'draft' || r.status === 'pending') || null, requests, isLoading: false }); } catch (e) { set({ error: e instanceof Error ? e.message : 'No se pudo cargar tu estado', isLoading: false }); } },
  submitRequest: async (planId) => { const request = await passCrewService.createMembershipRequest(planId); set(s => ({ activeRequest: request, requests: [request, ...s.requests] })); return request; },
  uploadReceiptForRequest: async (requestId, file) => { const request = await passCrewService.uploadAndSubmitReceipt(requestId, file); set(s => ({ activeRequest: request, requests: s.requests.map(row => row.id === requestId ? request : row) })); },
}));
