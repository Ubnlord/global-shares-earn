import { Link } from "@tanstack/react-router";
import { copy } from "@/lib/platform/i18n";
import { usePlatform } from "@/lib/platform/store";
import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 p-1 shadow-sm", className)}>
      <img src={`${import.meta.env.BASE_URL}gse-logo.jpg`} alt="Global Shares Earn" className="h-full w-full object-contain" loading="eager" decoding="async" />
    </div>
  );
}

export function BrandLockup({
  to = "/",
  subtitle,
}: {
  to?: string;
  subtitle?: string;
}) {
  const lang = usePlatform((s) => s.lang);
  return (
    <Link to={to} className="flex min-w-0 items-center gap-2">
      <img src={`${import.meta.env.BASE_URL}gse-logo.jpg`} alt="Global Shares Earn" className="h-12 w-auto max-w-[min(68vw,330px)] object-contain" loading="eager" decoding="async" />
      <span className="sr-only">GLOBAL SHARES EARN {subtitle ?? copy[lang].tag}</span>
    </Link>
  );
}
