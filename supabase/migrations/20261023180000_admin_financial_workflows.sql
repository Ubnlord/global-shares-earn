begin;

-- Dedicated per-investment profit credit: atomic ledger, wallet, investment, transaction, and audit writes.
create or replace function public.admin_credit_investment_profit(
  p_investment_id uuid, p_amount numeric, p_profit_date date, p_reason text
) returns table(ledger_id uuid, transaction_id uuid, credited_amount numeric)
language plpgsql security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_admin public.admin_user;
  v_inv public.user_investment;
  v_profile public.user_profile;
  v_ledger_id uuid;
  v_tx_id uuid;
  v_reason text := nullif(trim(coalesce(p_reason,'')),'');
begin
  if not public.is_admin() or not public.admin_has_permission('manage_users') then raise exception 'Permission denied'; end if;
  if p_investment_id is null or p_amount is null or p_amount <= 0 or p_amount > 1000000000000 then raise exception 'Invalid investment or amount'; end if;
  if p_profit_date is null or p_profit_date > (now() at time zone 'utc')::date then raise exception 'Profit date cannot be in the future'; end if;
  if v_reason is null or length(v_reason) < 5 then raise exception 'Reason must be at least 5 characters'; end if;
  select * into v_admin from public.admin_user where user_id=auth.uid();
  if v_admin.id is null then raise exception 'Admin access required'; end if;
  select * into v_inv from public.user_investment where id=p_investment_id for update;
  if v_inv.id is null then raise exception 'Investment not found'; end if;
  if v_inv.status <> 'active' or v_inv.daily_accrual_enabled is distinct from true then raise exception 'Investment is not eligible for manual profit'; end if;
  if upper(coalesce(v_inv.currency,'USD')) <> 'USD' then raise exception 'Only USD investments can receive new profit'; end if;
  if p_profit_date < (v_inv.started_at at time zone 'utc')::date then raise exception 'Profit date precedes investment start'; end if;
  select * into v_profile from public.user_profile where user_id=v_inv.user_id for update;
  if v_profile.user_id is null or coalesce(v_profile.blocked,false) then raise exception 'User profile missing or blocked'; end if;

  insert into public.admin_daily_investment_profit(investment_id,user_id,profit_date,profit_amount,currency,admin_user_id,reason)
  values(v_inv.id,v_inv.user_id,p_profit_date,round(p_amount,2),'USD',auth.uid(),v_reason)
  on conflict (investment_id,profit_date) do nothing
  returning id into v_ledger_id;
  if v_ledger_id is null then raise exception 'Profit already credited for this investment and date'; end if;

  update public.user_profile set available_balance=available_balance+round(p_amount,2),updated_at=now()
    where user_id=v_inv.user_id;
  update public.user_investment set credited_profit=credited_profit+round(p_amount,2),updated_at=now()
    where id=v_inv.id;
  insert into public.transaction(user_id,type,amount,currency,status,approval_status,method,note,approved_by,approval_reason,approved_at,settled_at)
  values(v_inv.user_id,'bonus',round(p_amount,2),'USD','completed','approved','Admin investment profit',
    'Manual investment profit for '||p_profit_date::text,v_admin.id,v_reason,now(),now())
  returning id into v_tx_id;
  update public.admin_daily_investment_profit set transaction_id=v_tx_id where id=v_ledger_id;
  insert into public.admin_action_audit(admin_id,user_id,action,target_id,old_values,new_values,reason)
  values(v_admin.id,v_inv.user_id,'investment_profit_credited',v_inv.id,
    jsonb_build_object('credited_profit',v_inv.credited_profit,'available_balance',v_profile.available_balance),
    jsonb_build_object('credited_profit',v_inv.credited_profit+round(p_amount,2),
      'available_balance',v_profile.available_balance+round(p_amount,2),'amount',round(p_amount,2),
      'currency','USD','profit_date',p_profit_date,'transaction_id',v_tx_id),v_reason);
  return query select v_ledger_id,v_tx_id,round(p_amount,2);
end;
$$;

revoke all on function public.admin_credit_investment_profit(uuid,numeric,date,text) from public, anon;
grant execute on function public.admin_credit_investment_profit(uuid,numeric,date,text) to authenticated;

