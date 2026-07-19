export function RoughDefs() {
  return (
    <svg
      className="pointer-events-none absolute h-0 w-0"
      aria-hidden
      style={{ position: "absolute" }}
    >
      <defs>
        <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
        <marker
          id="sketch-arrow"
          viewBox="0 0 12 12"
          refX="9"
          refY="6"
          markerWidth="10"
          markerHeight="10"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,6 L0,12 L3,6 Z" fill="#111" />
        </marker>
      </defs>
    </svg>
  );
}
