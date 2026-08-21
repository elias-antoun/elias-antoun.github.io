import { describe, it, expect } from 'vitest';
import { resolveInitialTheme } from '../src/lib/theme';

describe('resolveInitialTheme', () => {
  it('honours a stored light choice even when the system prefers dark', () => {
    expect(resolveInitialTheme('light', true)).toBe('light');
  });

  it('honours a stored dark choice even when the system prefers light', () => {
    expect(resolveInitialTheme('dark', false)).toBe('dark');
  });

  it('follows the system preference when nothing is stored', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme(null, false)).toBe('light');
  });

  it('falls back to light for unrecognised stored values', () => {
    expect(resolveInitialTheme('banana', false)).toBe('light');
    expect(resolveInitialTheme('', false)).toBe('light');
  });

  it('prefers the system signal over an unrecognised stored value', () => {
    expect(resolveInitialTheme('banana', true)).toBe('dark');
  });
});
