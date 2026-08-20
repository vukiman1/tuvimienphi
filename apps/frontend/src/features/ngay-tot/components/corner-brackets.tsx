const CORNER_POSITIONS = [
  { key: 'top-left', className: 'top-1.5 left-1.5' },
  { key: 'top-right', className: 'top-1.5 right-1.5 rotate-90' },
  { key: 'bottom-right', className: 'right-1.5 bottom-1.5 rotate-180' },
  { key: 'bottom-left', className: 'bottom-1.5 left-1.5 -rotate-90' },
] as const;

/** The four gold brackets that frame a card, drawn rather than sliced from artwork. */
export function CornerBrackets({ className }: { readonly className?: string }) {
  return (
    <>
      {CORNER_POSITIONS.map((corner) => (
        <svg
          aria-hidden
          className={`pointer-events-none absolute size-5 ${corner.className} ${className ?? 'text-[#c9a15c]/70'}`}
          fill="none"
          key={corner.key}
          stroke="currentColor"
          strokeWidth={1.25}
          viewBox="0 0 24 24"
        >
          <path d="M1 9V1h8" />
          <path d="M5 13V5h8" />
        </svg>
      ))}
    </>
  );
}
