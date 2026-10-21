begin;

-- USD-only accounting cutover guard.
-- Historical BDX rows and balances are intentionally preserved as legacy records.
-- This migration does not convert, zero, merge, or reinterpret customer funds.
-- A future conversion requires an approved rate, immutable reconciliation ledger,
-- customer-level before/after checks, and independent accounting/security review.

create or replace function public.reject_new_bdx_accounting_writes()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $function$
begin
  if tg_table_name = 'user_profile' then
    if new.bdx_balance is distinct from old.bdx_balance
       or new.locked_bdx_balance is distinct from old.locked_bdx_balance then
      raise exception 'BDX balances are frozen as historical records; new accounting must use USD'
        using errcode = '23514';
    end if;
    return new;
  end if;

  if upper(coalesce(new.currency, 'USD')) = 'BDX'
     and (tg_op = 'INSERT' or upper(coalesce(old.currency, 'USD')) <> 'BDX') then
    raise exception 'New BDX-denominated accounting is disabled; use USD'
      using errcode = '23514';
  end if;

  -- Existing historical BDX rows may have non-currency metadata updated,
  -- but their currency cannot be silently rewritten as USD.
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

drop trigger if exists freeze_legacy_bdx_profile_balances on public.user_profile;
create trigger freeze_legacy_bdx_profile_balances
before update of bdx_balance, locked_bdx_balance on public.user_profile
for each row execute function public.reject_new_bdx_accounting_writes();

revoke all on function public.reject_new_bdx_accounting_writes() from public, anon, authenticated;

commit;
