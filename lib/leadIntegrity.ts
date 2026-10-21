import { createHmac } from 'node:crypto';
import type { NormalizedLeadSubmission } from './leadValidation';

/** Server-only digests. Never persist raw contact data in a quota key. */
export function leadIntegrityHashes(lead: NormalizedLeadSubmission, ip: string | null, secret: string) {
  const hash = (namespace: string, value: string) => createHmac('sha256', secret).update(`${namespace}:${value}`).digest('hex');
  const content = JSON.stringify({
    name: lead.name.toLowerCase(), email: lead.email, phone: lead.phone,
    address: lead.address.toLowerCase(), zip: lead.zip,
    symptoms: [...lead.symptoms].sort(), notes: lead.notes,
  });
  return {
    payload: hash('human-lead-payload-v1', content),
    contact: hash('human-lead-contact-v1', lead.phone),
    ip: ip ? hash('human-lead-ip-v1', ip) : null,
  };
}
