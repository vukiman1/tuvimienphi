import { BirthForm } from '@/features/la-so/components/birth-form';
import { MEDIA } from '@/config/media';

/** Vào thẳng `/la-so` mà chưa có thông tin sinh thì hỏi ngay tại đây, khỏi bắt quay về trang chủ. */

const PANEL_WOOD = {
  backgroundImage: `url('${MEDIA.home.woodPanel}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#2a1a0e',
} as const;

export function BirthPrompt() {
  return (
    <main className="mx-auto w-full max-w-[680px] px-4 py-12 text-center md:py-20">
      <h1 className="font-display text-4xl font-bold text-foreground">Lập Lá Số Tử Vi</h1>
      <p className="mx-auto mt-2 max-w-[46ch] text-sm text-muted-foreground">
        Nhập ngày giờ sinh để an lá số. Giờ sinh càng chính xác thì cung Mệnh và cung Thân càng
        đúng.
      </p>

      <div
        className="mt-8 rounded-2xl border-2 border-[#c9a15c]/80 p-1.5 shadow-2xl"
        style={PANEL_WOOD}
      >
        <div className="rounded-xl border border-[#c9a15c]/45 px-4 py-5 text-left md:px-6 md:py-6">
          <BirthForm />
        </div>
      </div>
    </main>
  );
}
