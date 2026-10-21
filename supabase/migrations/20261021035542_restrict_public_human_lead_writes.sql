-- Apply only after the RPC-based application deployment is verified.
-- Old clients still call the same server action; no browser writes are needed.
begin;
create index human_lead_receipts_lead_idx on public.human_lead_receipts(lead_id);
drop policy if exists "Allow public inserts" on public.leads;
revoke all on public.leads from public, anon, authenticated;
commit;
