import { supabase } from '../lib/supabase';
import type { CustomerProfile } from '../types';

const PENDING_PROFILE_KEY = 'pass_pending_web_profile';

export type CustomerActivationResult = {
  status: 'linked' | 'pending';
  customer?: CustomerProfile;
  request_id?: string;
  customer_id?: string;
};

export const customerAuthService = {
  async ensureCustomerProfile(fullName?: string, phone?: string) {
    const { data, error } = await supabase.rpc('ensure_customer_profile', {
      p_full_name: fullName?.trim() || null,
      p_phone: phone?.trim() || null,
    });
    if (error) throw error;
    return data as CustomerProfile;
  },

  async signUp(email: string, password: string, fullName: string, phone?: string, createProfile = true) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user && createProfile) {
      if (data.session) {
        await this.ensureCustomerProfile(fullName, phone);
      } else {
        window.localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({ fullName, phone: phone || null }));
      }
    }

    return data;
  },

  async activateCustomerAccount(customerCode: string, phone: string): Promise<CustomerActivationResult> {
    const { data, error } = await supabase.rpc('request_customer_account_link', {
      p_customer_code: customerCode,
      p_phone: phone,
    });
    if (error) throw error;
    return data as CustomerActivationResult;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const pending = window.localStorage.getItem(PENDING_PROFILE_KEY);
    if (pending) {
      const profile = JSON.parse(pending) as { fullName?: string; phone?: string };
      await this.ensureCustomerProfile(profile.fullName, profile.phone);
      window.localStorage.removeItem(PENDING_PROFILE_KEY);
    }
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentCustomer(): Promise<CustomerProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return profile;
  },

  async updateProfile(customerId: string, updates: Partial<Pick<CustomerProfile, 'full_name' | 'phone'>>) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerProfile;
  },
};
