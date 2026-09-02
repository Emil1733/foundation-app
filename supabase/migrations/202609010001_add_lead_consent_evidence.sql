begin;

alter table public.leads
  add column if not exists contact_consent boolean,
  add column if not exists contact_consent_at timestamp with time zone,
  add column if not exists contact_consent_version text,
  add column if not exists contact_consent_text text,
  add column if not exists consent_source_path text,
  add column if not exists submission_user_agent text,
  add column if not exists submission_ip inet;

comment on column public.leads.contact_consent is
  'Explicit contact consent supplied with the lead. NULL indicates a legacy lead with no recorded value.';
comment on column public.leads.contact_consent_at is
  'UTC timestamp recorded when the server accepted explicit contact consent.';
comment on column public.leads.contact_consent_version is
  'Immutable application version identifying the disclosure presented at submission.';
comment on column public.leads.contact_consent_text is
  'Exact contact-consent disclosure associated with the submission.';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_contact_consent_evidence_check'
      and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads
      add constraint leads_contact_consent_evidence_check
      check (
        contact_consent is null
        or contact_consent = false
        or (
          contact_consent = true
          and contact_consent_at is not null
          and nullif(btrim(contact_consent_version), '') is not null
          and nullif(btrim(contact_consent_text), '') is not null
        )
      );
  end if;
end
$$;

commit;
