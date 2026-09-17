import { supabase } from '../lib/supabase';
import type { CrewBenefit, CrewMembership, CrewMembershipRequest, CrewPlan, CrewPlanBenefit, CrewSettings } from '../types';

const fail = (error: { message: string } | null) => { if (error) throw error; };

export const passCrewService = {
  async getActivePlans(): Promise<CrewPlan[]> { const { data, error } = await supabase.from('crew_plans').select('*').eq('is_active', true).order('sort_order'); fail(error); return (data || []) as CrewPlan[]; },
  async getCrewBenefits(planId?: string | null): Promise<CrewBenefit[]> {
    let query = supabase.from('crew_plan_benefits').select('*, benefit:crew_benefit_definitions(*)').eq('is_active', true).order('priority', { ascending: false });
    if (planId) query = query.eq('plan_id', planId);
    const { data, error } = await query; fail(error);
    return ((data || []) as CrewPlanBenefit[]).map(row => row.benefit).filter((item): item is CrewBenefit => Boolean(item?.is_active && item.is_public));
  },
  async getCrewSettings(): Promise<CrewSettings | null> {
    const { data, error } = await supabase.from('crew_settings').select('*').eq('id', 1).maybeSingle(); fail(error); if (!data) return null;
    let payment_qr_url: string | null = null;
    if (data.payment_qr_path) { const signed = await supabase.storage.from('crew-assets').createSignedUrl(data.payment_qr_path, 900); if (!signed.error) payment_qr_url = signed.data?.signedUrl || null; }
    return { ...data, payment_qr_url } as CrewSettings;
  },
  async getMyMemberships(customerId: string): Promise<CrewMembership[]> { const { data, error } = await supabase.from('crew_memberships').select('*').eq('customer_id', customerId).order('started_at', { ascending: false }); fail(error); return (data || []) as CrewMembership[]; },
  async getMyRequests(customerId: string): Promise<CrewMembershipRequest[]> { const { data, error } = await supabase.from('crew_membership_requests').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }); fail(error); return (data || []) as CrewMembershipRequest[]; },
  async createMembershipRequest(planId: string): Promise<CrewMembershipRequest> { const { data, error } = await supabase.rpc('create_crew_membership_request', { p_plan_id: planId }); fail(error); return data as CrewMembershipRequest; },
  async uploadAndSubmitReceipt(requestId: string, file: File): Promise<CrewMembershipRequest> {
    const { data: auth } = await supabase.auth.getUser(); if (!auth.user) throw new Error('Debes iniciar sesión');
    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${auth.user.id}/${requestId}/receipt-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('crew-receipts').upload(path, file, { upsert: false }); fail(uploadError);
    const { data, error } = await supabase.rpc('submit_crew_receipt', { p_request_id: requestId, p_receipt_path: path }); fail(error); return data as CrewMembershipRequest;
  },
};
