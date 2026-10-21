begin;

-- Configure the seven requested plan terms in the existing catalog.
-- Target-return plans use a per-day rate equal to 10% divided by term length,
-- so their total scheduled return is 10% across the full term, not 10% per day.
-- Daily-profit plans use the explicitly requested daily percentages.
-- No existing user investments or balances are rewritten.
update public.investment_plan_catalog
set id = case id
  when 'gns' then 'capital-preservation'
  when 'build' then 'fixed-income'
  when 'follow' then 'balanced-portfolio'
  when 'apex' then 'global-index'
  when 'edifex' then 'sustainable-growth'
  when 'dixon' then 'technology-growth'
  when 'falcon' then 'project-target'
  else id
end,
name = case id
  when 'gns' then 'Capital Preservation Plan'
  when 'build' then 'Fixed Income Plan'
  when 'follow' then 'Balanced Portfolio'
  when 'apex' then 'Global Index Plan'
  when 'edifex' then 'Sustainable Growth Plan'
  when 'dixon' then 'Technology Growth Plan'
  when 'falcon' then 'Project Target Plan'
  else name
end,
min_amount = case id
  when 'gns' then 100
  when 'build' then 500
  when 'follow' then 1000
  when 'apex' then 1500
  when 'edifex' then 2000
  when 'dixon' then 5000
  when 'falcon' then 10000
  else min_amount
end,
max_amount = case id
  when 'gns' then 500
  when 'build' then 1000
  when 'follow' then 1500
  when 'apex' then 2000
  when 'edifex' then 4000
  when 'dixon' then 10000
  when 'falcon' then 50000
  else max_amount
end,
duration_days = case id
  when 'gns' then 60
  when 'build' then 120
  when 'follow' then 180
  when 'apex' then 240
  when 'edifex' then 300
  when 'dixon' then 365
  when 'falcon' then 1825
  else duration_days
end,
daily_rate = case id
  when 'gns' then 0.05
  when 'build' then 0.05
  when 'follow' then 0.07
  when 'apex' then 0.07
  when 'edifex' then 0.10
  when 'dixon' then 0.10 / 365.0
  when 'falcon' then 0.10 / 1825.0
  else daily_rate
end,
active = case when id in ('gns','build','follow','apex','edifex','dixon','falcon') then true else active end,
updated_at = now()
where id in ('gns','build','follow','apex','edifex','dixon','falcon');

commit;
