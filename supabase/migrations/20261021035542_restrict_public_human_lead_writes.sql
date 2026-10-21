-- Apply only after the RPC-based application deployment is verified.
-- Old clients still call the same server action; no browser writes are needed.
begin;
drop policy if exists "Allow public inserts" on public.leads;
revoke all on public.leads from public, anon, authenticated;
commit;
