import { createServerFn } from "@tanstack/react-start";

export type QuoteBook = Record<string, { usd: number; change: number }>;

type CoinGeckoRow = { usd?: number; usd_24h_change?: number };
type CoinGeckoResponse = Record<string, CoinGeckoRow>;

export type CryptoMarketDetail = {
  usd: number | null;
  high: number | null;
  low: number | null;
  marketCap: number | null;
  volume: number | null;
  rank: number | null;
  changes: Record<string, number | null>;
};

async function fetchMarketDetail(): Promise<CryptoMarketDetail> {
  const empty: CryptoMarketDetail = { usd: null, high: null, low: null, marketCap: null, volume: null, rank: null, changes: {} };
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false&price_change_percentage=24h,7d,30d,90d,180d,1y", {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return empty;
    const coin = (await response.json()) as {
      market_cap_rank?: number;
      market_data?: {
        current_price?: { usd?: number };
        high_24h?: { usd?: number };
        low_24h?: { usd?: number };
        market_cap?: { usd?: number };
        total_volume?: { usd?: number };
        price_change_percentage_24h?: number;
        price_change_percentage_7d?: number;
        price_change_percentage_30d?: number;
        price_change_percentage_90d?: number;
        price_change_percentage_180d?: number;
        price_change_percentage_1y?: number;
      };
    };
    const md = coin.market_data;
    return {
      usd: md?.current_price?.usd ?? null,
      high: md?.high_24h?.usd ?? null,
      low: md?.low_24h?.usd ?? null,
      marketCap: md?.market_cap?.usd ?? null,
      volume: md?.total_volume?.usd ?? null,
      rank: coin.market_cap_rank ?? null,
      changes: {
        "24h": md?.price_change_percentage_24h ?? null,
        "7d": md?.price_change_percentage_7d ?? null,
        "1m": md?.price_change_percentage_30d ?? null,
        "3m": md?.price_change_percentage_90d ?? null,
        "6m": md?.price_change_percentage_180d ?? null,
        YTD: null,
        "1y": md?.price_change_percentage_1y ?? null,
      },
    };
  } catch {
    return empty;
  }
}

export const fetchCryptoMarketDetail = createServerFn({ method: "GET" }).handler(fetchMarketDetail);

export async function fetchQuotes(): Promise<QuoteBook> {
  const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,binancecoin&vs_currencies=usd&include_24hr_change=true", {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Market price request failed: ${response.status}`);
  const data = (await response.json()) as CoinGeckoResponse;
  const book: QuoteBook = {};
  for (const [id, row] of Object.entries(data)) {
    const usd = Number(row.usd);
    const change = Number(row.usd_24h_change);
    if (Number.isFinite(usd) && usd > 0) book[id] = { usd, change: Number.isFinite(change) ? change : 0 };
  }
  if (!Object.keys(book).length) throw new Error("Live crypto prices are unavailable");
  return book;
}
