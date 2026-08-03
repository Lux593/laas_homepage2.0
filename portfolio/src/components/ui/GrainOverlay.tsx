export default function GrainOverlay() {
  return (
    <>
      <svg className="fixed w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="grain-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves={3}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      <div
        className="grain-overlay"
        style={{ filter: "url(#grain-filter)" }}
        aria-hidden="true"
      />
    </>
  );
}
