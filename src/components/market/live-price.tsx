import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { TrendingDown, TrendingUp } from "lucide-react";
import { CoinLogo } from "@/components/market/coin-logo";
import { fetchQuotes, type QuoteBook } from "@/lib/market/live-quotes";
import { cn } from "@/lib/utils";

type QuoteState = {
  book: QuoteBook;
  updatedAt: number;
  status: "loading" | "ready" | "error";
};

const useQuotes = create<QuoteState & { load: () => Promise<void> }>((set, get) => ({
  book: {},
  updatedAt: 0,
  status: "loading",
  load: async () => {
    set({ status: "loading" });
    try {
      const book = await fetchQuotes();
      set({ book, updatedAt: Date.now(), status: "ready" });
    } catch {
      set({ status: Object.keys(get().book).length ? "ready" : "error" });
    }
  },
}));

let liveStarted = false;
function ensureLive() {
  if (liveStarted || typeof window === "undefined") return;
  liveStarted = true;
  const tick = () => void useQuotes.getState().load();
  void tick();
  window.setInterval(tick, 30_000);
}

export function useCryptoQuotes() {
  const state = useQuotes();
  useEffect(() => ensureLive(), []);
  return state;
}

export function formatCoinUsd(usd: number) {
  if (usd >= 1000) return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (usd >= 1) return `$${usd.toFixed(2)}`;
  return `$${usd.toFixed(5)}`;
}

export function coinQty(usdAmount: number, price: number) {
  if (!price || !usdAmount) return null;
  const value = usdAmount / price;
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value >= 1) return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
  return value.toFixed(6);
}

const ASSETS = [
  { id: "bitcoin", name: "Bitcoin", ticker: "BTC" },
  { id: "ethereum", name: "Ethereum", ticker: "ETH" },
  { id: "solana", name: "Solana", ticker: "SOL" },
  { id: "ripple", name: "XRP", ticker: "XRP" },
  { id: "binancecoin", name: "BNB", ticker: "BNB" },
] as const;

export function CoinPrice({ id }: { id: (typeof ASSETS)[number]["id"] }) {
  const { book } = useCryptoQuotes();
  const row = book[id];
  if (!row) return <span className="text-[11px] tabular text-subtle">Loading…</span>;
  return (
    <span className="text-right leading-tight">
      <span className="block text-[13px] font-bold tabular"><LiveFigure value={formatCoinUsd(row.usd)} /></span>
      <span className={row.change >= 0 ? "text-[10px] tabular text-accent" : "text-[10px] tabular text-danger"}>
        {row.change >= 0 ? "+" : ""}{row.change.toFixed(2)}%
      </span>
    </span>
  );
}

export function MarketBoard({ active }: { active?: (typeof ASSETS)[number]["id"] }) {
  const { book, status, updatedAt } = useCryptoQuotes();
  return (
    <section className="rounded-lg border border-line bg-elevated p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold tracking-wide text-subtle">Live crypto market · USD</div>
        <div className="inline-flex items-center gap-1.5 text-[10px] text-accent">
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />{status === "error" ? "Unavailable" : "Live"}
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        {ASSETS.map((asset) => {
          const row = book[asset.id];
          const selected = active === asset.id;
          return (
            <div key={asset.id} className={selected ? "flex items-center justify-between rounded-md border border-accent/50 bg-accent/10 px-3 py-2.5" : "flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2.5"}>
              <div className="flex items-center gap-2.5">
                <CoinLogo coin={asset.id} size={28} />
                <div><div className="text-[13px] font-semibold text-fg">{asset.name}</div><div className="text-[10px] text-subtle">{asset.ticker}/USD</div></div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold tabular">{row ? <LiveFigure value={formatCoinUsd(row.usd)} /> : "—"}</div>
                {row && <div className={row.change >= 0 ? "text-[10px] tabular text-accent" : "text-[10px] tabular text-danger"}>{row.change >= 0 ? "+" : ""}{row.change.toFixed(2)}% 24h</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[10px] text-subtle">{updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : "Prices supplied by CoinGecko; market data may be delayed."}</div>
    </section>
  );
}

export function CryptoLivePrice({ className }: { className?: string }) {
  const { book, status } = useCryptoQuotes();
  const btc = book.bitcoin;
  const up = (btc?.change ?? 0) >= 0;
  return (
    <div className={cn("rounded-lg border border-line bg-elevated p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold tracking-wide text-subtle">Live crypto market · USD</div>
        <span className="text-[10px] text-accent">{status === "error" ? "Unavailable" : "Live prices"}</span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="text-3xl font-bold tabular">{btc ? <LiveFigure value={formatCoinUsd(btc.usd)} /> : "—"}</div>
        {btc && <div className={cn("mb-1 inline-flex items-center gap-1 text-sm font-semibold tabular", up ? "text-accent" : "text-danger")}>{up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{up ? "+" : ""}{btc.change.toFixed(2)}%</div>}
      </div>
      <p className="mt-1 text-[10px] text-subtle">Bitcoin reference price; other major crypto prices are listed below.</p>
    </div>
  );
}

function LiveFigure({ value }: { value: string }) {
  const previous = useRef(value);
  const [hot, setHot] = useState(false);
  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    setHot(true);
    const id = window.setTimeout(() => setHot(false), 650);
    return () => window.clearTimeout(id);
  }, [value]);
  return <span className={cn("transition-colors", hot ? "text-accent" : "")}>{value}</span>;
}
