begin;
-- These SECURITY DEFINER RPCs enforce admin roles and specific permissions internally.
-- Grant only the authenticated role; never anon or public.
grant execute on function public.admin_approve_transaction(uuid,text) to authenticated;
grant execute on function public.admin_approve_deposit(uuid,text) to authenticated;
grant execute on function public.admin_approve_withdrawal(uuid,text) to authenticated;
grant execute on function public.admin_reject_transaction(uuid,text) to authenticated;
grant execute on function public.admin_reject_deposit(uuid,text) to authenticated;
grant execute on function public.admin_reject_withdrawal(uuid,text) to authenticated;
grant execute on function public.admin_settle_transaction(uuid,text) to authenticated;
grant execute on function public.admin_set_user_block(uuid,boolean,text) to authenticated;
grant execute on function public.admin_search_users_bdx(text,integer) to authenticated;
commit;
