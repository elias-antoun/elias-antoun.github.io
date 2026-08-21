import { describe, it, expect } from 'vitest';
import {
  decimalYear,
  spanToBar,
  axisTicks,
  pointToPercent,
  DEGREE_AXIS,
  NOW,
} from '../src/lib/timeline';

describe('decimalYear', () => {
  it('maps January to the year itself', () => {
    expect(decimalYear(2026, 1)).toBe(2026);
  });

  it('maps May 2026 to one third through the year', () => {
    expect(decimalYear(2026, 5)).toBeCloseTo(2026 + 4 / 12, 5);
  });
});

describe('spanToBar', () => {
  const axis = { from: 2020, to: 2024 };

  it('places a span covering the whole domain at full width', () => {
    expect(spanToBar({ start: 2020, end: 2024 }, axis)).toEqual({ left: 0, width: 100 });
  });

  it('places a mid-domain span proportionally', () => {
    expect(spanToBar({ start: 2021, end: 2022 }, axis)).toEqual({ left: 25, width: 25 });
  });

  it('clamps a span that starts before the domain', () => {
    expect(spanToBar({ start: 2018, end: 2021 }, axis)).toEqual({ left: 0, width: 25 });
  });

  it('clamps a span that ends after the domain', () => {
    expect(spanToBar({ start: 2023, end: 2030 }, axis)).toEqual({ left: 75, width: 25 });
  });

  it('never produces a negative width for a reversed span', () => {
    expect(spanToBar({ start: 2023, end: 2021 }, axis).width).toBe(0);
  });

  it('returns zero width for a degenerate domain', () => {
    expect(spanToBar({ start: 2021, end: 2022 }, { from: 2020, to: 2020 })).toEqual({
      left: 0,
      width: 0,
    });
  });

  it('rounds output so inline styles carry no float noise', () => {
    const { left, width } = spanToBar(
      { start: 2026 + 4 / 12, end: 2026 + 8 / 12 },
      { from: 2023.5, to: 2027.5 }
    );
    for (const value of [left, width]) {
      const decimals = (String(value).split('.')[1] ?? '').length;
      expect(decimals, `${value} has too many decimals`).toBeLessThanOrEqual(4);
    }
  });

  it('keeps every bar inside its track', () => {
    const { left, width } = spanToBar({ start: 2019, end: 2031 }, axis);
    expect(left).toBeGreaterThanOrEqual(0);
    expect(left + width).toBeLessThanOrEqual(100);
  });
});

describe('axisTicks', () => {
  it('lists whole years inside the domain', () => {
    expect(axisTicks({ from: 2023.5, to: 2027.5 })).toEqual([2024, 2025, 2026, 2027]);
  });

  it('includes an exact boundary year', () => {
    expect(axisTicks({ from: 2024, to: 2026 })).toEqual([2024, 2025, 2026]);
  });
});

describe('pointToPercent', () => {
  it('places the midpoint at 50%', () => {
    expect(pointToPercent(2022, { from: 2020, to: 2024 })).toBe(50);
  });

  it('clamps out-of-range points', () => {
    expect(pointToPercent(1999, { from: 2020, to: 2024 })).toBe(0);
    expect(pointToPercent(2099, { from: 2020, to: 2024 })).toBe(100);
  });
});

describe('degree axis configuration', () => {
  it('spans the degree from 2023 to graduation in 2027', () => {
    expect(DEGREE_AXIS.from).toBeLessThan(2024);
    expect(DEGREE_AXIS.to).toBeGreaterThanOrEqual(2027);
  });

  it('places the now marker inside the axis', () => {
    expect(NOW).toBeGreaterThan(DEGREE_AXIS.from);
    expect(NOW).toBeLessThan(DEGREE_AXIS.to);
  });
});
