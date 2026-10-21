import type { Book, ActivePlan, Transaction, TxStatus, TxType } from "@/lib/platform/store";
import { supabase } from "./client";
import { isCompleteCloudRefresh } from "./cloud-book-guard";

function num(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function pullCloudBook(options: { skipAccrual?: boolean } = {}): Promise<Book | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Investment profit is credited only through the administrator's manual action.
  // Refreshing a user's book must never create profit as a side effect.
  const accrualFailed = false;

  const [profileResult, txResult, investmentsResult] = await Promise.all([
    supabase
      .from("user_profile")
      // New account balances are USD-only. Do not depend on legacy BDX columns.
      .select("available_balance,locked_balance,total_withdrawals")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("transaction")
      // Keep historical currency metadata so archived transactions remain auditable.
      .select("id,type,amount,currency,status,method,note,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_investment")
      // Currency is retained on historical investments; new accounting is USD-only.
      .select("id,plan_id,principal,daily_rate,duration_days,started_at,last_accrual_at,credited_profit,status,currency,investment_plan_catalog(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  // A missing profile is not a valid zero-balance account. Keep the last known
  // local book intact if any financial query failed or the profile row is absent.
  if (!isCompleteCloudRefresh(profileResult, txResult, investmentsResult)) return null;
  const p = profileResult.data as NonNullable<typeof profileResult.data>;
  const rawTxs = txResult.data ?? [];
  const txs: Transaction[] = rawTxs.map((t: any) => ({
    id: t.id,
    type: t.type as TxType,
    amount: num(t.amount),
    // Historical BDX rows remain identifiable; they are never converted or added
    // to USD balances by this refresh path.
    currency: t.currency === "BDX" ? "BDX" : "USD",
    status: (t.status === "completed" ? "completed" : t.status === "failed" ? "failed" : "pending") as TxStatus,
    date: new Date(t.created_at).toISOString(),
    method: t.method ?? undefined,
    note: t.note ?? undefined,
  }));

  const plans: ActivePlan[] = (investmentsResult.data ?? []).map((investment: any) => {
    const catalog = Array.isArray(investment.investment_plan_catalog)
      ? investment.investment_plan_catalog[0]
      : investment.investment_plan_catalog;
    return {
      id: investment.id,
      planId: investment.plan_id,
      name: catalog?.name ?? investment.plan_id,
      amount: num(investment.principal),
      currency: investment.currency === "BDX" ? "BDX" : "USD",
      dailyPct: num(investment.daily_rate) * 100,
      startedAt: new Date(investment.started_at).getTime(),
      durationDays: Number(investment.duration_days) || 0,
      status: investment.status === "completed" ? "completed" : "active",
      color: "#2AF5D4",
      creditedDays: undefined,
      creditedProfit: num(investment.credited_profit),
      lastAccrualAt: investment.last_accrual_at ? new Date(investment.last_accrual_at).getTime() : undefined,
    };
  });

  const profit = (investmentsResult.data ?? []).reduce(
    (sum: number, investment: any) => sum + (investment.currency === "USD" ? num(investment.credited_profit) : 0),
    0,
  );
  const bonus = rawTxs
    .filter((t: any) => t.type === "bonus" && t.method === "Welcome Bonus" && t.currency !== "BDX")
    .reduce((sum: number, t: any) => sum + num(t.amount), 0);
  const referralBonusUsd = rawTxs
    .filter((t: any) => t.type === "referral" && t.status === "completed" && t.currency !== "BDX")
    .reduce((sum: number, t: any) => sum + num(t.amount), 0);

  return {
    available: num(p.available_balance),
    // Retained only for compatibility with the existing client state shape.
    // This value is not read from the database and is never used as USD.
    bdx: 0,
    locked: num(p.locked_balance),
    profit,
    bonus,
    referralBonus: referralBonusUsd,
    withdrawn: num(p.total_withdrawals),
    txs,
    plans,
    notices: [],
    tickets: [],
    accrualFailed,
  };
}

// Legacy client-ledger writes are intentionally disabled.
export async function pushCloudBook(_book: Book) { return; }
export function scheduleCloudSave(_book: Book) { return; }
