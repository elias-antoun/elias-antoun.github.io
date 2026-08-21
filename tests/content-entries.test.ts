import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/projects';

const FORBIDDEN: Array<[string, RegExp]> = [
  ['phone number', /79179277/],
  ['dialling prefix', /\+961/],
  ['confidential repo', /harness-bench/i],
  ['client bucket', /anb-pap/i],
  ['s3 URI', /s3:\/\//i],
  ['forked repo academy-bot-slam', /academy-bot-slam/i],
  ['forked repo Robotics-S01', /Robotics-S01/i],
];

const slugs = readdirSync(DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const read = (slug: string) => readFileSync(join(DIR, slug, 'index.md'), 'utf8');

describe('project entries', () => {
  it('has ten project folders', () => {
    expect(slugs).toHaveLength(10);
  });

  it('splits seven featured and three compact', () => {
    const featured = slugs.filter((s) => /^featured:\s*true\s*$/m.test(read(s)));
    expect(featured).toHaveLength(7);
    expect(slugs.length - featured.length).toBe(3);
  });

  it('gives every entry a unique order value', () => {
    const orders = slugs.map((s) => read(s).match(/^order:\s*(\d+)\s*$/m)?.[1]);
    expect(orders.every((o) => o !== undefined)).toBe(true);
    expect(new Set(orders).size).toBe(slugs.length);
  });

  it('contains no forbidden strings in any entry', () => {
    for (const slug of slugs) {
      const body = read(slug);
      for (const [label, pattern] of FORBIDDEN) {
        expect(body, `${slug} leaked the ${label}`).not.toMatch(pattern);
      }
    }
  });

  it('sets no cover field, since no cover images exist yet', () => {
    for (const slug of slugs) {
      expect(read(slug), `${slug} sets a cover`).not.toMatch(/^cover:/m);
    }
  });

  it('links only the two public repositories', () => {
    const repos = slugs
      .map((s) => read(s).match(/^\s+repo:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim())
      .filter((r): r is string => Boolean(r))
      .sort();
    expect(repos).toEqual([
      'https://github.com/elias-antoun/Multi-Sensor-Pipeline',
      'https://github.com/elias-antoun/Robot_Perception_Manager',
    ]);
  });
});
