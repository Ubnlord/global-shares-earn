begin;

create extension if not exists pgtap with schema extensions;
select plan(5);

select has_trigger('public', 'transaction', 'reject_new_bdx_transaction',
  'transaction ledger blocks new BDX-denominated writes');
select has_trigger('public', 'user_investment', 'reject_new_bdx_investment',
  'investment ledger blocks new BDX-denominated writes');
select has_trigger('public', 'user_profile', 'freeze_legacy_bdx_profile_balances',
  'legacy BDX balance fields are frozen');

select throws_ok(
  $$ insert into public.transaction(currency) values ('BDX') $$,
  '23514',
  'New BDX-denominated accounting is disabled; use USD',
  'a new BDX transaction is rejected'
);

select throws_ok(
  $$ insert into public.user_investment(currency) values ('BDX') $$,
  '23514',
  'New BDX-denominated accounting is disabled; use USD',
  'a new BDX investment is rejected'
);

select * from finish();
rollback;
