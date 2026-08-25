import { useLayoutEffect, useRef, useState } from 'react';
import type { ChartView, CungView } from '@/features/la-so/chart-types';
import {
  BOARD_SIZE,
  CUNG_GRID_POSITIONS,
  centerAnchor,
  centerAnchorLabel,
  nhiHopIndex,
  sharedEdge,
  tamHopIndexes,
  xungChieuIndex,
} from '@/features/la-so/board-layout';
import { CHART_RULE_CLASS } from '@/features/la-so/chart-colors';
import { CungCard } from '@/features/la-so/components/cung-card';
import { ThienBan } from '@/features/la-so/components/thien-ban';

interface LaSoBoardProps {
  readonly chart: ChartView;
  readonly selectedIndex: number;
  readonly onSelect: (cungIndex: number) => void;
}

const CENTER_AREA = { gridRow: '2 / span 2', gridColumn: '2 / span 2' } as const;

/**
 * Địa bàn dựng ở một khổ cố định rồi thu nhỏ cho vừa khung, thay vì co giãn theo bề ngang. Bố cục
 * lá số không chịu được co giãn: ô giữa chiếm 2/4 bề ngang, hẹp một chút là thiên bàn xuống dòng và
 * tên sao bị cắt. Thu nhỏ cả khối giữ nguyên tỉ lệ, đọc không rõ thì người dùng tự phóng to.
 */
const BOARD_WIDTH = 812;
/** Ô cung là chữ nhật đứng, vừa đủ chứa cung nhiều sao nhất (9 sao một cột). */
const BOARD_ROW_HEIGHT = 258;
const BOARD_HEIGHT = BOARD_SIZE * BOARD_ROW_HEIGHT;

const TAM_HOP_STROKE = '#7b6ca8';
const XUNG_CHIEU_STROKE = '#c0564b';
const STROKE_WIDTH = 0.008;

function blockedPair(chart: ChartView, has: (cung: CungView) => boolean) {
  const indexes = chart.cungs.filter(has).map((cung) => cung.index);
  return indexes.length === 2 ? ([indexes[0], indexes[1]] as const) : null;
}

function BlockLabel({
  label,
  at,
}: {
  readonly label: string;
  readonly at: { left: string; top: string };
}) {
  return (
    <span
      className={`pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 px-[10px] py-[1px] text-[11px] leading-[15px] font-bold text-white ${CHART_RULE_CLASS.blockLabel}`}
      style={at}
    >
      {label}
    </span>
  );
}

/** Nhãn địa chi đặt quanh viền thiên bàn, ngay tại điểm neo của cung tương ứng. */
function ChiLabel({ cung, isActive }: { readonly cung: CungView; readonly isActive: boolean }) {
  const { left, top, transform } = centerAnchorLabel(cung.index);
  return (
    <span
      className={`pointer-events-none absolute z-20 text-[11px] leading-[14px] ${
        isActive ? 'font-bold text-[#8a2b22]' : 'font-medium text-[#5b5347]'
      }`}
      style={{ left, top, transform }}
    >
      {cung.chi}
    </span>
  );
}

/** Tỉ lệ thu nhỏ để địa bàn vừa bề ngang khung chứa; không bao giờ phóng to quá khổ gốc. */
function useFitScale(naturalWidth: number) {
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

export function LaSoBoard({ chart, selectedIndex, onSelect }: LaSoBoardProps) {
  const { ref: fitRef, scale } = useFitScale(BOARD_WIDTH);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Rê chuột tới đâu thì tam hợp / xung chiếu đổi theo tới đó; buông ra thì quay về cung đang chọn.
  const focusedIndex = hoveredIndex ?? selectedIndex;
  const tuan = blockedPair(chart, (cung) => cung.hasTuan);
  const triet = blockedPair(chart, (cung) => cung.hasTriet);
  const tamHop = tamHopIndexes(focusedIndex);
  const xungChieu = xungChieuIndex(focusedIndex);
  // Nhị hợp cũng sáng theo nhưng không kẻ dây: hai cung nhị hợp luôn kề nhau, kẻ thêm một đoạn
  // ngắn xíu chỉ làm rối chứ chẳng nói thêm được gì.
  const related = new Set([...tamHop, xungChieu, nhiHopIndex(focusedIndex)]);
  // Tô nền và làm mờ chỉ xảy ra khi đang rê chuột: lúc không rê, lá số phải phẳng đều như bản in.
  const isSpotlight = hoveredIndex !== null;

  // Tam hợp vẽ thành tam giác khép kín, cộng thêm một dây nối sang cung xung chiếu.
  const triangle = [focusedIndex, ...tamHop].map(centerAnchor);
  const tamHopEdges = triangle.map((point, index) => [point, triangle[(index + 1) % 3]] as const);

  return (
    <div className="w-full" ref={fitRef}>
      {/* Khối đệm mang kích thước đã thu nhỏ, vì transform không làm thay đổi chỗ chiếm của phần tử. */}
      <div className="mx-auto" style={{ width: BOARD_WIDTH * scale, height: BOARD_HEIGHT * scale }}>
        <div
          className={`relative grid origin-top-left font-chart ${CHART_RULE_CLASS.fill}`}
          style={{
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            transform: `scale(${scale})`,
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, ${BOARD_ROW_HEIGHT}px)`,
          }}
        >
          {chart.cungs.map((cung) => (
            <div
              key={cung.index}
              className="min-w-0"
              style={{
                gridRow: CUNG_GRID_POSITIONS[cung.index].row,
                gridColumn: CUNG_GRID_POSITIONS[cung.index].column,
              }}
            >
              <CungCard
                cung={cung}
                isDimmed={isSpotlight && cung.index !== focusedIndex && !related.has(cung.index)}
                isFocused={isSpotlight && cung.index === focusedIndex}
                isRelated={isSpotlight && related.has(cung.index)}
                isSelected={cung.index === selectedIndex}
                onFocusCung={setHoveredIndex}
                onSelect={onSelect}
              />
            </div>
          ))}

          <div className="relative z-10 min-w-0" style={CENTER_AREA}>
            <ThienBan meta={chart.meta} />
          </div>

          {tuan && <BlockLabel at={sharedEdge(tuan)} label="Tuần" />}
          {triet && <BlockLabel at={sharedEdge(triet)} label="Triệt" />}

          {chart.cungs.map((cung) => (
            <ChiLabel
              key={cung.index}
              cung={cung}
              isActive={cung.index === focusedIndex || related.has(cung.index)}
            />
          ))}

          {/* Nằm trên thiên bàn nên phải để pointer-events-none, kẻo nuốt mất click chọn cung. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[15] h-full w-full"
            preserveAspectRatio="none"
            viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
          >
            {tamHopEdges.map(([from, to]) => (
              <line
                key={`${from.x},${from.y}-${to.x},${to.y}`}
                stroke={TAM_HOP_STROKE}
                strokeOpacity="0.8"
                strokeWidth={STROKE_WIDTH}
                x1={from.x}
                x2={to.x}
                y1={from.y}
                y2={to.y}
              />
            ))}
            <line
              stroke={XUNG_CHIEU_STROKE}
              strokeOpacity="0.85"
              strokeWidth={STROKE_WIDTH}
              x1={triangle[0].x}
              x2={centerAnchor(xungChieu).x}
              y1={triangle[0].y}
              y2={centerAnchor(xungChieu).y}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
