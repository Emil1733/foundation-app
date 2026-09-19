import Link from "next/link";

export default function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="FoundationRisk home" className="group inline-flex items-center gap-3.5 shrink-0">
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={compact ? "h-10 w-10 shrink-0" : "h-11 w-11 md:h-12 md:w-12 shrink-0"}
      >
        <defs>
          <linearGradient id="fr-blue" x1="36" y1="8" x2="56" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <path d="M8 17.5 31.5 5 55 17.5v6L31.5 11 8 23.5v-6Z" fill="#F8FAFC" />
        <path d="M8 25.5 31.5 13v8L16 29v9l15.5-8v7.5L16 45.5V53H8V25.5Z" fill="#F8FAFC" />
        <path d="M31.5 13 55 25.5V37c0 5.8-3.7 9.5-9.3 10.7L56 55h-12L31.5 45.5V30l8 4.2v6.2l3.8 2.1c2.5-.6 3.7-2.3 3.7-5.1v-7L31.5 22v-9Z" fill="url(#fr-blue)" />
        <path d="M4 55h56" stroke="#64748B" strokeWidth="2" />
        <path d="M14 55 31.5 49 50 55H14Z" fill="#334155" />
      </svg>

      <span className="flex flex-col min-w-0">
        <span className="whitespace-nowrap text-[17px] md:text-[20px] font-black leading-none tracking-[-0.045em] text-white">
          FOUNDATION<span className="text-blue-400">RISK</span>
        </span>
        {!compact && (
          <span className="mt-1.5 hidden sm:block whitespace-nowrap text-[8px] md:text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Foundation Evaluation &amp; Repair
          </span>
        )}
      </span>
    </Link>
  );
}
