begin;
-- Ensure every newly-created Supabase Auth user gets a profile row.
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.ensure_user_profile();

-- Repair missing profiles for existing auth users without fabricating funds,
-- welcome bonuses, transactions, or investment records.
insert into public.user_profile(user_id,username,fullname,phone,country,referral_code)
select
  u.id,
  coalesce(nullif(trim(u.raw_user_meta_data->>'username'),''), split_part(u.email,'@',1), 'user-'||substr(replace(u.id::text,'-',''),1,8)),
  coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''), nullif(trim(u.raw_user_meta_data->>'username'),''), split_part(u.email,'@',1), 'User'),
  coalesce(u.raw_user_meta_data->>'phone',''),
  coalesce(u.raw_user_meta_data->>'country',''),
  lower(regexp_replace(coalesce(nullif(trim(u.raw_user_meta_data->>'username'),''),split_part(u.email,'@',1),'user-'||substr(replace(u.id::text,'-',''),1,8)),'[^a-zA-Z0-9_-]','','g'))
from auth.users u
left join public.user_profile p on p.user_id=u.id
where p.user_id is null
on conflict(user_id) do nothing;
commit;
