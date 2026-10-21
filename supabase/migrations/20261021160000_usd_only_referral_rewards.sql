begin;

-- USD-only referral rewards: historical BDX deposits remain intact, but must
-- not create new BDX referral credits when an admin settles an old transaction.
create or replace function public.credit_referral_for_deposit(p_transaction_id uuid)
returns numeric
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'pg_temp'
as $function$
declare
  v_tx public.transaction;
  v_ref uuid;
  v_cut numeric;
begin
  select * into v_tx from public.transaction where id=p_transaction_id for update;
  if not found then raise exception 'Transaction not found'; end if;
  if v_tx.type <> 'deposit' or v_tx.status <> 'completed' then return 0; end if;

  -- No new BDX-denominated referral accounting. Do not rewrite the source row.
  if upper(coalesce(v_tx.currency, 'USD')) <> 'USD' then return 0; end if;

  select referred_by_user_id into v_ref
    from public.user_profile where user_id=v_tx.user_id;
  if v_ref is null or v_ref=v_tx.user_id then return 0; end if;
  if exists (
    select 1 from public.transaction
    where type='referral' and method='Referral deposit '||v_tx.id::text
  ) then return 0; end if;

  v_cut := round(v_tx.amount*0.10,18);
  if v_cut <= 0 then return 0; end if;

  update public.user_profile
     set available_balance=available_balance+v_cut,
         referral_earnings=referral_earnings+v_cut,
         updated_at=now()
   where user_id=v_ref;
  if not found then raise exception 'Referrer profile not found'; end if;

  insert into public.transaction(
    user_id,type,amount,currency,status,approval_status,method,note
  ) values (
    v_ref,'referral',v_cut,'USD','completed','approved',
    'Referral deposit '||v_tx.id::text,
    '10% referral commission for USD deposit'
  );
  return v_cut;
end;
$function$;

revoke all on function public.credit_referral_for_deposit(uuid) from public, anon;
grant execute on function public.credit_referral_for_deposit(uuid) to authenticated;

commit;
