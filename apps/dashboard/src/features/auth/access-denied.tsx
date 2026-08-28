import { ShieldAlert } from 'lucide-react';

/** Shown when the resolved session is not an admin (or there is no session in a production build).
 *  Framed as a "cổng huyền quan" (a mystic gate) rather than a bare error page. */
export function AccessDenied() {
  return (
    <div className="relative grid min-h-screen place-items-center bg-background px-6">
      <div className="night-sky" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md text-center">
        {/* Cinnabar seal — the gate character 關 (Quan). */}
        <div className="seal-stamp mx-auto size-20 text-4xl leading-none">關</div>
        <p className="font-seal mt-6 text-lg text-primary/80">Huyền Quan</p>
        <h1 className="text-glow mt-1 font-display text-3xl font-semibold">Cửa quản trị</h1>
        <div className="mx-auto mt-3 flex w-fit items-center gap-2">
          <span className="size-1.5 rotate-45 bg-primary/70" />
          <span className="rule-ornament w-20" />
          <span className="size-1.5 rotate-45 bg-primary/70" />
        </div>
        <p className="mt-4 text-muted-foreground">
          Cần ấn tín quản trị (quyền ADMIN) mới có thể qua cửa này. Xin đăng nhập bằng tài khoản có
          thẩm quyền.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm text-muted-foreground backdrop-blur">
          <ShieldAlert className="size-4 text-destructive" />
          Không đủ thẩm quyền truy cập
        </div>
      </div>
    </div>
  );
}
