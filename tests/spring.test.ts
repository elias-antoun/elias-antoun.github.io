import { describe, it, expect } from 'vitest';
import { Spring } from '../src/lib/spring';

/** Run a spring to rest (or until the step budget runs out). */
function settle(spring: Spring, dt = 1 / 60, maxSteps = 2000) {
  let steps = 0;
  let peak = spring.value;
  while (!spring.settled && steps < maxSteps) {
    spring.step(dt);
    if (Math.abs(spring.value) > Math.abs(peak)) peak = spring.value;
    steps++;
  }
  return { steps, seconds: steps * dt, peak };
}

describe('Spring', () => {
  it('starts at the from value, not the target', () => {
    const s = new Spring(100, { from: 0 });
    expect(s.value).toBe(0);
  });

  it('settles exactly on the target', () => {
    const s = new Spring(100, { from: 0, dampingRatio: 1, response: 0.3 });
    settle(s);
    expect(s.settled).toBe(true);
    expect(s.value).toBe(100);
    expect(s.currentVelocity).toBe(0);
  });

  it('does not overshoot when critically damped', () => {
    const s = new Spring(100, { from: 0, dampingRatio: 1, response: 0.4 });
    const { peak } = settle(s);
    // A tiny numerical margin; the point is there is no visible bounce.
    expect(peak).toBeLessThanOrEqual(100.5);
  });

  it('overshoots when under-damped', () => {
    const s = new Spring(100, { from: 0, dampingRatio: 0.5, response: 0.4 });
    const { peak } = settle(s);
    expect(peak).toBeGreaterThan(101);
  });

  it('is bouncier at lower damping ratios', () => {
    const soft = settle(new Spring(100, { from: 0, dampingRatio: 0.8, response: 0.4 })).peak;
    const bouncy = settle(new Spring(100, { from: 0, dampingRatio: 0.4, response: 0.4 })).peak;
    expect(bouncy).toBeGreaterThan(soft);
  });

  it('reaches the target sooner with a shorter response', () => {
    const fast = settle(new Spring(100, { from: 0, response: 0.2 })).seconds;
    const slow = settle(new Spring(100, { from: 0, response: 0.6 })).seconds;
    expect(fast).toBeLessThan(slow);
  });

  it('honours an initial velocity', () => {
    const thrown = new Spring(100, { from: 0, velocity: 400, response: 0.4 });
    const still = new Spring(100, { from: 0, velocity: 0, response: 0.4 });
    thrown.step(1 / 60);
    still.step(1 / 60);
    expect(thrown.value).toBeGreaterThan(still.value);
  });

  it('can be thrown away from its target by a strong opposing velocity', () => {
    const s = new Spring(0, { from: 0, velocity: 600, response: 0.4 });
    s.step(1 / 60);
    expect(s.value).toBeGreaterThan(0);
    settle(s);
    expect(s.value).toBe(0);
  });

  it('keeps position and velocity when retargeted mid-flight', () => {
    const s = new Spring(100, { from: 0, response: 0.4 });
    for (let i = 0; i < 10; i++) s.step(1 / 60);
    const positionBefore = s.value;
    const velocityBefore = s.currentVelocity;

    s.retarget(0);

    // No jump: the reversal continues from the live value and velocity.
    expect(s.value).toBe(positionBefore);
    expect(s.currentVelocity).toBe(velocityBefore);
    settle(s);
    expect(s.value).toBe(0);
  });

  it('can have velocity blended in on retarget', () => {
    const s = new Spring(100, { from: 0, response: 0.4 });
    s.step(1 / 60);
    s.retarget(0, -500);
    expect(s.currentVelocity).toBe(-500);
  });

  it('does not diverge on a long stalled frame', () => {
    // A backgrounded tab can hand back a multi-second dt; one big step with a
    // stiff spring would explode without subdivision.
    const s = new Spring(100, { from: 0, response: 0.15, dampingRatio: 1 });
    s.step(5);
    expect(Number.isFinite(s.value)).toBe(true);
    expect(Math.abs(s.value)).toBeLessThan(1000);
  });

  it('stays stable and bounded across the whole usable parameter range', () => {
    // The substep is derived from omega and zeta, so stability must not depend
    // on the caller picking friendly numbers. This asserts no divergence, not
    // fast settling: a heavily over-damped, slow spring legitimately creeps
    // toward its target for a long time.
    for (const response of [0.05, 0.1, 0.2, 0.3, 0.4, 0.8, 1.5]) {
      for (const dampingRatio of [0.2, 0.5, 0.8, 1, 1.5, 3]) {
        const s = new Spring(250, { from: -120, velocity: 3000, response, dampingRatio });
        const label = `response=${response} damping=${dampingRatio}`;
        let maxSeen = 0;
        for (let i = 0; i < 600; i++) {
          s.step(1 / 60);
          maxSeen = Math.max(maxSeen, Math.abs(s.value));
        }
        expect(Number.isFinite(s.value), label).toBe(true);
        // A 3000px/s throw at a target 370px away must not fling the value
        // orders of magnitude past it — that is what divergence looks like.
        expect(maxSeen, label).toBeLessThan(3000);
        // And it must be heading home, not oscillating forever.
        expect(Math.abs(s.value - 250), label).toBeLessThan(1);
      }
    }
  });

  it('treats a zero or negative dt as a no-op', () => {
    const s = new Spring(100, { from: 0 });
    s.step(0);
    expect(s.value).toBe(0);
    s.step(-1);
    expect(s.value).toBe(0);
  });

  it('adopts an external value via set()', () => {
    const s = new Spring(0, { from: 0 });
    s.set(42, 10);
    expect(s.value).toBe(42);
    expect(s.currentVelocity).toBe(10);
  });
});
