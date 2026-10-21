import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast, toastError } from "@/components/layout/toast";
import { Button } from "@/components/ui/button";
import { FieldLabel, Input } from "@/components/ui/input";
import { DEPOSIT_METHODS } from "@/lib/platform/catalog";
import { copy } from "@/lib/platform/i18n";
import { usePlatform } from "@/lib/platform/store";
import { formatUsd, copyText } from "@/lib/utils";

export const Route = createFileRoute("/app/deposit")({ component: DepositPage });

function DepositPage() {
  const navigate = useNavigate();
  const deposit = usePlatform((s) => s.deposit);
  const lang = usePlatform((s) => s.lang);
  const t = copy[lang];
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"BTC" | "ETH">("BTC");
  const [step, setStep] = useState<"form" | "pay">(() => {
    if (typeof window === "undefined") return "form";
    return new URLSearchParams(window.location.search).get("step") === "pay" ? "pay" : "form";
  });
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => setStep(new URLSearchParams(window.location.search).get("step") === "pay" ? "pay" : "form");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const selected = DEPOSIT_METHODS[method];
  const goPay = () => {
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n) || n < 300) {
      toastError("Minimum deposit is $300 USD.");
      return;
    }
    setRequestId(crypto.randomUUID());
    const url = new URL(window.location.href);
    url.searchParams.set("step", "pay");
    window.history.pushState({ depositStep: "pay" }, "", url);
    setStep("pay");
  };

  const confirm = async () => {
    const n = Number.parseFloat(amount);
    const err = await deposit(n, selected.title, requestId ?? crypto.randomUUID(), "USD");
    if (err) {
      toastError(err);
      return;
    }
    toast(t.depositStarted);
    void navigate({ to: "/app/history" });
  };

  const copyAddress = async () => {
    await copyText(selected.address);
    toast(t.addressCopied);
  };

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-[100px] pt-6">
      <h2 className="text-xl font-bold">{t.depositTitle}</h2>
      <p className="mt-1 text-xs text-subtle">Deposit requests and account balances are recorded in USD.</p>
      {step === "form" ? (
        <section className="mt-6 rounded-xl border border-line bg-elevated p-5">
          <FieldLabel>Amount (USD)</FieldLabel>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min={300}
            step="0.01"
            placeholder="Minimum $300 USD"
          />
          <p className="mt-2 text-[11px] text-subtle">Minimum deposit: {formatUsd(300)}. Requests are reviewed before balances are credited.</p>
          <FieldLabel><span className="mt-5 block">{t.payMethod}</span></FieldLabel>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(["BTC", "ETH"] as const).map((id) => (
              <button key={id} type="button" onClick={() => setMethod(id)} className={method === id ? "rounded-lg border-2 border-accent bg-accent/10 p-3 text-left" : "rounded-lg border border-line p-3 text-left"}>
                <div className="font-semibold">{id === "BTC" ? "Bitcoin" : "Ethereum"}</div>
                <div className="mt-1 text-xs text-subtle">{id === "BTC" ? "Bitcoin network" : "Ethereum network"}</div>
              </button>
            ))}
          </div>
          <Button className="mt-6 w-full" onClick={goPay}>{t.continuePay}</Button>
        </section>
      ) : (
        <section className="mt-6 rounded-xl border border-line bg-elevated p-5">
          <div className="text-xs text-muted">Deposit request amount</div>
          <div className="mt-1 text-2xl font-bold text-accent">{formatUsd(Number.parseFloat(amount) || 0)}</div>
          <div className="mt-1 text-sm font-semibold">{selected.title}</div>
          <p className="mt-2 text-xs leading-5 text-subtle">Your account request is denominated in USD. Confirm the current crypto equivalent and network before sending funds; the transfer is reviewed before crediting.</p>
          <div className="mt-4 break-all rounded-lg border border-line bg-surface p-3 text-sm">{selected.address}</div>
          <Button variant="outline" className="mt-3 w-full" onClick={copyAddress}>{t.addressCopied === "Address copied" ? "Copy deposit address" : t.depositAddress}</Button>
          <Button className="mt-3 w-full" onClick={confirm}>{t.sentIt}</Button>
          <Button variant="ghost" className="mt-2 w-full" onClick={() => setStep("form")}>{t.back}</Button>
        </section>
      )}
    </div>
  );
}
