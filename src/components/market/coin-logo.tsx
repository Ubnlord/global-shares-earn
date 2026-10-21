import { cn } from "@/lib/utils";
import { Bitcoin, Coins } from "lucide-react";

export type CoinMark = "beldex" | "bitcoin" | "ethereum";

export function coinMark(id: string): CoinMark {
  const key = id.toUpperCase();
  if (key === "BTC" || key === "BITCOIN") return "bitcoin";
  if (key === "ETH" || key === "ETHEREUM") return "ethereum";
  return "beldex";
}

export function CoinLogo({
  coin,
  size = 32,
  className,
}: {
  coin: CoinMark | string;
  size?: number;
  className?: string;
}) {
  const mark = coinMark(coin);
  const shared = { width: size, height: size };
  if (mark === "bitcoin") {
    return <span aria-label="Bitcoin" role="img" className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-[#F7931A] text-white", className)} style={shared}><Bitcoin size={size * 0.68} /></span>;
  }
  if (mark === "ethereum") {
    return <span aria-label="Ethereum" role="img" className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-[#627EEA] text-white", className)} style={shared}><span className="font-bold" style={{ fontSize: size * 0.62 }}>◆</span></span>;
  }
  return <span aria-label="BDX" role="img" className={cn("inline-flex shrink-0 items-center justify-center rounded-full border border-emerald-300/40 bg-gradient-to-br from-emerald-300 to-emerald-700 font-black text-[#062018]", className)} style={{ ...shared, fontSize: size * 0.34 }}>BDX</span>;
}
