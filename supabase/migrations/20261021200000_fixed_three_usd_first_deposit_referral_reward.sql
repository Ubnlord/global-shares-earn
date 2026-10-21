begin;

-- Fixed $3 referral reward, only for the referred user's first completed USD deposit.
-- Restrict direct invocation: settlement/admin security-definer functions call this internally.
create or replace function public.credit_referral_for_deposit(p_transaction_id uuid)
returns numeric
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'pg_temp'
as $function$
declare
  v_tx public.transaction;
  v_ref uuid;
  v_cut numeric := 3.00;
begin
  if p_transaction_id is null then raise exception 'Transaction ID is required'; end if;

  select * into v_tx
    from public.transaction
   where id = p_transaction_id
   for update;
  if not found then raise exception 'Transaction not found'; end if;
  if v_tx.type <> 'deposit' or v_tx.status <> 'completed' then return 0; end if;
  if upper(coalesce(v_tx.currency, 'USD')) <> 'USD' then return 0; end if;

  select referred_by_user_id into v_ref
    from public.user_profile
   where user_id = v_tx.user_id;
  if v_ref is null or v_ref = v_tx.user_id then return 0; end if;

  perform 1 from public.user_profile where user_id = v_ref for update;
  perform 1 from public.user_profile where user_id = v_tx.user_id for update;

  if exists (
    select 1 from public.transaction prior_tx
     where prior_tx.user_id = v_tx.user_id
       and prior_tx.type = 'deposit'
       and prior_tx.status = 'completed'
       and upper(coalesce(prior_tx.currency, 'USD')) = 'USD'
       and (prior_tx.created_at < v_tx.created_at
         or (prior_tx.created_at = v_tx.created_at and prior_tx.id < v_tx.id))
  ) then return 0; end if;

  if exists (
    select 1 from public.transaction
     where type = 'referral'
       and method = 'Referral deposit ' || v_tx.id::text
  ) then return 0; end if;

  insert into public.transaction(
    user_id, type, amount, currency, status, approval_status, method, note
  ) values (
    v_ref, 'referral', v_cut, 'USD', 'completed', 'approved',
    'Referral deposit ' || v_tx.id::text,
    'Fixed $3 reward for first completed USD deposit'
  );

  update public.user_profile
     set available_balance = available_balance + v_cut,
         referral_earnings = referral_earnings + v_cut,
         updated_at = now()
   where user_id = v_ref;
  if not found then raise exception 'Referrer profile not found'; end if;

  insert into public.admin_action_audit(
    admin_id, user_id, action, target_id, old_values, new_values, reason
  ) values (
    null, v_ref, 'referral_reward_credited', v_tx.id,
    jsonb_build_object('amount', 0, 'currency', 'USD'),
    jsonb_build_object('amount', v_cut, 'currency', 'USD', 'source_deposit_id', v_tx.id),
    'Fixed reward for first completed USD deposit'
  );

  return v_cut;
end;
$function$;

revoke all on function public.credit_referral_for_deposit(uuid) from public, anon, authenticated;

commit;
