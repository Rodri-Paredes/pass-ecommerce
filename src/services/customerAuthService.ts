import { supabase } from '../lib/supabase';
import type { CustomerProfile } from '../types';

const PENDING_PROFILE_KEY = 'pass_pending_web_profile';

type PendingProfile = {
  fullName: string;
  phone: string;
  ci: string;
};

const normalizeSiteUrl = (url: string) => url.trim().replace(/\/+$/, '');

const getEmailRedirectTo = () => {
  const configuredSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined;
  const browserOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${normalizeSiteUrl(configuredSiteUrl || browserOrigin)}/login`;
};

const savePendingProfile = (profile: PendingProfile) => {
  window.localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(profile));
};

const getPendingProfile = (): PendingProfile | null => {
  const value = window.localStorage.getItem(PENDING_PROFILE_KEY);
  if (!value) return null;

  try {
    const profile = JSON.parse(value) as Partial<PendingProfile>;
    return profile.fullName && profile.phone
      ? { fullName: profile.fullName, phone: profile.phone, ci: profile.ci || '' }
      : null;
  } catch {
    return null;
  }
};

export const customerAuthService = {
  async createOwnProfile(fullName: string, phone: string, ci = ''): Promise<CustomerProfile> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('Inicia sesión para completar tu perfil.');

    const { data: existing, error: existingError } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return existing as CustomerProfile;

    const { data, error } = await supabase
      .from('customer_profiles')
      .insert({
        auth_user_id: user.id,
        full_name: fullName.trim(),
        email: user.email || '',
        phone: phone.trim(),
        ci: ci.trim() || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as CustomerProfile;
  },

  async signUp(email: string, password: string, fullName: string, phone: string, ci = '') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
        data: { full_name: fullName.trim(), phone: phone.trim(), ci: ci.trim() },
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error('No se pudo crear la cuenta.');

    const pendingProfile = { fullName: fullName.trim(), phone: phone.trim(), ci: ci.trim() };
    if (data.session) {
      await this.createOwnProfile(pendingProfile.fullName, pendingProfile.phone, pendingProfile.ci);
      window.localStorage.removeItem(PENDING_PROFILE_KEY);
      return { requiresEmailConfirmation: false };
    }

    savePendingProfile(pendingProfile);
    return { requiresEmailConfirmation: true };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const pendingProfile = getPendingProfile();
    if (pendingProfile) {
      await this.createOwnProfile(pendingProfile.fullName, pendingProfile.phone, pendingProfile.ci);
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
    return profile as CustomerProfile | null;
  },

  async updateProfile(customerId: string, updates: Partial<Pick<CustomerProfile, 'full_name' | 'phone' | 'ci'>>) {
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
