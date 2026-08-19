import { supabase } from '../lib/supabase';
import type { CrewBenefit, CrewMembership, CrewMembershipRequest, CrewPlan, CrewSettings } from '../types';

export const passCrewService = {
  async getActivePlan(): Promise<CrewPlan | null> {
    const { data, error } = await supabase
      .from('crew_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getCrewBenefits(planId?: string | null): Promise<CrewBenefit[]> {
    let query = supabase
      .from('crew_benefits')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (planId) {
      query = query.or(`plan_id.is.null,plan_id.eq.${planId}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getCrewSettings(): Promise<CrewSettings | null> {
    const { data, error } = await supabase
      .from('crew_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getMyMembership(customerId: string): Promise<CrewMembership | null> {
    const { data, error } = await supabase
      .from('crew_memberships')
      .select('*, plan:crew_plans(*)')
      .eq('customer_id', customerId)
      .in('status', ['active', 'suspended'])
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getMyRequests(customerId: string): Promise<CrewMembershipRequest[]> {
    const { data, error } = await supabase
      .from('crew_membership_requests')
      .select('*, plan:crew_plans(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMyActiveRequest(customerId: string): Promise<CrewMembershipRequest | null> {
    const { data, error } = await supabase
      .from('crew_membership_requests')
      .select('*, plan:crew_plans(*)')
      .eq('customer_id', customerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createMembershipRequest(customerId: string, planId: string, amount: number): Promise<CrewMembershipRequest> {
    const { data, error } = await supabase
      .from('crew_membership_requests')
      .insert({
        customer_id: customerId,
        plan_id: planId,
        amount,
      })
      .select('*, plan:crew_plans(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async uploadReceipt(customerId: string, requestId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${customerId}/${requestId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('crew-receipts')
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from('crew_membership_requests')
      .update({ receipt_url: path })
      .eq('id', requestId);

    if (updateError) throw updateError;

    return path;
  },

  async getReceiptSignedUrl(path: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from('crew-receipts')
      .createSignedUrl(path, 60 * 60);

    if (error) throw error;
    return data?.signedUrl || null;
  },
};
