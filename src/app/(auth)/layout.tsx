import { IconRadar } from "@/components/icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(201,162,75,0.08), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
            <IconRadar width={24} height={24} />
          </div>
          <div>
            <h1 className="font-display text-2xl text-sand">Market Radar USA</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-sand-muted">
              Inteligência de mercado privada
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
