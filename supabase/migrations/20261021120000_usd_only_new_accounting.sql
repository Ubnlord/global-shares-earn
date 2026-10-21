begin;

-- USD-only accounting cutover, additive and history-preserving.
-- Existing BDX-denominated rows and balance columns are intentionally NOT converted
-- by this migration. They require a separately approved, reconciled conversion rate
-- and a customer-by-customer ledger reconciliation. No customer funds are overwritten.

create or replace function public.create_financial_transaction(
  p_type text,
  p_amount numeric,
  p_method text,
  p_note text,
  p_request_id uuid,
  p_currency text
)
returns public.transaction
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_uid uuid := auth.uid();
  v_tx public.transaction;
  v_currency text := upper(trim(coalesce(p_currency,'')));
  v_method text := upper(trim(coalesce(p_method,'')));
  v_address text := btrim(coalesce(p_note,''));
begin
  if v_uid is null then raise exception 'Unauthorized'; end if;
  if p_type not in ('deposit','withdraw') then raise exception 'Invalid transaction type'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Amount must be greater than zero'; end if;
  if p_request_id is null then raise exception 'Request ID is required for idempotency'; end if;
  if v_currency <> 'USD' then raise exception 'Only USD-denominated transactions are supported'; end if;
  if v_method not in ('BITCOIN','ETHEREUM') then raise exception 'Unsupported payment method'; end if;
  if p_amount < 300 then raise exception 'Minimum amount is 300 USD'; end if;

  if p_type='withdraw' then
    if v_address='' then raise exception 'Please enter a destination address'; end if;
    if v_method='ETHEREUM' and v_address !~ '^0x[0-9A-Fa-f]{40}$' then
      raise exception 'Invalid Ethereum destination address';
    end if;
    if v_method='BITCOIN'
      and v_address !~* '^bc1[ac-hj-np-z02-9]{11,71}$'
      and v_address !~ '^[13][1-9A-HJ-NP-Za-km-z]{25,34}$'
    then raise exception 'Invalid Bitcoin destination address'; end if;
  end if;

  perform public.assert_user_can_transact(v_uid);

  select * into v_tx from public.transaction
   where user_id=v_uid and request_id=p_request_id limit 1;
  if found then
    if v_tx.type<>p_type or v_tx.amount<>p_amount
      or coalesce(v_tx.currency,'USD')<>'USD'
      or upper(coalesce(v_tx.method,''))<>v_method
      or coalesce(v_tx.note,'')<>case when p_type='withdraw' then v_address else '' end then
      raise exception 'Request ID was already used for a different transaction';
    end if;
    return v_tx;
  end if;

  if p_type='withdraw' then
    update public.user_profile
       set available_balance=available_balance-p_amount, updated_at=now()
     where user_id=v_uid and available_balance>=p_amount;
    if not found then raise exception 'Insufficient USD balance'; end if;
  end if;

  insert into public.transaction(user_id,type,amount,currency,status,approval_status,method,note,request_id)
  values(v_uid,p_type,p_amount,'USD','pending','awaiting',v_method,
    case when p_type='withdraw' then v_address else null end,p_request_id)
  returning * into v_tx;
  return v_tx;
exception when unique_violation then
  select * into v_tx from public.transaction
   where user_id=v_uid and request_id=p_request_id limit 1;
  if found and v_tx.type=p_type and v_tx.amount=p_amount
    and coalesce(v_tx.currency,'USD')='USD'
    and upper(coalesce(v_tx.method,''))=v_method then return v_tx; end if;
  raise;
end;
$function$;

revoke all on function public.create_financial_transaction(text,numeric,text,text,uuid,text) from public, anon;
grant execute on function public.create_financial_transaction(text,numeric,text,text,uuid,text) to authenticated;
drop function if exists public.create_financial_transaction(text,numeric,text,text,uuid);
drop function if exists public.create_financial_transaction(text,numeric,text,text);

create or replace function public.buy_investment_plan(p_plan_id text,p_amount numeric)
returns public.user_investment
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_uid uuid := auth.uid();
  v_plan public.investment_plan_catalog;
  v_profile public.user_profile;
  v_inv public.user_investment;
begin
  if v_uid is null then raise exception 'Unauthorized'; end if;
  perform public.assert_user_can_transact(v_uid);
  if p_amount is null or p_amount <= 0 then raise exception 'Amount must be greater than zero'; end if;

  select * into v_plan from public.investment_plan_catalog where id=p_plan_id and active;
  if v_plan.id is null then raise exception 'Investment plan not found'; end if;
  if p_amount < v_plan.min_amount then raise exception 'Minimum investment is % USD',v_plan.min_amount; end if;
  if v_plan.max_amount is not null and p_amount > v_plan.max_amount then
    raise exception 'Maximum investment is % USD',v_plan.max_amount;
  end if;

  select * into v_profile from public.user_profile where user_id=v_uid for update;
  if v_profile.user_id is null then raise exception 'Profile not found'; end if;
  if v_profile.available_balance < p_amount then raise exception 'Insufficient USD balance'; end if;

  update public.user_profile
    set available_balance=available_balance-p_amount,
        locked_balance=locked_balance+p_amount, updated_at=now()
    where user_id=v_uid;

  insert into public.user_investment(user_id,plan_id,principal,daily_rate,duration_days,currency)
  values(v_uid,v_plan.id,p_amount,v_plan.daily_rate,v_plan.duration_days,'USD')
  returning * into v_inv;

  insert into public.transaction(user_id,type,amount,currency,status,approval_status,method,note)
  values(v_uid,'plan',p_amount,'USD','completed','approved',v_plan.name,'USD-denominated investment purchase');
  return v_inv;
end;
$function$;

revoke all on function public.buy_investment_plan(text,numeric) from public, anon;
grant execute on function public.buy_investment_plan(text,numeric) to authenticated;

-- Existing BDX rows are retained unchanged for auditability; this migration does
-- not exchange, erase, merge, or reinterpret any pre-existing customer balance.
-- Versioned USD-only entry point lets the frontend fail closed until this
-- migration is installed, instead of accidentally invoking the old BDX RPC.
create or replace function public.buy_investment_plan_usd(p_plan_id text,p_amount numeric)
returns public.user_investment
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
begin
  return public.buy_investment_plan(p_plan_id,p_amount);
end;
$function$;
revoke all on function public.buy_investment_plan_usd(text,numeric) from public, anon;
grant execute on function public.buy_investment_plan_usd(text,numeric) to authenticated;

commit;
