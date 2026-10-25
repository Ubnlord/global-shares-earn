import { Link } from "@tanstack/react-router";
import { copy } from "@/lib/platform/i18n";
import { usePlatform } from "@/lib/platform/store";
import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <div className={cn("flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 p-1 shadow-sm", className)}>
      <img src="/gse-logo.jpg" alt="Global Shares Earn" className="h-full w-full object-contain" loading="eager" decoding="async" />
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
      <Mark />
      <div className="min-w-0">
        <div className="truncate text-sm font-bold leading-none tracking-tight text-fg">
          GLOBAL SHARES EARN
        </div>
        <div className="mt-0.5 hidden text-[10px] leading-none text-subtle sm:block">
          {subtitle ?? copy[lang].tag}
        </div>
      </div>
    </Link>
  );
}
