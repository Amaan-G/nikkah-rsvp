interface OrnamentProps {
  className?: string;
}

/** Small centered flourish used above section headings. */
export function Ornament({ className = "" }: OrnamentProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 24"
      className={`mx-auto h-5 w-40 ${className}`}
      fill="none"
    >
      <path d="M0 12H62" stroke="currentColor" strokeWidth="1" />
      <path d="M98 12H160" stroke="currentColor" strokeWidth="1" />
      <path
        d="M80 2L88 12L80 22L72 12L80 2Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <circle cx="80" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}
