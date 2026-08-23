/**
 * A horizontal band of pointed Islamic arches used as a seam between two
 * sections — filled with the color of the section below so the boundary
 * reads as an arcade silhouette rather than a hard rectangular edge.
 */
interface ArchDividerProps {
  fill: string;
  className?: string;
  count?: number;
  height?: number;
  flip?: boolean;
}

function buildArchPath(width: number, height: number, count: number): string {
  const archWidth = width / count;
  const archHeight = height * 0.82;
  const h1 = archHeight * 0.5;
  const baseY = height;
  const apexY = height - archHeight;

  let d = `M0 ${baseY} `;
  for (let i = 0; i < count; i++) {
    const x0 = i * archWidth;
    const xm = x0 + archWidth / 2;
    const x1 = x0 + archWidth;
    d += `C${x0} ${baseY - h1} ${xm - archWidth * 0.08} ${apexY} ${xm} ${apexY} `;
    d += `C${xm + archWidth * 0.08} ${apexY} ${x1} ${baseY - h1} ${x1} ${baseY} `;
  }
  d += `L${width} ${height} L0 ${height} Z`;
  return d;
}

export function ArchDivider({
  fill,
  className = "",
  count = 7,
  height = 72,
  flip = false,
}: ArchDividerProps) {
  const width = 1200;
  const path = buildArchPath(width, height, count);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none w-full leading-[0] ${flip ? "rotate-180" : ""} ${className}`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="block w-full"
        style={{ height }}
      >
        <path d={path} fill={fill} />
      </svg>
    </div>
  );
}
