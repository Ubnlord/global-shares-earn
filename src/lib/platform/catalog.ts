export type Plan = {
  id: string;
  name: string;
  min: number;
  max: string;
  profit: string;
  duration: string;
  durationDays: number;
  color: string;
  dailyPct: number;
  available: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "capital-preservation",
    name: "Capital Preservation Plan",
    min: 100,
    max: "500 USD",
    profit: "5% daily (stated plan terms; not guaranteed)",
    duration: "2 Months",
    durationDays: 60,
    color: "#2AF5D4",
    dailyPct: 5,
    available: true,
  },
  {
    id: "fixed-income",
    name: "Fixed Income Plan",
    min: 500,
    max: "1,000 USD",
    profit: "5% daily (stated plan terms; not guaranteed)",
    duration: "4 Months",
    durationDays: 120,
    color: "#5EE9FF",
    dailyPct: 5,
    available: true,
  },
  {
    id: "balanced-portfolio",
    name: "Balanced Portfolio",
    min: 1000,
    max: "1,500 USD",
    profit: "7% daily (stated plan terms; not guaranteed)",
    duration: "6 Months",
    durationDays: 180,
    color: "#A78BFA",
    dailyPct: 7,
    available: true,
  },
  {
    id: "global-index",
    name: "Global Index Plan",
    min: 1500,
    max: "2,000 USD",
    profit: "7% daily (stated plan terms; not guaranteed)",
    duration: "8 Months",
    durationDays: 240,
    color: "#FBBF24",
    dailyPct: 7,
    available: true,
  },
  {
    id: "sustainable-growth",
    name: "Sustainable Growth Plan",
    min: 2000,
    max: "4,000 USD",
    profit: "10% daily (stated plan terms; not guaranteed)",
    duration: "10 Months",
    durationDays: 300,
    color: "#FB7185",
    dailyPct: 10,
    available: true,
  },
  {
    id: "technology-growth",
    name: "Technology Growth Plan",
    min: 5000,
    max: "10,000 USD",
    profit: "10% target return over the full term (not guaranteed)",
    duration: "12 Months",
    durationDays: 365,
    color: "#2AF5D4",
    dailyPct: (10 / 365),
    available: true,
  },
  {
    id: "project-target",
    name: "Project Target Plan",
    min: 10000,
    max: "50,000 USD",
    profit: "10% target return over the full term (not guaranteed)",
    duration: "5 Years",
    durationDays: 1825,
    color: "#FFFFFF",
    dailyPct: (10 / 1825),
    available: true,
  },
];

/** Numeric cap from a plan max label, or null when unlimited. */
export function planCeiling(plan: Plan): number | null {
  if (/unlimited/i.test(plan.max)) return null;
  const n = Number(String(plan.max).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function projectedReturn(amount: number, plan: Plan) {
  const profit = amount * (plan.dailyPct / 100) * plan.durationDays;
  return { profit, total: amount + profit };
}

