import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';

const DIST = 'dist';
const INDEX = join(DIST, 'index.html');

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

let pages: Array<{ path: string; raw: string; dom: HTMLElement }>;
const index = () => pages.find((p) => p.path === INDEX)!;

beforeAll(() => {
  if (!existsSync(DIST)) {
    throw new Error('dist/ not found — run `npm run build` before this suite');
  }
  pages = htmlFiles(DIST).map((path) => {
    const raw = readFileSync(path, 'utf8');
    return { path, raw, dom: parse(raw) };
  });
  if (pages.length === 0) throw new Error('no HTML files found in dist/');
});

describe('build output', () => {
  it('emits the index page and the 404 page', () => {
    const names = pages.map((p) => p.path);
    expect(names).toContain(INDEX);
    expect(names).toContain(join(DIST, '404.html'));
  });
});

describe('privacy and confidentiality', () => {
  const FORBIDDEN: Array<[string, RegExp]> = [
    ['phone number', /79179277/],
    ['dialling prefix', /\+\s*961/],
    ['home city', /Zouk\s*Mosbeh/i],
    ['confidential repo', /harness-bench/i],
    ['client bucket', /anb-pap/i],
    ['s3 URI', /s3:\/\//i],
    ['forked repo academy-bot-slam', /academy-bot-slam/i],
    ['forked repo Robotics-S01', /Robotics-S01/i],
  ];

  it('leaks nothing forbidden into any built page', () => {
    for (const page of pages) {
      for (const [label, pattern] of FORBIDDEN) {
        expect(page.raw, `${page.path} leaked the ${label}`).not.toMatch(pattern);
      }
    }
  });
});

describe('accessibility invariants', () => {
  it('declares a language on every page', () => {
    for (const page of pages) {
      expect(page.dom.querySelector('html')?.getAttribute('lang'), page.path).toBe('en');
    }
  });

  it('has exactly one h1 per page', () => {
    for (const page of pages) {
      expect(page.dom.querySelectorAll('h1').length, page.path).toBe(1);
    }
  });

  it('gives every image non-empty alt text', () => {
    for (const page of pages) {
      for (const img of page.dom.querySelectorAll('img')) {
        expect(
          img.getAttribute('alt')?.trim(),
          `${page.path}: ${img.getAttribute('src')}`
        ).toBeTruthy();
      }
    }
  });

  it('provides a skip link to the main landmark on every page', () => {
    for (const page of pages) {
      expect(page.dom.querySelector('a[href="#main"]'), page.path).toBeTruthy();
      expect(page.dom.querySelector('main#main'), page.path).toBeTruthy();
    }
  });

  it('labels the theme toggle for screen readers', () => {
    const toggle = index().dom.querySelector('#theme-toggle');
    expect(toggle).toBeTruthy();
    expect(toggle?.getAttribute('aria-label')).toBeTruthy();
    expect(toggle?.getAttribute('aria-pressed')).toBeTruthy();
  });

  it('gives every anchor either text or an aria-label', () => {
    for (const page of pages) {
      for (const anchor of page.dom.querySelectorAll('a')) {
        const hasText = anchor.text.trim().length > 0;
        const hasLabel = (anchor.getAttribute('aria-label') ?? '').trim().length > 0;
        expect(
          hasText || hasLabel,
          `${page.path}: <a href="${anchor.getAttribute('href')}">`
        ).toBe(true);
      }
    }
  });

  it('applies the theme before first paint to avoid a flash', () => {
    for (const page of pages) {
      expect(page.raw, page.path).toMatch(/prefers-color-scheme: dark/);
    }
  });
});

describe('content completeness', () => {
  const FEATURED = [
    'InMindCNN',
    'Academy Object Detection',
    'Multi-Sensor IMU Pipeline',
    'Robot Perception Manager',
    'DevPulse Agentic Workspace',
    'Hand Gesture Controlled Robotic Car',
    'License Plate Recognition System',
  ];
  const COMPACT = ['Clinic Management System', 'Travel Agency', 'Data Structures Project'];

  it('renders all seven featured project titles', () => {
    for (const title of FEATURED) {
      expect(index().raw, `missing featured project: ${title}`).toContain(title);
    }
  });

  it('renders all three compact project titles under an "Also built" heading', () => {
    expect(index().raw).toContain('Also built');
    for (const title of COMPACT) {
      expect(index().raw, `missing compact project: ${title}`).toContain(title);
    }
  });

  it('links only the two public repositories', () => {
    const repoLinks = index()
      .dom.querySelectorAll('a')
      .map((a) => a.getAttribute('href') ?? '')
      .filter((href) => /github\.com\/elias-antoun\/(?!elias-antoun)/.test(href))
      .sort();
    expect(repoLinks).toEqual([
      'https://github.com/elias-antoun/Multi-Sensor-Pipeline',
      'https://github.com/elias-antoun/Robot_Perception_Manager',
    ]);
  });

  it('offers the CV for download and ships the file', () => {
    const downloads = index()
      .dom.querySelectorAll('a[download]')
      .map((a) => a.getAttribute('href'));
    expect(downloads).toContain('/Elias_Antoun_Resume.pdf');
    expect(existsSync(join(DIST, 'Elias_Antoun_Resume.pdf'))).toBe(true);
  });

  it('renders the headline internship metrics', () => {
    expect(index().raw).toContain('81.4% → 95.3%');
    expect(index().raw).toContain('12,375');
  });

  it('reads the name as two words in the h1', () => {
    // A bare <br> between the names collapses the accessible name and any
    // copy-paste to "EliasAntoun".
    const h1 = index().dom.querySelector('h1');
    expect(h1?.text.replace(/\s+/g, ' ').trim()).toBe('Elias Antoun');
  });

  it('exposes canonical URL and Person structured data', () => {
    expect(index().dom.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://elias-antoun.github.io/'
    );
    const ld = index().dom.querySelector('script[type="application/ld+json"]');
    expect(ld).toBeTruthy();
    const parsed = JSON.parse(ld!.text);
    expect(parsed['@type']).toBe('Person');
    expect(parsed.name).toBe('Elias Antoun');
  });
});