-- Welcome bonus policy is configurable but disabled until an authorized admin enables it.
create table if not exists public.admin_welcome_bonus_config (
  id boolean primary key default true check (id),
  enabled boolean not null default false,
  amount_usd numeric(18,2) not null default 0 check (amount_usd >= 0 and amount_usd <= 100000),
  updated_by uuid references public.admin_user(id),
  updated_at timestamptz not null default now()
);
insert into public.admin_welcome_bonus_config(id,enabled,amount_usd) values(true,false,0)
on conflict (id) do nothing;
alter table public.admin_welcome_bonus_config enable row level security;
drop policy if exists admin_welcome_bonus_config_admin_read on public.admin_welcome_bonus_config;
create policy admin_welcome_bonus_config_admin_read on public.admin_welcome_bonus_config
for select to authenticated using (public.is_admin());

create unique index if not exists transaction_welcome_bonus_once_per_user
on public.transaction (user_id) where type='bonus' and method='Welcome bonus';

create or replace function public.admin_set_welcome_bonus_config(p_enabled boolean,p_amount_usd numeric,p_reason text)
returns void language plpgsql security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare v_admin public.admin_user; v_reason text := nullif(trim(coalesce(p_reason,'')),'');
begin
  if not public.is_admin() or not public.admin_has_permission('manage_users') then raise exception 'Permission denied'; end if;
  if p_amount_usd is null or p_amount_usd < 0 or p_amount_usd > 100000 then raise exception 'Invalid welcome bonus amount'; end if;
  if p_enabled and p_amount_usd <= 0 then raise exception 'Enabled bonus must be greater than zero'; end if;
  if v_reason is null or length(v_reason)<5 then raise exception 'Reason must be at least 5 characters'; end if;
  select * into v_admin from public.admin_user where user_id=auth.uid();
  if v_admin.id is null then raise exception 'Admin access required'; end if;
  insert into public.admin_welcome_bonus_config(id,enabled,amount_usd,updated_by,updated_at)
  values(true,p_enabled,round(p_amount_usd,2),v_admin.id,now())
  on conflict(id) do update set enabled=excluded.enabled,amount_usd=excluded.amount_usd,updated_by=excluded.updated_by,updated_at=now();
  insert into public.admin_action_audit(admin_id,action,old_values,new_values,reason)
  values(v_admin.id,'welcome_bonus_config_updated',jsonb_build_object('enabled',not p_enabled,'amount_usd',null),
    jsonb_build_object('enabled',p_enabled,'amount_usd',round(p_amount_usd,2)),v_reason);
end;
$$;
revoke all on function public.admin_set_welcome_bonus_config(boolean,numeric,text) from public, anon;
grant execute on function public.admin_set_welcome_bonus_config(boolean,numeric,text) to authenticated;

create or replace function public.admin_grant_welcome_bonus(p_user_id uuid,p_reason text)
returns table(transaction_id uuid, amount_usd numeric)
language plpgsql security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare v_admin public.admin_user; v_profile public.user_profile; v_config public.admin_welcome_bonus_config; v_tx_id uuid; v_reason text := nullif(trim(coalesce(p_reason,'')),'');
begin
  if not public.is_admin() or not public.admin_has_permission('manage_users') then raise exception 'Permission denied'; end if;
  if p_user_id is null or v_reason is null or length(v_reason)<5 then raise exception 'User and audit reason are required'; end if;
  select * into v_admin from public.admin_user where user_id=auth.uid();
  if v_admin.id is null then raise exception 'Admin access required'; end if;
  select * into v_config from public.admin_welcome_bonus_config where id=true for share;
  if not found or not v_config.enabled or v_config.amount_usd<=0 then raise exception 'Welcome bonus is not enabled'; end if;
  select * into v_profile from public.user_profile where user_id=p_user_id for update;
  if not found or coalesce(v_profile.blocked,false) then raise exception 'User profile missing or blocked'; end if;
  insert into public.transaction(user_id,type,amount,currency,status,approval_status,method,note,approved_by,approval_reason,approved_at,settled_at)
  values(p_user_id,'bonus',v_config.amount_usd,'USD','completed','approved','Welcome bonus','One-time welcome bonus',v_admin.id,v_reason,now(),now())
  on conflict (user_id) where type='bonus' and method='Welcome bonus' do nothing
  returning id into v_tx_id;
  if v_tx_id is null then raise exception 'Welcome bonus already granted to this user'; end if;
  update public.user_profile set available_balance=available_balance+v_config.amount_usd,updated_at=now() where user_id=p_user_id;
  insert into public.admin_action_audit(admin_id,user_id,action,target_id,new_values,reason)
  values(v_admin.id,p_user_id,'welcome_bonus_granted',v_tx_id,jsonb_build_object('amount_usd',v_config.amount_usd,'currency','USD'),v_reason);
  return query select v_tx_id,v_config.amount_usd;
