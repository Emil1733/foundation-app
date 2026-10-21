-- Additive rollout: do not revoke the old write path until the application
-- has deployed and its service-only RPC has been verified.
create table public.human_lead_receipts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  contact_hash text not null check (contact_hash ~ '^[a-f0-9]{64}$'),
  ip_hash text check (ip_hash is null or ip_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default clock_timestamp()
);
alter table public.human_lead_receipts enable row level security;
revoke all on public.human_lead_receipts from public, anon, authenticated;
grant select, insert, delete on public.human_lead_receipts to service_role;
create index human_lead_receipts_payload_idx on public.human_lead_receipts(payload_hash, created_at desc);
create index human_lead_receipts_contact_idx on public.human_lead_receipts(contact_hash, created_at desc);
create index human_lead_receipts_ip_idx on public.human_lead_receipts(ip_hash, created_at desc) where ip_hash is not null;

create function public.record_human_lead(
  p_payload_hash text, p_contact_hash text, p_ip_hash text, p_lead jsonb
) returns text
language plpgsql security invoker
set search_path = ''
set lock_timeout = '3s'
as $$
declare
  v_lead_id uuid;
  v_now timestamptz;
begin
  if p_payload_hash is null or p_payload_hash !~ '^[a-f0-9]{64}$'
    or p_contact_hash is null or p_contact_hash !~ '^[a-f0-9]{64}$'
    or (p_ip_hash is not null and p_ip_hash !~ '^[a-f0-9]{64}$')
    or jsonb_typeof(p_lead) is distinct from 'object'
    or (p_lead->>'contact_consent') is distinct from 'true' then
    raise exception 'Invalid submission envelope' using errcode = '22023';
  end if;

  -- Every caller takes contact then IP locks in that order. These transaction
  -- locks serialize duplicate detection and quota checks across all instances.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('human-lead:contact:' || p_contact_hash, 0));
  if p_ip_hash is not null then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('human-lead:ip:' || p_ip_hash, 0));
  end if;
  v_now := clock_timestamp();

  if exists(select 1 from public.human_lead_receipts
    where payload_hash = p_payload_hash and created_at > v_now - interval '10 minutes') then
    return 'duplicate';
  end if;
  if (select count(*) from public.human_lead_receipts
      where contact_hash = p_contact_hash and created_at > v_now - interval '1 hour') >= 5 then
    return 'rate_limited';
  end if;
  if p_ip_hash is not null and (select count(*) from public.human_lead_receipts
      where ip_hash = p_ip_hash and created_at > v_now - interval '1 hour') >= 30 then
    return 'rate_limited';
  end if;

  insert into public.leads(
    name,email,phone,address,zip,symptoms,notes,status,source,attribution,
    contact_consent,contact_consent_at,contact_consent_version,contact_consent_text,
    consent_source_path,submission_user_agent,submission_ip
  ) values (
    p_lead->>'name',p_lead->>'email',p_lead->>'phone',p_lead->>'address',p_lead->>'zip',
    p_lead->'symptoms',p_lead->>'notes','new',p_lead->>'source',nullif(p_lead->'attribution','null'::jsonb),
    true,v_now,p_lead->>'contact_consent_version',p_lead->>'contact_consent_text',
    p_lead->>'consent_source_path',p_lead->>'submission_user_agent',nullif(p_lead->>'submission_ip','')::inet
  ) returning id into v_lead_id;
  insert into public.human_lead_receipts(lead_id,payload_hash,contact_hash,ip_hash,created_at)
  values(v_lead_id,p_payload_hash,p_contact_hash,p_ip_hash,v_now);
  return 'created';
end;
$$;
revoke all on function public.record_human_lead(text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.record_human_lead(text,text,text,jsonb) to service_role;
comment on table public.human_lead_receipts is 'Server-only HMAC digests for 10-minute duplicate detection and rolling accepted-submission quotas. Deleted with the associated lead. No extra raw contact data.';
