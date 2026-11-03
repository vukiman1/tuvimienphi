interface SectionHeadingProps {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
}

/**
 * Title plus a one-line subtitle. The subtitle is what ties a heading to the block under it —
 * without it two equally sized headings in the same band read as one flat list.
 */
export function SectionHeading({ id, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="flex flex-col items-center">
      <h2
        className="text-center text-[30px] leading-[40px] font-bold text-[#2a1f0e] md:text-[52px] md:leading-[64px]"
        id={id}
      >
        {title}
      </h2>
      <p className="mt-3 text-center text-[16px] leading-[24px] text-[#6b5a44] md:text-[22px] md:leading-[32px]">
        {subtitle}
      </p>
    </div>
  );
}
