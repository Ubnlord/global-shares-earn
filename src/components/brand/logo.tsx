import { Link } from "@tanstack/react-router";
import { copy } from "@/lib/platform/i18n";
import { usePlatform } from "@/lib/platform/store";
import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <div className={cn("flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 p-1 shadow-sm sm:size-16", className)}>
      <img src={`${import.meta.env.BASE_URL}gse-logo.jpg`} alt="Global Shares Earn shield logo" className="h-full w-full object-contain" loading="eager" decoding="async" />
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
    <Link to={to} className="flex min-w-0 shrink items-center gap-3">
      <Mark className="size-12 sm:size-16" />
      <span className="min-w-0 text-[clamp(15px,3.4vw,28px)] font-extrabold leading-tight tracking-tight text-[#13b96b] [text-shadow:-1px_-1px_0_#020813,1px_-1px_0_#020813,-1px_1px_0_#020813,1px_1px_0_#020813]">
        GLOBAL SHARES EARN
        <span className="sr-only"> {subtitle ?? copy[lang].tag}</span>
      </span>
    </Link>
  );
}
