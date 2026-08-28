import { BrandMark } from '@/features/admin/layout/brand-mark';

// 12 địa chi (earthly branches) — the zodiac ring of a luopan.
const CHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SIZE = 132;
const R = 54;

/** Branded loading state — a luopan dial: 12 zodiac branches around a pulsing gold sigil with a
 *  slowly sweeping needle. */
export function PageLoader() {
  return (
    <div className="grid min-h-[60vh] w-full place-items-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          {/* Dial rings */}
          <div className="absolute inset-0 rounded-full border border-border" />
          <div className="absolute inset-[14%] rounded-full border border-border/60" />

          {/* 12 branches */}
          {CHI.map((c, i) => {
            const a = (i * 30 - 90) * (Math.PI / 180);
            return (
              <span
                key={c}
                className="font-seal absolute text-sm text-primary/70"
                style={{
                  left: SIZE / 2 + Math.cos(a) * R,
                  top: SIZE / 2 + Math.sin(a) * R,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {c}
              </span>
            );
          })}

          {/* Sweeping needle */}
          <div className="animate-orbit absolute inset-0">
            <span className="absolute top-[10%] left-1/2 h-[40%] w-px -translate-x-1/2 bg-gradient-to-b from-primary to-transparent" />
          </div>

          {/* Center sigil */}
          <div className="animate-glow-pulse absolute inset-[34%] grid place-items-center rounded-full bg-primary/10 text-primary">
            <BrandMark className="size-6" />
          </div>
        </div>

        <p className="font-label text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Đang lập quẻ…
        </p>
      </div>
    </div>
  );
}
