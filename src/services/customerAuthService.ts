import { supabase } from '../lib/supabase';
import type { CustomerProfile } from '../types';

export const customerAuthService = {
  async signUp(email: string, password: string, fullName: string, phone?: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('customer_profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          email,
          phone: phone || null,
        });

      if (profileError) throw profileError;
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
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
      .eq('id', user.id)
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
