import { Link } from "@tanstack/react-router";
import { copy } from "@/lib/platform/i18n";
import { usePlatform } from "@/lib/platform/store";
import { cn } from "@/lib/utils";


export function Mark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-300/40 bg-gradient-to-br from-emerald-300 to-emerald-600 text-[11px] font-black tracking-tight text-[#062018] shadow-sm",
        className,
      )}
    >
      GS
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
