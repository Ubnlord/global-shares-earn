import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shield } from "lucide-react";
import { toast, toastError } from "@/components/layout/toast";
import { Button } from "@/components/ui/button";
import { FieldLabel, Input } from "@/components/ui/input";
import { WITHDRAW_METHODS } from "@/lib/platform/catalog";
import { copy } from "@/lib/platform/i18n";
import { usePlatform } from "@/lib/platform/store";
import { formatUsd } from "@/lib/utils";
import { validateWithdrawalDestination } from "@/lib/financial/withdrawal-address";

const MIN_WITHDRAWAL = 300;

export const Route = createFileRoute("/app/withdraw")({ component: WithdrawPage });

function WithdrawPage() {
  const navigate = useNavigate();
  const available = usePlatform((s) => s.available);
  const withdraw = usePlatform((s) => s.withdraw);
  const lang = usePlatform((s) => s.lang);
  const t = copy[lang];
  const [method, setMethod] = useState<"Bitcoin" | "Ethereum">("Bitcoin");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);

  const submit = async () => {
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toastError("Enter a valid USD amount.");
      return;
    }
    if (n < MIN_WITHDRAWAL) {
      toastError(`Minimum withdrawal is ${formatUsd(MIN_WITHDRAWAL)}.`);
      return;
    }
    if (n > available) {
      toastError("Insufficient USD balance.");
      return;
    }
    const addressError = validateWithdrawalDestination(method, address);
    if (addressError) {
      toastError(addressError);
      return;
    }
    const id = requestId ?? crypto.randomUUID();
    setRequestId(id);
    const err = await withdraw(n, method, address, id, "USD");
    if (err) {
      toastError(err);
      return;
    }
    toast(t.withdrawRequested);
    void navigate({ to: "/app/history" });
  };

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-[100px] pt-6">
      <h2 className="text-xl font-bold">{t.withdrawTitle}</h2>
      <p className="mt-1 text-xs text-subtle">Withdrawals are requested and accounted for in USD. Requests are reviewed before processing.</p>
      <section className="mt-6 rounded-xl border border-line bg-elevated p-5">
        <FieldLabel>{t.chooseMethod}</FieldLabel>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {WITHDRAW_METHODS.map((m) => (
            <button key={m.id} type="button" onClick={() => setMethod(m.label as "Bitcoin" | "Ethereum")} className={method === m.label ? "rounded-lg border-2 border-accent bg-accent/10 p-3 text-left" : "rounded-lg border border-line p-3 text-left"}>
              <div className="font-semibold">{m.label}</div>
              <div className="mt-1 text-xs text-subtle">{m.id === "BTC" ? "Bitcoin network" : "Ethereum network"}</div>
            </button>
          ))}
        </div>
        <FieldLabel><span className="mt-5 block">Amount (USD)</span></FieldLabel>
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={MIN_WITHDRAWAL} step="0.01" placeholder="Minimum $300 USD" />
        <div className="mt-2 flex justify-between text-[11px] text-subtle">
          <span>{t.available}: {formatUsd(available)} · Min: {formatUsd(MIN_WITHDRAWAL)}</span>
          <button type="button" onClick={() => setAmount(available.toFixed(2))} className="text-accent">{t.max}</button>
        </div>
        <FieldLabel><span className="mt-5 block">{t.destination}</span></FieldLabel>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={method === "Bitcoin" ? "Bitcoin wallet address" : "Ethereum wallet address"} />
        <Button className="mt-6 w-full" onClick={submit}>{t.withdrawNow}</Button>
        <div className="mt-5 flex gap-2 rounded-lg border border-line bg-surface p-3">
          <Shield size={16} className="mt-0.5 text-accent" />
          <div>
            <div className="text-xs font-medium text-fg">{t.secure}</div>
            <div className="mt-1 text-[10px] text-subtle">{t.secureBody}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
