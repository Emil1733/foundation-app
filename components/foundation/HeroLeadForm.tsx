'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { submitLead } from '@/app/book-analysis/actions';
import { CONTACT_CONSENT_TEXT } from '@/lib/leadConsent';
import type { LeadSubmissionInput } from '@/lib/leadValidation';

const concerns = [
  { value: 'cracks_wall', label: 'Wall cracks' },
  { value: 'stair-step', label: 'Brick / stair-step cracks' },
  { value: 'doors', label: 'Sticking doors or windows' },
  { value: 'gaps_trim', label: 'Gaps around trim or walls' },
  { value: 'horizontal', label: 'Horizontal wall cracks' },
  { value: 'hairline', label: 'Hairline cracks' },
  { value: 'pre_purchase', label: 'Buying or selling a home' },
];

export default function HeroLeadForm({ city, source = 'hero_form' }: { city: string; source?: 'hero_form' | 'homepage_hero' }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    zip: '',
    concern: '',
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.concern) {
      setError('Select the main foundation concern.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload: LeadSubmissionInput = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      zip: form.zip,
      symptoms: [form.concern],
      notes: '',
      tcpaConsent: form.consent,
      source,
    };

    try {
      const result = await submitLead(payload);
      if (result.success) {
        setSuccess(true);
      } else {
        const firstFieldError = result.fieldErrors ? Object.values(result.fieldErrors)[0] : null;
        setError(firstFieldError || result.error);
      }
    } catch {
      setError('We could not send your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/90 p-7 text-white shadow-2xl backdrop-blur-md">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-300" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">Request received</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">We received your foundation evaluation request for {form.address}. Your contact details will be used to follow up about the property and next steps.</p>
      </div>
    );
  }

  const inputClass = 'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15';

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/15 bg-white p-5 text-slate-900 shadow-[0_28px_80px_rgba(2,6,23,0.42)] sm:p-6">
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Property Evaluation</p>
        <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">Get a Foundation Evaluation</h2>
        <p className="mt-1.5 text-sm leading-5 text-slate-500">Tell us about the property. We&apos;ll use these details to review the request and follow up about next steps.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="hero-name" className="mb-1 block text-xs font-semibold text-slate-700">Name</label>
          <input id="hero-name" required autoComplete="name" maxLength={100} className={inputClass} placeholder="Your name" value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div>
          <label htmlFor="hero-phone" className="mb-1 block text-xs font-semibold text-slate-700">Phone</label>
          <input id="hero-phone" required type="tel" inputMode="tel" autoComplete="tel" maxLength={30} className={inputClass} placeholder="(555) 555-5555" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="hero-email" className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
          <input id="hero-email" required type="email" autoComplete="email" maxLength={254} className={inputClass} placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="hero-address" className="mb-1 block text-xs font-semibold text-slate-700">Property address</label>
          <input id="hero-address" required autoComplete="street-address" maxLength={200} className={inputClass} placeholder={`Property address in ${city}`} value={form.address} onChange={(e) => update('address', e.target.value)} />
        </div>
        <div>
          <label htmlFor="hero-zip" className="mb-1 block text-xs font-semibold text-slate-700">ZIP code</label>
          <input id="hero-zip" required inputMode="numeric" autoComplete="postal-code" maxLength={10} className={inputClass} placeholder="ZIP code" value={form.zip} onChange={(e) => update('zip', e.target.value)} />
        </div>
        <div>
          <label htmlFor="hero-concern" className="mb-1 block text-xs font-semibold text-slate-700">Main concern</label>
          <select id="hero-concern" required className={inputClass} value={form.concern} onChange={(e) => update('concern', e.target.value)}>
            <option value="">Select one</option>
            {concerns.map((concern) => <option key={concern.value} value={concern.value}>{concern.label}</option>)}
          </select>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg bg-slate-50 p-3">
        <input type="checkbox" required checked={form.consent} onChange={(e) => update('consent', e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
        <span className="text-[10px] leading-4 text-slate-500"><strong className="text-slate-600">Contact consent:</strong> {CONTACT_CONSENT_TEXT}</span>
      </label>

      {error && <p role="alert" className="mt-3 text-xs font-semibold text-red-700">{error}</p>}

      <button type="submit" disabled={submitting || !form.consent} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        {submitting ? 'Sending request...' : <>Request Evaluation <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> No obligation to purchase a repair.</p>
    </form>
  );
}
