import { create } from 'zustand';
import type { CustomerProfile } from '../types';
import { customerAuthService, type CustomerActivationResult } from '../services/customerAuthService';
import { supabase } from '../lib/supabase';

interface CustomerAuthState {
  customer: CustomerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string, createProfile?: boolean) => Promise<void>;
  activateCustomerAccount: (customerCode: string, phone: string) => Promise<CustomerActivationResult>;
  signOut: () => Promise<void>;
  loadCustomer: () => Promise<void>;
}

export const useCustomerAuthStore = create<CustomerAuthState>((set, get) => ({
  customer: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async (email, password) => {
    await customerAuthService.signIn(email, password);
    await get().loadCustomer();
  },

  signUp: async (email, password, fullName, phone, createProfile = true) => {
    await customerAuthService.signUp(email, password, fullName, phone, createProfile);
    await get().loadCustomer();
  },

  activateCustomerAccount: async (customerCode, phone) => {
    const result = await customerAuthService.activateCustomerAccount(customerCode, phone);
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
