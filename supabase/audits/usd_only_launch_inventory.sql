-- Read-only USD-only launch inventory for Global Shares Earn.
-- Run against the intended Supabase project using a read-only database role.
-- This file contains SELECT statements only. It does not modify balances, ledgers,
-- migrations, or transaction history. Review the aggregate results before any
-- decision to retire legacy BDX columns or migration code.

-- 1) Aggregate profile balances. A zero here is necessary but not sufficient:
--    investments and pending ledger entries must also be checked below.
select
  count(*) as profile_count,
  coalesce(sum(available_balance), 0) as available_usd_total,
  coalesce(sum(locked_balance), 0) as locked_usd_total,
  coalesce(sum(bdx_balance), 0) as legacy_bdx_total,
  coalesce(sum(locked_bdx_balance), 0) as legacy_locked_bdx_total,
  coalesce(sum(referral_earnings), 0) as referral_earnings_total
from public.user_profile;

-- 2) Investment inventory by denomination and lifecycle status.
select
  coalesce(currency, 'USD') as currency,
  status,
  count(*) as investment_count,
  coalesce(sum(principal), 0) as principal_total,
  coalesce(sum(credited_profit), 0) as credited_profit_total
from public.user_investment
group by coalesce(currency, 'USD'), status
order by currency, status;

-- 3) Transaction ledger inventory by denomination, type, and status.
select
  coalesce(currency, 'USD') as currency,
  type,
  status,
  coalesce(approval_status, 'unknown') as approval_status,
  count(*) as transaction_count,
  coalesce(sum(amount), 0) as amount_total
from public.transaction
group by coalesce(currency, 'USD'), type, status, coalesce(approval_status, 'unknown')
order by currency, type, status, approval_status;

-- 4) Outstanding requests requiring review, settlement, or explicit cancellation.
select
  coalesce(currency, 'USD') as currency,
  type,
  status,
  coalesce(approval_status, 'unknown') as approval_status,
  count(*) as outstanding_count,
  coalesce(sum(amount), 0) as outstanding_amount
from public.transaction
where lower(coalesce(status, '')) in ('pending', 'processing', 'awaiting')
   or lower(coalesce(approval_status, '')) in ('pending', 'awaiting', 'under_review')
group by coalesce(currency, 'USD'), type, status, coalesce(approval_status, 'unknown')
order by currency, type, status, approval_status;

-- Launch gate:
-- Do not remove legacy columns or historical migrations merely because the
-- profile balance totals are zero. Require zero legacy BDX balances, zero active
-- BDX investments, and an explicit disposition for every pending BDX transaction.
-- If all totals are zero, retain this output as the launch audit evidence.
