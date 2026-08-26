import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { RichText } from '@/features/la-so/components/rich-text';
import { cn } from '@/lib/utils';

/** Một mục gập trong danh sách luận giải. */
export interface AccordionEntry {
  readonly id: string;
  readonly title: string;
  /** Dòng phụ cạnh tiêu đề: cung nguồn, khoảng năm… */
  readonly meta: string;
  /** Nhãn nhỏ đánh dấu mục đang có hiệu lực, ví dụ `Chính vận`. */
  readonly badge?: string;
  readonly paragraphs: readonly string[];
}

function AccordionItem({
  entry,
  isOpen,
  onToggle,
}: {
  readonly entry: AccordionEntry;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}) {
  const bodyId = `${entry.id}-body`;

  return (
    <section className="mt-3 border border-[#c9a15c]/60 bg-[#f4ecd9]/50" id={entry.id}>
      <h5>
        <button
          aria-controls={bodyId}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-[#efe2c4]/60 focus-visible:ring-2 focus-visible:ring-[#a8281c]"
          onClick={onToggle}
          type="button"
        >
          <span className="font-display text-[21px] leading-[28px] font-bold text-[#7a1f15]">
            {entry.title}
          </span>
          <span className="font-body text-[13px] leading-[18px] text-[#8d6f42]">{entry.meta}</span>
          {entry.badge && (
            <span className="rounded-full bg-[#a8281c] px-[10px] py-[2px] font-body text-[12px] leading-[17px] font-semibold text-[#f5e8d0]">
              {entry.badge}
            </span>
          )}
          <span aria-hidden className="h-px flex-1 bg-[#c9a15c]/50" />
          <ChevronDown
            aria-hidden
            className={cn(
              'size-5 shrink-0 text-[#a8281c] transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </button>
      </h5>

      {/* Chuyển 0fr → 1fr chứ không đổi `height`: trình duyệt nội suy được đơn vị fr nên không phải
          đo chiều cao bằng JS, mà nội dung vẫn tự xuống dòng theo bề ngang. Khung con cần `min-h-0`
          thì ô lưới mới co được xuống dưới chiều cao nội dung. */}
      <div
        aria-hidden={!isOpen}
        className={cn(
          'grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        id={bodyId}
      >
        {/* Đệm nằm ở khung trong cùng: để trên ô lưới thì lúc gập nó vẫn chiếm chỗ, vì `min-h-0`
            chỉ ép phần nội dung về 0 chứ không ép phần đệm. */}
        <div
          className={cn(
            'min-h-0 transition-opacity duration-200 motion-reduce:transition-none',
            isOpen ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="px-4 pb-4">
            {entry.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="mt-2 font-body text-justify text-[17px] leading-[29px] text-[#2b2114]"
              >
                <RichText text={paragraph} />
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface LuanGiaiAccordionProps {
  readonly entries: readonly AccordionEntry[];
  /** Mục mở sẵn khi vừa vào, thường là mục đang có hiệu lực. */
  readonly defaultOpenId?: string;
}

/**
 * Danh sách mục gập, mở được nhiều mục cùng lúc: phần lớn người đọc chỉ tìm một hai mục họ cần, còn
 * ai muốn đọc hết thì bấm "Mở tất cả" một lần thay vì bấm từng cái.
 */
export function LuanGiaiAccordion({ entries, defaultOpenId }: LuanGiaiAccordionProps) {
  const [openIds, setOpenIds] = useState<readonly string[]>(defaultOpenId ? [defaultOpenId] : []);
  const isAllOpen = openIds.length === entries.length;

  const toggle = (id: string) =>
    setOpenIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="font-body text-[14px] leading-[20px] text-[#8d6f42]">
          {entries.length} mục · bấm để mở
        </p>
        <button
          className="font-body text-[14px] leading-[20px] font-semibold text-[#a8281c] underline-offset-4 outline-none hover:underline focus-visible:underline"
          onClick={() => setOpenIds(isAllOpen ? [] : entries.map((item) => item.id))}
          type="button"
        >
          {isAllOpen ? 'Thu gọn tất cả' : 'Mở tất cả'}
        </button>
      </div>

      {entries.map((entry) => (
        <AccordionItem
          key={entry.id}
          entry={entry}
          isOpen={openIds.includes(entry.id)}
          onToggle={() => toggle(entry.id)}
        />
      ))}
    </div>
  );
}
