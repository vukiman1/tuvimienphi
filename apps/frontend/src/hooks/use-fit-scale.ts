import { useLayoutEffect, useRef, useState } from 'react';

/** Tỉ lệ thu nhỏ để địa bàn vừa bề ngang khung chứa; không bao giờ phóng to quá khổ gốc. */
export function useFitScale(naturalWidth: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // useLayoutEffect chứ không phải useEffect: đăng ký quan sát trước khi trình duyệt vẽ, nếu không
  // khung hình đầu tiên sẽ vẽ ở tỉ lệ 1 rồi mới co lại, tạo một cú giật thấy rõ trên điện thoại.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / naturalWidth));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [naturalWidth]);

  return { ref, scale };
}
