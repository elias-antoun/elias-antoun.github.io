import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/global.css', 'utf8');

function tokensIn(blockPattern: RegExp): string[] {
  const block = css.match(blockPattern);
  if (!block) return [];
  return [...block[1].matchAll(/(--[a-z-]+)\s*:/g)].map((m) => m[1]).sort();
}

describe('design tokens', () => {
  const REQUIRED = ['--accent', '--bg', '--border', '--muted', '--surface', '--text'];

  it('defines every required token in the light :root block', () => {
    const light = tokensIn(/:root\s*\{([^}]*)\}/);
    for (const token of REQUIRED) {
      expect(light).toContain(token);
    }
  });

  it('redefines every light token in the dark attribute block', () => {
    const light = tokensIn(/:root\s*\{([^}]*)\}/);
    const dark = tokensIn(/\[data-theme='dark'\]\s*\{([^}]*)\}/);
    // Guard against both sides being empty, which would pass vacuously.
    expect(dark.length).toBeGreaterThanOrEqual(REQUIRED.length);
    expect(dark).toEqual(light);
  });

  it('redefines every light token under prefers-color-scheme dark', () => {
    const light = tokensIn(/:root\s*\{([^}]*)\}/);
    const media = tokensIn(
      /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme='light'\]\)\s*\{([^}]*)\}/
    );
    expect(media.length).toBeGreaterThanOrEqual(REQUIRED.length);
    expect(media).toEqual(light);
  });
});
