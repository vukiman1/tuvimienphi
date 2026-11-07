import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { KIEN_THUC_PATH } from '../tet-hub-paths';

export function TetHubNotFound(): ReactElement {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-20 text-center md:px-6">
      <h1 className="text-[22px] font-semibold text-foreground">Không tìm thấy trang</h1>
      <p className="mt-3 text-[13px] text-muted-foreground">
        Trang tử vi theo tuổi bạn tìm không tồn tại hoặc chưa được đăng.
      </p>
      <Link
        to={KIEN_THUC_PATH}
        className="mt-8 inline-block text-[13px] font-medium text-primary hover:underline"
      >
        ← Về trang Kiến Thức
      </Link>
    </main>
  );
}
