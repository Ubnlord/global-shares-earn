import { MarketBoard, CryptoLivePrice } from "@/components/market/live-price";

export function HomeCryptoStats() {
  return (
    <div className="space-y-4">
      <CryptoLivePrice />
      <MarketBoard />
    </div>
  );
}
