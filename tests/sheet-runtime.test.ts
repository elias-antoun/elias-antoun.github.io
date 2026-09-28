import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

/**
 * Runs the sheet's shipped script against the built page.
 *
 * The build-output suite can only see static HTML. The bugs that matter here
 * happen at runtime — what the sheet hides, disables and focuses when it
 * opens and closes — so this executes the real bundle from dist/ in jsdom.
 *
 * Reduced motion is on by default, which makes every open and close resolve
 * synchronously. With it off, animation frames are pumped by hand.
 *
 * jsdom does not implement inert, so the suite reflects the property to the
 * attribute the way browsers do. Nor does jsdom refuse focus inside an inert
 * subtree, so focus() calls are recorded and checked instead.
 */

const DIST = 'dist';
let html: string;
let script: string;

beforeAll(() => {
  if (!existsSync(DIST)) {
    throw new Error('dist/ not found — run `npm run build` before this suite');
  }
  html = readFileSync(join(DIST, 'index.html'), 'utf8');
  const bundle = readdirSync(join(DIST, '_astro')).find(
    (name) => name.startsWith('ProjectSheet') && name.endsWith('.js')
  );
  if (!bundle) throw new Error('no ProjectSheet script bundle in dist/_astro');
  script = readFileSync(join(DIST, '_astro', bundle), 'utf8');
});

let window: JSDOM['window'];
let document: Document;
/** Every focus() call, with whether the element was inside an inert subtree. */
let focusCalls: Array<{ el: Element; inert: boolean }>;
/** Pending animation frame callbacks, run by pumpFrames(). */
let frames: FrameRequestCallback[];

/** True if `el` or any ancestor is inert. */
function inInertSubtree(el: Element | null): boolean {
  for (let node = el; node; node = node.parentElement) {
    if ((node as HTMLElement).inert) return true;
  }
  return false;
}

function load({ reducedMotion = true } = {}) {
  const dom = new JSDOM(html, { url: 'https://elias-antoun.github.io/', runScripts: 'outside-only' });
  window = dom.window;
  document = window.document;

  window.matchMedia = ((query: string) => ({
    matches: reducedMotion && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;

  frames = [];
  window.requestAnimationFrame = (callback) => frames.push(callback);
  window.cancelAnimationFrame = (id) => {
    frames[id - 1] = () => {};
  };

  Object.defineProperty(window.HTMLElement.prototype, 'inert', {
    configurable: true,
    get(this: HTMLElement) {
      return this.hasAttribute('inert');
    },
    set(this: HTMLElement, value: boolean) {
      this.toggleAttribute('inert', Boolean(value));
    },
  });

  focusCalls = [];
  const focus = window.HTMLElement.prototype.focus;
  window.HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions) {
    focusCalls.push({ el: this, inert: inInertSubtree(this) });
    return focus.call(this, options);
  };

  window.eval(script);
}

beforeEach(() => load());

/** Run queued animation frames, 16ms apart, until none are left. */
function pumpFrames(budget = 1000) {
  let now = 0;
  for (let next = 0; next < frames.length && budget-- > 0; next++) {
    now += 16;
    frames[next](now);
  }
}

const $ = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const trigger = (slug: string) => $(`[data-sheet-open="${slug}"]`);
const pressEscape = () =>
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
const bodyChildren = () => [...document.body.children] as HTMLElement[];

describe('project sheet at runtime', () => {
  it('opens with the dialog live and everything behind it inert', () => {
    trigger('inmind-cnn').click();

    const sheet = $('#sheet');
    expect(sheet.hidden).toBe(false);
    expect($('#sheet-heading').textContent).toBe('InMindCNN');
    expect($('#sheet-body').textContent).toContain('LeNet-5');
    expect(document.activeElement).toBe($('#sheet-close'));

    // The original bug: aria-hidden on an ancestor hid the dialog itself.
    expect(sheet.closest('[aria-hidden="true"]')).toBeNull();
    expect(inInertSubtree(sheet)).toBe(false);
    // The scrim stays live so a click on it can dismiss the sheet.
    expect($('#sheet-scrim').inert).toBe(false);

    const background = bodyChildren().filter((el) => el.id !== 'sheet' && el.id !== 'sheet-scrim');
    expect(background.map((el) => el.tagName)).toEqual(
      expect.arrayContaining(['A', 'HEADER', 'MAIN', 'FOOTER'])
    );
    for (const el of background) expect(el.inert, `${el.tagName}#${el.id}`).toBe(true);
  });

  it.each([
    ['Escape', pressEscape],
    ['the close button', () => $('#sheet-close').click()],
    ['a scrim click', () => $('#sheet-scrim').click()],
  ])('closes on %s and restores the page, then focus', (_, close) => {
    const opener = trigger('inmind-cnn');
    opener.click();
    close();

    expect($('#sheet').hidden).toBe(true);
    expect($('#sheet-scrim').hidden).toBe(true);
    expect(bodyChildren().filter((el) => el.inert).map((el) => el.tagName)).toEqual([]);
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(opener);
    // Focus handed to an element that was still inert is lost in a browser.
    expect(focusCalls.filter((call) => call.inert).map((call) => call.el.tagName)).toEqual([]);
  });

  it('shows the second project cleanly after the first is closed', () => {
    trigger('inmind-cnn').click();
    pressEscape();
    trigger('academy-object-detection').click();

    expect($('#sheet-heading').textContent).toBe('LOCO Warehouse Object Detection');
    // Replaced, not appended to: nothing of the first write-up is left.
    expect($('#sheet-body').innerHTML).toBe(
      $('#sheet-source-academy-object-detection [data-sheet-body]').innerHTML
    );
    expect($('#main').inert).toBe(true);

    pressEscape();
    expect(bodyChildren().filter((el) => el.inert).map((el) => el.tagName)).toEqual([]);
    expect(document.activeElement).toBe(trigger('academy-object-detection'));
  });

  it('restores the page once the animated close settles', () => {
    load({ reducedMotion: false });
    const opener = trigger('inmind-cnn');
    opener.click();
    pumpFrames();
    expect($('#sheet').style.transform).toBe('translate3d(0, 0px, 0)');

    pressEscape();
    // Still on screen: the close is a spring, not an instant hide.
    expect($('#sheet').hidden).toBe(false);
    pumpFrames();

    expect($('#sheet').hidden).toBe(true);
    expect(bodyChildren().filter((el) => el.inert).map((el) => el.tagName)).toEqual([]);
    expect(document.activeElement).toBe(opener);
    expect(focusCalls.filter((call) => call.inert).map((call) => call.el.tagName)).toEqual([]);
  });

  it('leaves an element that was already inert alone when it closes', () => {
    const footer = $('footer');
    footer.inert = true;
    trigger('inmind-cnn').click();
    pressEscape();
    expect(footer.inert).toBe(true);
    expect($('#main').inert).toBe(false);
  });
});
