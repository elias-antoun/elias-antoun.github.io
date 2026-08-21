export interface Span {
  /** Decimal year, e.g. May 2026 is 2026 + 4/12. */
  start: number;
  end: number;
}

export interface AxisDomain {
  from: number;
  to: number;
}

/** Converts a calendar month to the decimal year used by spans. */
export function decimalYear(year: number, month: number): number {
  return year + (month - 1) / 12;
}

/** The degree window the experience axis spans: Sept 2023 through graduation. */
export const DEGREE_AXIS: AxisDomain = { from: 2023.5, to: 2027.5 };

/** Aug 2026 — the "now" marker. Update alongside the CV. */
export const NOW = decimalYear(2026, 8);

/**
 * Position a span on the axis as left/width percentages.
 *
 * Spans are clamped to the domain so an out-of-range date can never produce a
 * bar that overflows its track. A reversed span yields zero width rather than
 * a negative one.
 */
export function spanToBar(span: Span, axis: AxisDomain = DEGREE_AXIS): {
  left: number;
  width: number;
} {
  const total = axis.to - axis.from;
  if (total <= 0) return { left: 0, width: 0 };

  const clamp = (v: number) => Math.min(Math.max(v, axis.from), axis.to);
  const start = clamp(span.start);
  const end = clamp(span.end);

  const left = ((start - axis.from) / total) * 100;
  const width = Math.max(0, ((end - start) / total) * 100);
  return { left, width };
}

/** Whole years inside the domain, for axis gridlines and labels. */
export function axisTicks(axis: AxisDomain = DEGREE_AXIS): number[] {
  const ticks: number[] = [];
  for (let year = Math.ceil(axis.from); year <= Math.floor(axis.to); year++) {
    ticks.push(year);
  }
  return ticks;
}

/** Position a single point on the axis as a percentage. */
export function pointToPercent(value: number, axis: AxisDomain = DEGREE_AXIS): number {
  const total = axis.to - axis.from;
  if (total <= 0) return 0;
  const clamped = Math.min(Math.max(value, axis.from), axis.to);
  return ((clamped - axis.from) / total) * 100;
}
