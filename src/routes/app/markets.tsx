import { createFileRoute } from "@tanstack/react-router";
import {
  AdvancedChart,
  MiniChart,
  SymbolOverview,
  TickerTape,
} from "@/components/market/tradingview";
import { TvCredit } from "@/components/platform/plan-card";
import { copy } from "@/lib/platform/i18n";
import { usePlatform } from "@/lib/platform/store";

export const Route = createFileRoute("/app/markets")({ component: MarketsPage });

function MarketsPage() {
  const lang = usePlatform((s) => s.lang);
  const t = copy[lang];
  return (
    <div className="mx-auto max-w-[480px] px-4 pb-[100px] pt-4 md:max-w-[960px]">
      <TickerTape />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t.markets}</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <section id="forex" className="scroll-mt-24 rounded-lg border border-line bg-elevated p-4">
          <div className="text-xs font-semibold tracking-widest text-accent">FOREX</div>
          <h3 className="mt-1 text-base font-bold">Foreign Exchange Markets</h3>
          <p className="mt-2 text-[12px] leading-5 text-subtle">
            Explore the foreign-exchange market and commonly followed currency pairs such as
            EUR/USD, GBP/USD, and USD/JPY. Market availability, pricing, leverage, and trading
            conditions depend on your jurisdiction and account eligibility.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {["EUR/USD", "GBP/USD", "USD/JPY"].map((pair) => (
              <span key={pair} className="rounded-full border border-line px-2 py-1 text-muted">
                {pair}
              </span>
            ))}
          </div>
        </section>

        <section id="cryptos" className="scroll-mt-24 rounded-lg border border-line bg-elevated p-4">
          <div className="text-xs font-semibold tracking-widest text-accent">CRYPTOS</div>
          <h3 className="mt-1 text-base font-bold">Crypto Markets</h3>
          <p className="mt-2 text-[12px] leading-5 text-subtle">
            Follow live prices and charts for major cryptocurrencies, including Bitcoin, Ethereum,
            Solana, XRP, and other widely traded digital assets. Prices are provided by TradingView
            and may be delayed or unavailable at times.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {["BTC/USD", "ETH/USD", "SOL/USD", "XRP/USD"].map((symbol) => (
              <span key={symbol} className="rounded-full border border-line px-2 py-1 text-muted">{symbol}</span>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-elevated p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13px] font-semibold">{t.page.liveMarketTv}</div>
          <a
            href="https://www.tradingview.com/markets/cryptocurrencies/prices-all/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-accent hover:underline"
          >
            Explore crypto markets
          </a>
        </div>
        <AdvancedChart />
        <TvCredit className="mt-2" />
      </div>
      <div className="mt-4 rounded-lg border border-line bg-elevated p-4">
        <div className="mb-3 text-[13px] font-semibold">{t.page.overviewStats}</div>
        <SymbolOverview />
      </div>
      <div className="mt-4 rounded-lg border border-line bg-elevated p-4">
        <div className="mb-3 text-[13px] font-semibold">{t.page.intraday}</div>
        <MiniChart />
      </div>
    </div>
  );
}
