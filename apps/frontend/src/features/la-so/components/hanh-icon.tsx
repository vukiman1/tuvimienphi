import type { ReactElement } from 'react';
import type { NguHanh } from '@org/shared-tu-vi';
import { hanhIconUrl } from '@/config/media';

const HANH_ICON_URL: Readonly<Record<NguHanh, string>> = {
  Kim: hanhIconUrl('kim'),
  Mộc: hanhIconUrl('moc'),
  Thủy: hanhIconUrl('thuy'),
  Hỏa: hanhIconUrl('hoa'),
  Thổ: hanhIconUrl('tho'),
};

export function HanhIcon({ element }: { readonly element: NguHanh }): ReactElement {
  return (
    <img
      alt=""
      className="size-8 shrink-0 rounded-full"
      decoding="async"
      loading="lazy"
      src={HANH_ICON_URL[element]}
    />
  );
}
