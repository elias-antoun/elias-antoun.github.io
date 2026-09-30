export interface Inertable {
  inert: boolean;
}

/**
 * Make every element in `elements` inert except the ones in `keep`, and return
 * a function that undoes exactly what this call changed.
 *
 * `inert` rather than `aria-hidden`: it takes the background out of the
 * accessibility tree AND out of the tab order and hit-testing, so a modal does
 * not have to fake all three.
 *
 * Pass siblings, not ancestors. An element that is made inert disables its
 * whole subtree, so a dialog nested inside one of `elements` would be switched
 * off along with the page behind it. The modal's own container is what `keep`
 * is for.
 *
 * Elements that were already inert are left alone in both directions, so
 * restoring never wakes something another part of the page disabled on purpose.
 */
export function inertExcept<T extends Inertable>(
  elements: Iterable<T>,
  keep: readonly T[]
): () => void {
  const changed = [...elements].filter((el) => !keep.includes(el) && !el.inert);
  for (const el of changed) el.inert = true;
  return () => {
    for (const el of changed) el.inert = false;
  };
}
