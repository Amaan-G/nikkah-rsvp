interface ArchFrameProps {
  className?: string;
  stroke?: string;
  strokeWidth?: number;
  preserveAspectRatio?: string;
}

/**
 * A layered, pointed multifoil arch outline — evokes a mihrab silhouette.
 * Purely decorative; used behind hero copy and around the RSVP card.
 */
export function ArchFrame({
  className = "",
  stroke = "currentColor",
  strokeWidth = 1.5,
  preserveAspectRatio = "xMidYMid meet",
}: ArchFrameProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 560"
      fill="none"
      preserveAspectRatio={preserveAspectRatio}
      className={className}
    >
      <path
        d="M20 560V240C20 128 101 30 200 30C299 30 380 128 380 240V560"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <path
        d="M50 560V245C50 145 116 62 200 62C284 62 350 145 350 245V560"
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={0.55}
      />
      <path
        d="M200 30C200 30 175 95 200 130C225 95 200 30 200 30Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={0.8}
      />
    </svg>
  );
}
