import { create } from 'zustand';
import type { CustomerProfile } from '../types';
import { customerAuthService, type CustomerActivationResult } from '../services/customerAuthService';
import { supabase } from '../lib/supabase';

interface CustomerAuthState {
  customer: CustomerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  signIn: (email: string, password: string) => Promise<'linked' | 'needs_link'>;
  signUp: (email: string, password: string, ci: string, phone: string) => Promise<void>;
  activateCustomerAccount: (ci: string, phone: string) => Promise<CustomerActivationResult>;
  signOut: () => Promise<void>;
  loadCustomer: () => Promise<void>;
}

export const useCustomerAuthStore = create<CustomerAuthState>((set, get) => ({
  customer: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async (email, password) => {
    await customerAuthService.signIn(email, password);
    const customer = await customerAuthService.getCurrentCustomer();
    set({ customer, isAuthenticated: !!customer, isLoading: false });
    return customer ? 'linked' : 'needs_link';
  },

  signUp: async (email, password, ci, phone) => {
    await customerAuthService.signUp(email, password, ci, phone);
    await get().loadCustomer();
  },

  activateCustomerAccount: async (ci, phone) => {
    const result = await customerAuthService.activateCustomerAccount(ci, phone);
    if (result.status === 'linked' && result.customer) set({ customer: result.customer, isAuthenticated: true, isLoading: false });
    return result;
  },

  signOut: async () => {
    await customerAuthService.signOut();
    set({ customer: null, isAuthenticated: false, isLoading: false });
  },

  loadCustomer: async () => {
    try {
      const customer = await customerAuthService.getCurrentCustomer();
      set({ customer, isAuthenticated: !!customer, isLoading: false });
    } catch {
      set({ customer: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    useCustomerAuthStore.setState({ customer: null, isAuthenticated: false, isLoading: false });
  }
});
