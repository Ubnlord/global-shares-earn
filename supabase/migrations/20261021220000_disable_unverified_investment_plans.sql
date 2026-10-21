-- Keep new investments disabled until plan returns and accounting behavior are independently verified.
-- Existing investments and customer balances are not modified.
update public.investment_plan_catalog
set active = false,
    updated_at = now()
where active = true;
