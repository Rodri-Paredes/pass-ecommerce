import { supabase } from '../lib/supabase';
import type { CustomerProfile } from '../types';

const PENDING_PROFILE_KEY = 'pass_pending_web_profile';
const GENERIC_LINK_ERROR = 'No pudimos vincular tu perfil de tienda con estos datos.';

export type CustomerActivationResult = {
  status: 'linked';
  customer?: CustomerProfile;
  request_id?: string;
  customer_id?: string;
};

export const customerAuthService = {
  async linkByCiPhone(ci: string, phone: string): Promise<CustomerProfile> {
    const { data, error } = await supabase.rpc('link_customer_profile_by_ci_phone', {
      p_ci: ci.trim(),
      p_phone: phone.trim(),
    });
    if (error) throw error;
    return data as CustomerProfile;
  },

  async signUp(email: string, password: string, ci: string, phone: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      window.localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({ ci: ci.trim(), phone: phone.trim() }));
      if (data.session && data.user.email_confirmed_at) {
        await this.linkByCiPhone(ci, phone);
        window.localStorage.removeItem(PENDING_PROFILE_KEY);
      }
    }

    return data;
  },

  async activateCustomerAccount(ci: string, phone: string): Promise<CustomerActivationResult> {
    const customer = await this.linkByCiPhone(ci, phone);
    return { status: 'linked', customer };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user.email_confirmed_at) {
      throw new Error('Debes verificar tu email antes de vincular tu perfil de tienda.');
    }
    const pending = window.localStorage.getItem(PENDING_PROFILE_KEY);
    if (pending) {
      const profile = JSON.parse(pending) as { ci?: string; phone?: string };
      if (!profile.ci || !profile.phone) throw new Error(GENERIC_LINK_ERROR);
      await this.linkByCiPhone(profile.ci, profile.phone);
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
