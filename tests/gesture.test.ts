import { describe, it, expect } from 'vitest';
import { project, rubberband, nearestSnapPoint, VelocityTracker } from '../src/lib/gesture';

describe('project', () => {
  it('returns zero for zero velocity', () => {
    expect(project(0)).toBe(0);
  });

  it('projects further for faster flicks', () => {
    expect(project(2000)).toBeGreaterThan(project(500));
  });

  it('preserves direction', () => {
    expect(project(-800)).toBeLessThan(0);
    expect(project(800)).toBeGreaterThan(0);
  });

  it('is symmetric about zero', () => {
    expect(project(-800)).toBeCloseTo(-project(800), 6);
  });

  it('travels less with a snappier deceleration rate', () => {
    expect(Math.abs(project(1000, 0.99))).toBeLessThan(Math.abs(project(1000, 0.998)));
  });

  it('matches the reference exponential-decay form', () => {
    // v/1000 * d / (1 - d) with v = 1000, d = 0.998  ->  0.998 / 0.002 = 499
    expect(project(1000, 0.998)).toBeCloseTo(499, 6);
  });

  it('does not divide by zero at a deceleration rate of 1', () => {
    expect(Number.isFinite(project(1000, 1))).toBe(true);
  });
});

describe('rubberband', () => {
  it('returns zero at the boundary', () => {
    expect(rubberband(0, 400)).toBe(0);
  });

  it('always moves less than the pointer', () => {
    for (const overshoot of [10, 50, 200, 1000]) {
      expect(rubberband(overshoot, 400)).toBeLessThan(overshoot);
    }
  });

  it('resists progressively — each extra pixel of drag yields less movement', () => {
    const a = rubberband(50, 400) - rubberband(0, 400);
    const b = rubberband(150, 400) - rubberband(100, 400);
    expect(b).toBeLessThan(a);
  });

  it('preserves direction', () => {
    expect(rubberband(-100, 400)).toBeLessThan(0);
    expect(rubberband(-100, 400)).toBeCloseTo(-rubberband(100, 400), 6);
  });

  it('never fully stops — output keeps rising with input', () => {
    expect(rubberband(2000, 400)).toBeGreaterThan(rubberband(1000, 400));
  });

  it('resists harder with a smaller constant', () => {
    expect(rubberband(200, 400, 0.3)).toBeLessThan(rubberband(200, 400, 0.55));
  });

  it('returns zero for a degenerate dimension', () => {
    expect(rubberband(100, 0)).toBe(0);
  });
});

describe('nearestSnapPoint', () => {
  it('picks the closest target', () => {
    expect(nearestSnapPoint(120, [0, 200, 400])).toBe(200);
    expect(nearestSnapPoint(80, [0, 200, 400])).toBe(0);
  });

  it('returns the point itself when there are no targets', () => {
    expect(nearestSnapPoint(137, [])).toBe(137);
  });

  it('handles a single target', () => {
    expect(nearestSnapPoint(-50, [0])).toBe(0);
  });
});

describe('VelocityTracker', () => {
  it('reports zero with fewer than two samples', () => {
    const t = new VelocityTracker();
    expect(t.velocity).toBe(0);
    t.add(0, 0);
    expect(t.velocity).toBe(0);
  });

  it('computes velocity in units per second', () => {
    const t = new VelocityTracker();
    t.add(0, 0);
    t.add(100, 1000); // 100 units over 1s
    expect(t.velocity).toBeCloseTo(100, 6);
  });

  it('preserves direction', () => {
    const t = new VelocityTracker();
    t.add(100, 0);
    t.add(0, 500);
    expect(t.velocity).toBeLessThan(0);
  });

  it('averages over a window rather than the last two events', () => {
    // A pointer that pauses for one frame before release must still report a
    // throw; the instantaneous delta would read as zero and kill it.
    const t = new VelocityTracker(100);
    t.add(0, 0);
    t.add(30, 30);
    t.add(60, 60);
    t.add(60, 75); // stalled frame right before release
    expect(t.velocity).toBeGreaterThan(300);
  });

  it('discards samples older than the window', () => {
    const t = new VelocityTracker(100);
    t.add(0, 0);
    t.add(10, 50);
    t.add(1000, 5000); // long pause, then a jump
    // The stale first sample must not drag the average toward a slow speed.
    expect(t.velocity).toBeGreaterThan(0);
  });

  it('returns zero when all samples share a timestamp', () => {
    const t = new VelocityTracker();
    t.add(0, 100);
    t.add(50, 100);
    expect(t.velocity).toBe(0);
  });

  it('clears on reset', () => {
    const t = new VelocityTracker();
    t.add(0, 0);
    t.add(100, 100);
    t.reset();
    expect(t.velocity).toBe(0);
  });
});
