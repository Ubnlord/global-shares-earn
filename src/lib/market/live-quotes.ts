export type QuoteBook = Record<string, { usd: number; change: number }>;

type CoinGeckoRow = { usd?: number; usd_24h_change?: number };
type CoinGeckoResponse = Record<string, CoinGeckoRow>;

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Crypto market request failed: ${response.status}`);
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

function addQuote(book: QuoteBook, key: string, row?: CoinGeckoRow) {
  const usd = Number(row?.usd);
  const change = Number(row?.usd_24h_change);
  if (Number.isFinite(usd) && usd > 0) {
    book[key] = { usd, change: Number.isFinite(change) ? change : 0 };
  }
}

export async function fetchQuotes(): Promise<QuoteBook> {
  const data = await fetchJson<CoinGeckoResponse>(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,binancecoin&vs_currencies=usd&include_24hr_change=true",
  );
  const book: QuoteBook = {};
  addQuote(book, "bitcoin", data.bitcoin);
  addQuote(book, "ethereum", data.ethereum);
  addQuote(book, "solana", data.solana);
  addQuote(book, "ripple", data.ripple);
  addQuote(book, "binancecoin", data.binancecoin);
  if (Object.keys(book).length === 0) throw new Error("Live crypto prices are unavailable");
  return book;
}
