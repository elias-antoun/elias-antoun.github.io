import { describe, it, expect } from 'vitest';
import { partitionProjects, initialsFor } from '../src/lib/projects';

const entry = (title: string, featured: boolean, order: number) => ({
  data: { title, featured, order },
});

describe('partitionProjects', () => {
  it('splits featured from compact entries', () => {
    const { featured, compact } = partitionProjects([
      entry('A', true, 1),
      entry('B', false, 2),
      entry('C', true, 3),
    ]);
    expect(featured.map((e) => e.data.title)).toEqual(['A', 'C']);
    expect(compact.map((e) => e.data.title)).toEqual(['B']);
  });

  it('sorts each tier by ascending order', () => {
    const { featured } = partitionProjects([
      entry('third', true, 30),
      entry('first', true, 10),
      entry('second', true, 20),
    ]);
    expect(featured.map((e) => e.data.title)).toEqual(['first', 'second', 'third']);
  });

  it('breaks order ties by title so output is deterministic', () => {
    const { featured } = partitionProjects([entry('Zebra', true, 5), entry('Alpha', true, 5)]);
    expect(featured.map((e) => e.data.title)).toEqual(['Alpha', 'Zebra']);
  });

  it('returns empty tiers for empty input', () => {
    expect(partitionProjects([])).toEqual({ featured: [], compact: [] });
  });

  it('does not mutate the input array', () => {
    const input = [entry('B', true, 2), entry('A', true, 1)];
    const snapshot = input.map((e) => e.data.title);
    partitionProjects(input);
    expect(input.map((e) => e.data.title)).toEqual(snapshot);
  });
});

describe('initialsFor', () => {
  it('uses word initials for multi-word titles', () => {
    expect(initialsFor('Robot Perception Manager')).toBe('RPM');
    expect(initialsFor('Academy Object Detection')).toBe('AOD');
    expect(initialsFor('DevPulse Agentic Workspace')).toBe('DAW');
  });

  it('caps multi-word initials at three letters', () => {
    expect(initialsFor('Hand Gesture Controlled Robotic Car')).toBe('HGC');
    expect(initialsFor('License Plate Recognition System')).toBe('LPR');
  });

  it('uses internal capitals for single-word titles', () => {
    // Word initials alone would give a bare "I", which looks like a bug.
    expect(initialsFor('InMindCNN')).toBe('IMC');
  });

  it('falls back to the first two characters for a lowercase single word', () => {
    expect(initialsFor('portfolio')).toBe('PO');
  });

  it('ignores leading words that do not start with a letter', () => {
    expect(initialsFor('3D Scene Reconstruction')).toBe('SR');
  });

  it('returns an empty string rather than throwing on unusable input', () => {
    expect(initialsFor('')).toBe('');
    expect(initialsFor('123 456')).toBe('');
  });
});
