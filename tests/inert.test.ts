import { describe, it, expect } from 'vitest';
import { inertExcept } from '../src/lib/inert';

const el = (name: string, inert = false) => ({ name, inert });

describe('inertExcept', () => {
  it('makes every element inert except the kept ones', () => {
    const header = el('header');
    const main = el('main');
    const sheet = el('sheet');
    inertExcept([header, main, sheet], [sheet]);
    expect(header.inert).toBe(true);
    expect(main.inert).toBe(true);
    expect(sheet.inert).toBe(false);
  });

  it('restores everything it changed', () => {
    const header = el('header');
    const main = el('main');
    const sheet = el('sheet');
    const restore = inertExcept([header, main, sheet], [sheet]);
    restore();
    expect([header, main, sheet].map((e) => e.inert)).toEqual([false, false, false]);
  });

  it('never wakes an element that was already inert', () => {
    const disabled = el('disabled', true);
    const main = el('main');
    const restore = inertExcept([disabled, main], []);
    restore();
    expect(disabled.inert).toBe(true);
    expect(main.inert).toBe(false);
  });

  it('is a no-op when there is nothing to disable', () => {
    const restore = inertExcept([], []);
    expect(() => restore()).not.toThrow();
  });
});
