'use server';

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { isIP } from 'node:net';
import { leadIntegrityHashes } from '@/lib/leadIntegrity';
import { getCommercialSeoTreatment } from '@/lib/commercialSeoTreatments';
import {
    CONTACT_CONSENT_TEXT,
    CONTACT_CONSENT_VERSION,
} from '@/lib/leadConsent';
import {
    LeadSubmissionResult,
    LeadSubmissionInput,
    validateLeadSubmission,
} from '@/lib/leadValidation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Writes must never silently fall back to a browser/anonymous credential.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function submitLead(
    formData: LeadSubmissionInput,
): Promise<LeadSubmissionResult> {
    const validation = validateLeadSubmission(formData);
    if (!validation.success) {
        return {
            success: false,
            error: 'Review the highlighted fields and try again.',
            fieldErrors: validation.fieldErrors,
        };
    }
    const lead = validation.data;
    if (!supabaseUrl || !supabaseKey) {
        console.error('Human lead storage is not configured');
        return { success: false, error: 'We could not record your request. Your information is still on this page; please try again.' };
    }
    const attributionSlug = lead.attribution?.landingPath.match(/^\/(?:services\/foundation-repair\/|learn\/)([a-z0-9.-]+)$/)?.[1]?.replace(/-soil-analysis$/, '');
    const attribution = lead.attribution ? {
        ...lead.attribution,
        cohort: attributionSlug ? getCommercialSeoTreatment(attributionSlug)?.cohort || 'standard' : 'other',
    } : null;

    const requestHeaders = await headers();
    const forwardedIp = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
    const realIp = requestHeaders.get('x-real-ip')?.trim();
    const submissionIp = [forwardedIp, realIp].find((value) => value && isIP(value)) ?? null;
    const userAgent = requestHeaders.get('user-agent')?.slice(0, 512) || null;

    let consentSourcePath = '/book-analysis';
    const referer = requestHeaders.get('referer');
    if (referer) {
        try {
            consentSourcePath = new URL(referer).pathname.slice(0, 500) || consentSourcePath;
        } catch {
            // Retain the known form path when the Referer header is unavailable or invalid.
        }
    }

    const digests = leadIntegrityHashes(lead, submissionIp, supabaseKey);
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data, error } = await supabase.rpc('record_human_lead', {
            p_payload_hash: digests.payload,
            p_contact_hash: digests.contact,
            p_ip_hash: digests.ip,
            p_lead: {
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                address: lead.address,
                zip: lead.zip,
                symptoms: lead.symptoms,
                notes: lead.notes,
                status: 'new',
                source: lead.source || 'web_intake',
                attribution,
                contact_consent: true,
                contact_consent_at: new Date().toISOString(),
                contact_consent_version: CONTACT_CONSENT_VERSION,
                contact_consent_text: CONTACT_CONSENT_TEXT,
                consent_source_path: consentSourcePath,
                submission_user_agent: userAgent,
                submission_ip: submissionIp,
            },
      }).abortSignal(AbortSignal.timeout(12000));
      if (error) {
        // Log only a code: database error details may contain contact data.
        console.error('Human lead storage failed:', error.code || 'unknown');
      } else if (data === 'created' || data === 'duplicate') {
        return { success: true };
      } else if (data === 'rate_limited') {
        return { success: false, error: 'We have received several requests recently. Please wait an hour before sending another. Your information is still on this page.' };
      }
    } catch {
        console.error('Human lead storage connection failed');
    }
        return {
            success: false,
            error: 'We could not record your request. Your information is still on this page; please try again.',
        };
}
