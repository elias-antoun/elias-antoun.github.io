import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { profile, socials, experience, skillGroups, stats } from '../src/data/site';

const FORBIDDEN: Array<[string, RegExp]> = [
  ['phone number', /79179277/],
  ['dialling prefix', /\+961/],
  ['home city', /Zouk\s*Mosbeh/i],
  ['confidential repo', /harness-bench/i],
  ['client bucket', /anb-pap/i],
  ['s3 URI', /s3:\/\//i],
];

describe('site data privacy rules', () => {
  const source = readFileSync('src/data/site.ts', 'utf8');

  for (const [label, pattern] of FORBIDDEN) {
    it(`does not contain the ${label}`, () => {
      expect(source).not.toMatch(pattern);
    });
  }
});

describe('site data shape', () => {
  it('exposes exactly three public contact channels', () => {
    expect(socials.map((s) => s.label).sort()).toEqual(['Email', 'GitHub', 'LinkedIn']);
  });

  it('records both completed internships as past roles', () => {
    expect(experience).toHaveLength(2);
    for (const role of experience) {
      expect(role.current).toBe(false);
    }
  });

  it('gives every featured role at least one metric', () => {
    for (const role of experience) {
      expect(role.metrics.length).toBeGreaterThan(0);
    }
  });

  it('defines four skill groups', () => {
    expect(skillGroups).toHaveLength(4);
    for (const group of skillGroups) {
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it('exposes three hero statistics', () => {
    expect(stats).toHaveLength(3);
  });

  it('states the graduation year for the internship audience', () => {
    expect(profile.availability).toMatch(/2027/);
  });
});