end;
$$;
revoke all on function public.admin_grant_welcome_bonus(uuid,text) from public, anon;
grant execute on function public.admin_grant_welcome_bonus(uuid,text) to authenticated;

-- Plan edits only affect new purchases. Existing investments retain snapshotted terms.
create table if not exists public.investment_plan_catalog_history (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null,
  admin_id uuid references public.admin_user(id),
  old_values jsonb not null,
  new_values jsonb not null,
  reason text not null,
  created_at timestamptz not null default now()
);
alter table public.investment_plan_catalog_history enable row level security;
drop policy if exists investment_plan_history_admin_read on public.investment_plan_catalog_history;
create policy investment_plan_history_admin_read on public.investment_plan_catalog_history
for select to authenticated using (public.is_admin());

create or replace function public.admin_update_investment_plan(
  p_plan_id text,p_name text,p_min_amount numeric,p_max_amount numeric,p_duration_days integer,p_daily_rate numeric,p_active boolean,p_reason text
) returns void language plpgsql security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare v_admin public.admin_user; v_plan public.investment_plan_catalog; v_reason text := nullif(trim(coalesce(p_reason,'')),'');
begin
  if not public.is_admin() or not public.admin_has_permission('manage_investments') then raise exception 'Permission denied'; end if;
  if p_plan_id is null or nullif(trim(p_name),'') is null or p_min_amount<=0 or p_max_amount<p_min_amount or p_duration_days<=0 or p_daily_rate<0 or p_daily_rate>1 or p_active is null then raise exception 'Invalid plan values'; end if;
  if v_reason is null or length(v_reason)<5 then raise exception 'Reason must be at least 5 characters'; end if;
  select * into v_admin from public.admin_user where user_id=auth.uid();
  if v_admin.id is null then raise exception 'Admin access required'; end if;
  select * into v_plan from public.investment_plan_catalog where id=p_plan_id for update;
  if not found then raise exception 'Plan not found'; end if;
  insert into public.investment_plan_catalog_history(plan_id,admin_id,old_values,new_values,reason)
  values(v_plan.id,v_admin.id,to_jsonb(v_plan),jsonb_build_object('name',trim(p_name),'min_amount',p_min_amount,'max_amount',p_max_amount,'duration_days',p_duration_days,'daily_rate',p_daily_rate,'active',p_active),v_reason);
  update public.investment_plan_catalog set name=trim(p_name),min_amount=p_min_amount,max_amount=p_max_amount,duration_days=p_duration_days,daily_rate=p_daily_rate,active=p_active,updated_at=now()
  where id=p_plan_id;
  insert into public.admin_action_audit(admin_id,action,target_id,old_values,new_values,reason)
  values(v_admin.id,'investment_plan_updated',null,v_plan::jsonb,jsonb_build_object('plan_id',p_plan_id,'name',trim(p_name),'min_amount',p_min_amount,'max_amount',p_max_amount,'duration_days',p_duration_days,'daily_rate',p_daily_rate,'active',p_active),v_reason);
end;
$$;
revoke all on function public.admin_update_investment_plan(text,text,numeric,numeric,integer,numeric,boolean,text) from public, anon;
grant execute on function public.admin_update_investment_plan(text,text,numeric,numeric,integer,numeric,boolean,text) to authenticated;

-- Append-only audit history: block row changes/deletions from all roles.
create or replace function public.reject_admin_audit_mutation()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin raise exception 'Audit records are append-only'; end;
$$;
drop trigger if exists admin_action_audit_append_only on public.admin_action_audit;
create trigger admin_action_audit_append_only before update or delete on public.admin_action_audit
for each row execute function public.reject_admin_audit_mutation();
drop trigger if exists investment_plan_history_append_only on public.investment_plan_catalog_history;
create trigger investment_plan_history_append_only before update or delete on public.investment_plan_catalog_history
for each row execute function public.reject_admin_audit_mutation();

commit;