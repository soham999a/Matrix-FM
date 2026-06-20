const MARK = "M";

export function MatrixMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`matrix-mark mark-gold ${className}`}
      aria-label="MATRIX"
    >
      {MARK}
    </span>
  );
}
