alter table public.leads add column if not exists attribution jsonb;
comment on column public.leads.attribution is 'Optional, unverified first-landing attribution. No full URLs, search queries, or contact details. Existing rows remain null.';
