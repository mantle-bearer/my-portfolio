export function AccentRings({ className = "" }: { className?: string }) {
  return (
    <span className={`portfolio-rings ${className}`.trim()} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}
