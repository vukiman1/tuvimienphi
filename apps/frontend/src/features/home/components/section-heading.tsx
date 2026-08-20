interface SectionHeadingProps {
  readonly id: string;
  readonly title: string;
}

/**
 * Title plus a short gold rule. The rule is what ties a heading to the block under it — without it
 * two equally sized headings in the same band read as one flat list.
 */
export function SectionHeading({ id, title }: SectionHeadingProps) {
  return (
    <div className="flex flex-col items-center">
      <h2
        className="text-center font-display text-3xl font-bold tracking-wide text-[#2a1f0e] uppercase md:text-4xl"
        id={id}
      >
        {title}
      </h2>
      <span
        aria-hidden
        className="mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#c9a15c] to-transparent"
      />
    </div>
  );
}
