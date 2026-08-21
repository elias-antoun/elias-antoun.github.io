/**
 * Derive the monogram shown on a project card that has no cover image.
 *
 * Multi-word titles use word initials ("Robot Perception Manager" -> "RPM").
 * Single-word titles fall back to their internal capitals, because word
 * initials would yield a lone letter ("InMindCNN" -> "IMC", not "I"). A
 * single lowercase word uses its first two characters.
 */
export function initialsFor(title: string): string {
  const words = title.split(/\s+/).filter((word) => /^[A-Za-z]/.test(word));

  if (words.length > 1) {
    return words
      .slice(0, 3)
      .map((word) => word[0].toUpperCase())
      .join('');
  }

  const single = words[0] ?? '';
  const capitals = single.replace(/[^A-Z]/g, '');
  if (capitals.length >= 2) return capitals.slice(0, 3);
  return single.slice(0, 2).toUpperCase();
}

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
