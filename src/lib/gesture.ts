/**
 * Gesture maths: momentum projection, rubber-banding, and velocity tracking.
 *
 * These are the pieces that make a release feel like a throw rather than a
 * snap, and an edge feel like resistance rather than a wall.
 */

/**
 * Where a flick would come to rest, given its release velocity.
 *
 * This is the exponential-decay form used for scroll deceleration — NOT the
 * physics-textbook v^2/(2a). Snapping to the nearest target from the *release
 * point* ignores intent; projecting first means a fast flick throws past a
 * nearby target, which is what makes it feel physical.
 *
 * @param velocity px per second at release
 * @param decelerationRate 0.998 for normal scroll feel, 0.99 for snappier
 * @returns signed distance travelled after release
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  const rate = Math.min(Math.max(decelerationRate, 0), 0.9999);
  return ((velocity / 1000) * rate) / (1 - rate);
}

/**
 * Progressive resistance past a boundary.
 *
 * Returns the distance the element should actually move, given how far past the
 * edge the pointer has gone. Approaches an asymptote, so the element never
 * quite keeps up and never fully stops — a hard stop reads as frozen.
 *
 * @param overshoot how far past the boundary the pointer is
 * @param dimension the size of the draggable surface
 * @param constant lower resists harder; 0.55 matches UIScrollView's feel
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  if (dimension <= 0) return 0;
  const magnitude = Math.abs(overshoot);
  const damped = (magnitude * dimension * constant) / (dimension + constant * magnitude);
  return overshoot < 0 ? -damped : damped;
}

export interface Sample {
  value: number;
  time: number;
}

/**
 * Rolling window of pointer samples, for velocity at release.
 *
 * The instantaneous delta between the last two events is far too noisy — a
 * pointer that paused for one frame before release would report ~0 velocity and
 * kill the throw. Averaging over a short window fixes that.
 */
export class VelocityTracker {
  private samples: Sample[] = [];

  constructor(private windowMs = 100) {}

  add(value: number, time: number): void {
    this.samples.push({ value, time });
    // Keep only samples inside the window, plus one just outside it so a slow
    // drag still has two points to differentiate.
    while (this.samples.length > 2 && time - this.samples[1].time > this.windowMs) {
      this.samples.shift();
    }
  }

  /** Velocity in units per second, 0 when there is not enough signal. */
  get velocity(): number {
    if (this.samples.length < 2) return 0;
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const dt = (last.time - first.time) / 1000;
    if (dt <= 0) return 0;
    return (last.value - first.value) / dt;
  }

  reset(): void {
    this.samples = [];
  }
}

/**
 * Pick the snap target nearest a projected endpoint.
 *
 * Returns the input point itself when given no targets, so a caller with a
 * free-form surface can use the projection directly.
 */
export function nearestSnapPoint(point: number, targets: number[]): number {
  if (targets.length === 0) return point;
  return targets.reduce((best, candidate) =>
    Math.abs(candidate - point) < Math.abs(best - point) ? candidate : best
  );
}
