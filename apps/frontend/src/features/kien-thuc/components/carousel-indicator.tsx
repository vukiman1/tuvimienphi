interface CarouselIndicatorProps {
  /** Number of slides. */
  readonly count: number;
  readonly active?: number;
  /** Called when a dot is clicked to jump to that slide. */
  readonly onSelect?: (index: number) => void;
}

/** The featured-article carousel dots — clickable to jump between featured articles. */
export function CarouselIndicator({ count, active = 0, onSelect }: CarouselIndicatorProps) {
  if (count <= 1) return null;
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Xem bài viết nổi bật ${index + 1}`}
          aria-current={index === active}
          onClick={() => onSelect?.(index)}
          className={
            index === active
              ? 'size-2.5 rounded-full bg-[#9e2b1e] transition-all'
              : 'size-2 rounded-full bg-[#d8c6a5] transition-all hover:bg-[#c9a15c]'
          }
        />
      ))}
    </div>
  );
}
