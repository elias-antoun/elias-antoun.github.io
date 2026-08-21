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
  '--ink',
  '--ink-soft',
  '--on-signal',
  '--paper',
  '--panel',
  '--raw',
  '--rule',
  '--signal',
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

  it('declares three distinct type roles', () => {
    expect(css).toMatch(/--font-display:/);
    expect(css).toMatch(/--font-body:/);
    expect(css).toMatch(/--font-mono:/);
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

/** Hue in degrees, 0–360. */
function hue(hex: string): number {
  const [r, g, b] = hex
    .replace('#', '')
    .match(/\w\w/g)!
    .map((h) => parseInt(h, 16) / 255);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (delta === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  return ((h * 60) + 360) % 360;
}

/** Shortest angular distance between two hues, 0–180 degrees. */
function hueDistance(a: string, b: string): number {
  const diff = Math.abs(hue(a) - hue(b)) % 360;
  return diff > 180 ? 360 - diff : diff;
}

describe('WCAG AA contrast in both palettes', () => {
  const palettes: Array<[string, Record<string, string>]> = [
    ['light', tokenValues(LIGHT_BLOCK)],
    ['dark', tokenValues(DARK_BLOCK)],
  ];

  // Every foreground/background pairing the components actually produce.
  const PAIRS: Array<[string, string]> = [
    ['--ink', '--paper'],
    ['--ink', '--panel'],
    ['--ink-soft', '--paper'],
    ['--ink-soft', '--panel'],
    ['--signal', '--paper'],
    ['--signal', '--panel'],
    ['--raw', '--paper'],
    ['--raw', '--panel'],
    // Buttons and the skip link paint text on a signal fill.
    ['--on-signal', '--signal'],
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

  it('meets WCAG 1.4.11 non-text contrast for timeline track bars', () => {
    // The bars encode role duration, so they are meaningful graphics and need
    // 3:1 against the page — a hairline border does not qualify.
    for (const [name, palette] of palettes) {
      expect(palette['--track'], `${name} palette missing --track`).toBeDefined();
      expect(contrast(palette['--track'], palette['--paper']), name).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps track bars quieter than the primary signal fill', () => {
    // Secondary roles must be perceivable without competing with internships.
    for (const [name, palette] of palettes) {
      const track = contrast(palette['--track'], palette['--paper']);
      const signal = contrast(palette['--signal'], palette['--paper']);
      expect(track, name).toBeLessThan(signal);
    }
  });

  it('flags plain white on the signal fill as insufficient in dark mode', () => {
    // Documents why --on-signal exists rather than a hardcoded white.
    const dark = tokenValues(DARK_BLOCK);
    expect(contrast('#ffffff', dark['--signal'])).toBeLessThan(4.5);
  });

  it('separates raw and signal by hue, not by luminance', () => {
    // They encode opposite meanings and sit side by side, so they must differ
    // strongly in hue. Luminance is deliberately close so neither dominates —
    // which is why the traces are ALSO differentiated by line weight and dash
    // pattern in SignalTrace.astro. Colour alone never carries the meaning.
    for (const [name, palette] of palettes) {
      expect(palette['--raw'], name).not.toBe(palette['--signal']);
      expect(hueDistance(palette['--raw'], palette['--signal']), name).toBeGreaterThan(90);
    }
  });
});
