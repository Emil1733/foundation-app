'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use Service Role Key to bypass RLS policies and guarantee write access
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase Credentials');
  throw new Error('Supabase URL and Key must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function submitLead(formData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    zip: string;
    symptoms: string[];
}) {
    // 1. Validate Data (Basic)
    if (!formData.email || !formData.phone || !formData.address) {
        return { success: false, error: 'Missing required fields' };
    }

    // 2. Insert into Supabase
    const { data, error } = await supabase
        .from('leads')
        .insert([
            {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                zip: formData.zip,
                symptoms: formData.symptoms, // Stored as JSONB or Array depending on schema
                status: 'new',
                source: 'web_intake',
            },
        ])
        .select();

    if (error) {
        console.error('Supabase Insert Error:', error);
        return { success: false, error: 'Failed to record lead. Please try again.' };
    }

    return { success: true };
}
