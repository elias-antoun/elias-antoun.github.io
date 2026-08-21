export type Theme = 'light' | 'dark';

/**
 * Resolve the theme to apply on first paint.
 *
 * An explicit stored choice always wins. Otherwise the system preference
 * decides. Light is the final fallback, matching the site's default palette.
 *
 * The inline bootstrap script in Layout.astro mirrors this logic because it
 * must run before any module loads. This function is its specification —
 * keep the two in step.
 */
export function resolveInitialTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}
