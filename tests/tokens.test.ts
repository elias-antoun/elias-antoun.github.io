import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/global.css', 'utf8');

const LIGHT_BLOCK = /:root\s*\{([^}]*)\}/;
const DARK_BLOCK = /\[data-theme='dark'\]\s*\{([^}]*)\}/;
const MEDIA_BLOCK =
  /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme='light'\]\)\s*\{([^}]*)\}/;

function block(pattern: RegExp): string {
  const match = css.match(pattern);
  if (!match) throw new Error(`token block not found for ${pattern}`);
  return match[1];
}

function tokenNames(pattern: RegExp): string[] {
  return [...block(pattern).matchAll(/(--[a-z-]+)\s*:/g)].map((m) => m[1]).sort();
}

function tokenValues(pattern: RegExp): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of block(pattern).matchAll(/(--[a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

const REQUIRED = [
  '--accent',
  '--accent-soft',
  '--bg',
  '--bg-alt',
  '--border',
  '--muted',
  '--on-accent',
  '--panel',
  '--text',
];

describe('design tokens', () => {
  it('defines every required token in the light :root block', () => {
    const light = tokenNames(LIGHT_BLOCK);
    for (const token of REQUIRED) {
      expect(light).toContain(token);
    }
  });

  it('redefines every light token in the dark attribute block', () => {
    const light = tokenNames(LIGHT_BLOCK);
    const dark = tokenNames(DARK_BLOCK);
    // Guard against both sides being empty, which would pass vacuously.
    expect(dark.length).toBeGreaterThanOrEqual(REQUIRED.length);
    expect(dark).toEqual(light);
  });

  it('redefines every light token under prefers-color-scheme dark', () => {
    const light = tokenNames(LIGHT_BLOCK);
    const media = tokenNames(MEDIA_BLOCK);
    expect(media.length).toBeGreaterThanOrEqual(REQUIRED.length);
    expect(media).toEqual(light);
  });

  it('keeps the attribute and media dark palettes identical', () => {
    expect(tokenValues(MEDIA_BLOCK)).toEqual(tokenValues(DARK_BLOCK));
  });
});

// WCAG 2.1 relative luminance and contrast ratio.
function luminance(hex: string): number {
  const channels = hex
    .replace('#', '')
    .match(/\w\w/g)!
    .map((h) => {
      const c = parseInt(h, 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('WCAG AA contrast in both palettes', () => {
  const palettes: Array<[string, Record<string, string>]> = [
    ['light', tokenValues(LIGHT_BLOCK)],
    ['dark', tokenValues(DARK_BLOCK)],
  ];

  // Every foreground/background pairing the components actually produce.
  const PAIRS: Array<[string, string]> = [
    ['--text', '--bg'],
    ['--text', '--bg-alt'],
    ['--text', '--panel'],
    ['--muted', '--bg'],
    ['--muted', '--bg-alt'],
    ['--muted', '--panel'],
    ['--accent', '--bg'],
    ['--accent', '--bg-alt'],
    ['--accent', '--panel'],
    // Chips print accent text on an accent-soft fill.
    ['--accent', '--accent-soft'],
    // Primary buttons and the skip link print on an accent fill.
    ['--on-accent', '--accent'],
  ];

  for (const [name, palette] of palettes) {
    for (const [fg, bg] of PAIRS) {
      it(`${name}: ${fg} on ${bg} meets 4.5:1`, () => {
        expect(palette[fg], `${name} palette missing ${fg}`).toBeDefined();
        expect(palette[bg], `${name} palette missing ${bg}`).toBeDefined();
        expect(contrast(palette[fg], palette[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('keeps card borders visible against the page', () => {
    // Borders separate a card from the page. They are paired with a shadow
    // rather than carrying meaning alone, so they do not need the full 3:1 of
    // WCAG 1.4.11 — but below roughly 1.4 the cards wash out entirely, which
    // is what made the earlier pass look unfinished.
    for (const [name, palette] of palettes) {
      expect(
        contrast(palette['--border'], palette['--bg']),
        `${name} border on bg`
      ).toBeGreaterThanOrEqual(1.4);
    }
  });

  it('flags plain white on the accent as insufficient in dark mode', () => {
    // Documents why --on-accent exists rather than a hardcoded white.
    const dark = tokenValues(DARK_BLOCK);
    expect(contrast('#ffffff', dark['--accent'])).toBeLessThan(4.5);
  });
});
