export interface ProjectLike {
  data: {
    featured: boolean;
    order: number;
    title: string;
  };
}

/**
 * Split project entries into the two display tiers.
 *
 * `featured` renders as full cards in the grid; `compact` renders as one-line
 * entries in the "also built" list. Both tiers are sorted by `order`, with
 * title as a tiebreaker so the build output is stable.
 *
 * `.filter()` returns a new array, so the subsequent `.sort()` never mutates
 * the caller's input.
 */
export function partitionProjects<T extends ProjectLike>(
  entries: T[]
): { featured: T[]; compact: T[] } {
  const byOrder = (a: T, b: T) =>
    a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);

  return {
    featured: entries.filter((e) => e.data.featured).sort(byOrder),
    compact: entries.filter((e) => !e.data.featured).sort(byOrder),
  };
}
