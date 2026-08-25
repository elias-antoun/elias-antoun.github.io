/**
 * A velocity-aware, interruptible spring.
 *
 * Parameterised the way Apple's design tooling exposes it — damping ratio and
 * response — rather than the physics triplet of mass/stiffness/damping, because
 * those two are the ones you can actually reason about while designing:
 *
 *   dampingRatio  1.0  = critically damped, settles with no overshoot
 *                 <1.0 = overshoots and oscillates; lower is bouncier
 *   response      seconds to substantially reach the target. NOT a duration —
 *                 a spring has no fixed duration; settle time emerges.
 *
 * Mapping to the underlying ODE:
 *   omega = 2*pi / response      (undamped angular frequency)
 *   k     = omega^2              (stiffness)
 *   c     = 2 * zeta * omega     (damping coefficient)
 *
 * The spring integrates x'' = -k(x - target) - c*x' with semi-implicit Euler.
 * Retargeting mid-flight keeps the current position AND velocity, which is what
 * makes a gesture reversal continuous instead of hitting a "brick wall".
 */
export interface SpringOptions {
  /** 1.0 = no overshoot. Below 1.0 bounces. */
  dampingRatio?: number;
  /** Seconds to substantially reach the target. */
  response?: number;
  /** Starting position. */
  from?: number;
  /** Starting velocity, in units per second. */
  velocity?: number;
}

const POSITION_EPSILON = 0.05;
const VELOCITY_EPSILON = 0.05;

/**
 * Longest wall-clock time a single step() will simulate.
 *
 * A backgrounded tab hands back a multi-second dt. Simulating all of it is both
 * pointless (nobody saw those frames) and expensive, so we advance a few frames
 * at most and let the spring continue from there.
 */
const MAX_FRAME = 0.064;

export class Spring {
  private target: number;
  private position: number;
  private vel: number;
  private omega: number;
  private zeta: number;
  private maxStep: number;

  constructor(target: number, options: SpringOptions = {}) {
    const { dampingRatio = 1, response = 0.4, from = target, velocity = 0 } = options;
    this.target = target;
    this.position = from;
    this.vel = velocity;
    this.zeta = Math.max(0, dampingRatio);
    this.omega = (2 * Math.PI) / Math.max(0.0001, response);

    // Semi-implicit Euler is only conditionally stable. The stiffness term
    // needs h < 2/omega; the damping term needs h < 2/(2*zeta*omega). Take the
    // binding constraint with a safety factor, so a stiff or heavily damped
    // spring cannot blow up regardless of the parameters handed in.
    const stiffnessLimit = 2 / this.omega;
    const dampingLimit = this.zeta > 0 ? 1 / (this.zeta * this.omega) : Infinity;
    this.maxStep = 0.5 * Math.min(stiffnessLimit, dampingLimit);
  }

  /** Current on-screen value. Always animate from this, never from the target. */
  get value(): number {
    return this.position;
  }

  get currentVelocity(): number {
    return this.vel;
  }

  get settled(): boolean {
    return (
      Math.abs(this.target - this.position) < POSITION_EPSILON &&
      Math.abs(this.vel) < VELOCITY_EPSILON
    );
  }

  /**
   * Point the spring at a new target, preserving position and velocity.
   *
   * This is the interruption path: a user grabbing a moving element and
   * reversing it re-targets, and the motion stays continuous because velocity
   * carries through rather than being reset to zero.
   */
  retarget(target: number, velocity?: number): void {
    this.target = target;
    if (velocity !== undefined) this.vel = velocity;
  }

  /** Hard reset — use when adopting a value from outside the simulation. */
  set(position: number, velocity = 0): void {
    this.position = position;
    this.vel = velocity;
  }

  /** Advance the simulation by `dt` seconds. Returns the new position. */
  step(dt: number): number {
    // Subdivide the frame; one big step with a stiff spring diverges.
    let remaining = Math.min(Math.max(0, dt), MAX_FRAME);
    while (remaining > 0) {
      const h = Math.min(remaining, this.maxStep);
      const k = this.omega * this.omega;
      const c = 2 * this.zeta * this.omega;
      const accel = -k * (this.position - this.target) - c * this.vel;
      this.vel += accel * h;
      this.position += this.vel * h;
      remaining -= h;
    }

    if (this.settled) {
      this.position = this.target;
      this.vel = 0;
    }
    return this.position;
  }
}
