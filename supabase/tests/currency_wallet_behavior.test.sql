begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

select has_trigger('public', 'transaction', 'reject_new_bdx_transaction',
  'transaction ledger blocks new non-USD accounting writes');
select has_trigger('public', 'user_investment', 'reject_new_bdx_investment',
  'investment ledger blocks new non-USD accounting writes');
select has_trigger('public', 'user_profile', 'freeze_legacy_bdx_profile_balances',
  'legacy non-USD balance fields are frozen');

select col_default_is('public','transaction','currency','USD',
  'new transactions default to USD');
select col_default_is('public','user_investment','currency','USD',
  'new investments default to USD');

select throws_ok(
  $$ insert into public.transaction(currency) values ('BDX') $$,
  '23514',
  'New BDX-denominated accounting is disabled; use USD',
  'new non-USD transaction write is rejected'
);
select throws_ok(
  $$ insert into public.user_investment(currency) values ('BDX') $$,
  '23514',
  'New BDX-denominated accounting is disabled; use USD',
  'new non-USD investment write is rejected'
);

select ok(
  pg_get_functiondef('public.reject_new_bdx_accounting_writes()'::regprocedure)
    like '%Historical currency cannot be rewritten%',
  'migration explicitly prevents rewriting historical denomination'
);

select * from finish();
rollback;
