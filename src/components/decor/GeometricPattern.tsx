import { useId } from "react";

/**
 * A subtle tiled Islamic geometric star-and-cross lattice, used as ambient
 * background texture. Kept very low-opacity so it reads as texture, not noise.
 */
interface GeometricPatternProps {
  color?: string;
  opacity?: number;
  size?: number;
  className?: string;
}

export function GeometricPattern({
  color = "currentColor",
  opacity = 0.08,
  size = 64,
  className = "",
}: GeometricPatternProps) {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={`geo-${id}`}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(0)"
        >
          <g stroke={color} strokeWidth="1" fill="none">
            <path
              d={`M0 ${size / 2} L${size / 2} 0 L${size} ${size / 2} L${size / 2} ${size} Z`}
            />
            <circle cx={size / 2} cy={size / 2} r={size * 0.18} />
            <path d={`M0 0 L${size} ${size}`} opacity={0.5} />
            <path d={`M${size} 0 L0 ${size}`} opacity={0.5} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#geo-${id})`} />
    </svg>
  );
}
