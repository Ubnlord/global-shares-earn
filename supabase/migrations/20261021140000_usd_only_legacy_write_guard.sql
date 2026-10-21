begin;

-- USD-only accounting cutover guard.
-- Historical BDX rows and balance columns are intentionally preserved. This
-- migration does not convert, zero, merge, or reinterpret customer funds.
-- Pending historical transactions remain eligible for normal review/settlement.
-- New BDX transactions/investments and denomination rewrites are blocked.
-- Conversion requires an approved rate, immutable reconciliation, and independent review.

create or replace function public.reject_new_bdx_accounting_writes()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $function$
begin
  if upper(coalesce(new.currency, 'USD')) = 'BDX'
     and (tg_op = 'INSERT' or upper(coalesce(old.currency, 'USD')) <> 'BDX') then
    raise exception 'New BDX-denominated accounting is disabled; use USD'
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE'
     and upper(coalesce(old.currency, 'USD')) = 'BDX'
     and upper(coalesce(new.currency, 'USD')) <> 'BDX' then
    raise exception 'Historical currency cannot be rewritten; use a reconciled conversion migration'
      using errcode = '23514';
  end if;

  return new;
end;
$function$;

drop trigger if exists reject_new_bdx_transaction on public.transaction;
create trigger reject_new_bdx_transaction
before insert or update of currency on public.transaction
for each row execute function public.reject_new_bdx_accounting_writes();

drop trigger if exists reject_new_bdx_investment on public.user_investment;
create trigger reject_new_bdx_investment
before insert or update of currency on public.user_investment
for each row execute function public.reject_new_bdx_accounting_writes();

revoke all on function public.reject_new_bdx_accounting_writes() from public, anon, authenticated;

commit;
