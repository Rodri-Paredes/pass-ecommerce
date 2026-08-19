import { create } from 'zustand';
import type { CustomerProfile } from '../types';
import { customerAuthService } from '../services/customerAuthService';
import { supabase } from '../lib/supabase';

interface CustomerAuthState {
  customer: CustomerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
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

  signUp: async (email, password, fullName, phone) => {
    await customerAuthService.signUp(email, password, fullName, phone);
    await get().loadCustomer();
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
