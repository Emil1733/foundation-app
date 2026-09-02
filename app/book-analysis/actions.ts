'use server';

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { isIP } from 'node:net';
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
// Use Service Role Key to bypass RLS policies and guarantee write access
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase Credentials');
  throw new Error('Supabase URL and Key must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

    // 2. Insert into Supabase
    const { error } = await supabase
        .from('leads')
        .insert([
            {
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                address: lead.address,
                zip: lead.zip,
                symptoms: lead.symptoms,
                notes: lead.notes,
                status: 'new',
                source: 'web_intake',
                contact_consent: true,
                contact_consent_at: new Date().toISOString(),
                contact_consent_version: CONTACT_CONSENT_VERSION,
                contact_consent_text: CONTACT_CONSENT_TEXT,
                consent_source_path: consentSourcePath,
                submission_user_agent: userAgent,
                submission_ip: submissionIp,
            },
        ])
        .select();

    if (error) {
        console.error('Supabase Insert Error:', error);
        return {
            success: false,
            error: 'We could not record your request. Your information is still on this page; please try again.',
        };
    }

    return { success: true };
}
