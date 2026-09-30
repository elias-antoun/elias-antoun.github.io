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

/** Every ancestor of `el`, nearest first. */
function ancestors(el: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (let node = el.parentNode; node; node = node.parentNode) out.push(node);
  return out;
}

const classes = (el: HTMLElement) => (el.getAttribute('class') ?? '').split(/\s+/);

/** Every built stylesheet, concatenated. */
function builtCss(): string {
  const dir = join(DIST, '_astro');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.css'))
    .map((name) => readFileSync(join(dir, name), 'utf8'))
    .join('\n');
}

/** Split a selector list on its top-level commas, leaving `:has(a, b)` whole. */
function splitSelectorList(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === '(') depth++;
    else if (list[i] === ')') depth--;
    else if (list[i] === ',' && depth === 0) {
      parts.push(list.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(list.slice(start));
  return parts.map((part) => part.trim());
}

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
    'LOCO Warehouse Object Detection',
    'Multi-Sensor IMU Pipeline',
    'Robot Perception Manager',
    'DevPulse Agentic Workspace',
    'Hand Gesture Controlled Robotic Car',
    'License Plate Recognition System',
    'Pinball Scoring and Drain System',
    'Smart Treadmill with Health Monitoring',
    'Brain Bits Memory Game',
    'FIRE-X Fire-Fighting Robot',
    'Clinic Management System',
  ];
  const COMPACT = ['MIPS Control Unit in VHDL', 'Travel Agency', 'Data Structures Project'];

  it('renders all twelve featured project titles', () => {
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

  it('ships every project write-up as real content, not a fetch', () => {
    // The bodies were dead content before the sheet existed — rendered nowhere.
    // These phrases come from the Markdown bodies, so their presence proves the
    // prose is server-rendered and therefore crawlable.
    const raw = index().raw;
    expect(raw).toContain('LeNet-5');
    expect(raw).toContain('Pareto-optimal');
    expect(raw).toContain('moving average');
    expect(raw).toContain('camera_tf_broadcaster');
  });

  it('gives the sheet modal dialog semantics', () => {
    const dom = index().dom;
    const sheet = dom.querySelector('#sheet');
    expect(sheet).toBeTruthy();
    expect(sheet?.getAttribute('role')).toBe('dialog');
    expect(sheet?.getAttribute('aria-modal')).toBe('true');
    // Labelled by its heading, and starts hidden so it is not in the tab order.
    expect(sheet?.getAttribute('aria-labelledby')).toBe('sheet-heading');
    expect(sheet?.hasAttribute('hidden')).toBe(true);
    expect(dom.querySelector('#sheet-scrim')?.hasAttribute('hidden')).toBe(true);
  });

  it('gives every featured project a sheet trigger and a matching source', () => {
    const dom = index().dom;
    const triggers = dom
      .querySelectorAll('[data-sheet-open]')
      .map((el) => el.getAttribute('data-sheet-open'));
    expect(triggers.length).toBe(FEATURED.length);
    for (const slug of triggers) {
      expect(dom.querySelector(`#sheet-source-${slug}`), `no source for ${slug}`).toBeTruthy();
    }
  });

  it('labels every button for screen readers', () => {
    for (const page of pages) {
      for (const button of page.dom.querySelectorAll('button')) {
        const hasText = button.text.trim().length > 0;
        const hasLabel = (button.getAttribute('aria-label') ?? '').trim().length > 0;
        expect(hasText || hasLabel, `${page.path}: unlabelled button`).toBe(true);
      }
    }
  });

  it('keeps buttons to phrasing content, with nothing interactive inside', () => {
    // A button flattens its contents into one label, so a heading or list
    // inside it drops out of screen-reader navigation. HTML forbids it too.
    const NON_PHRASING =
      'address, article, aside, blockquote, details, dialog, div, dl, fieldset, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hr, main, nav, ol, p, pre, section, table, ul';
    const INTERACTIVE = 'a[href], button, iframe, input, label, select, textarea, [tabindex]';
    for (const page of pages) {
      for (const button of page.dom.querySelectorAll('button')) {
        const where = `${page.path}: <button>${button.text.trim()}`;
        const tags = (selector: string) => button.querySelectorAll(selector).map((el) => el.tagName);
        expect(tags(NON_PHRASING), where).toEqual([]);
        expect(tags(INTERACTIVE), where).toEqual([]);
      }
    }
  });

  it('makes each featured title a heading that holds its sheet trigger', () => {
    // Screen-reader users skim the projects by heading. A heading inside a
    // button stops being one, so the button goes inside the heading instead.
    const triggers = index().dom.querySelectorAll('#projects [data-sheet-open]');
    const titles = triggers.map((trigger) => {
      const title = trigger.text.trim();
      expect(trigger.parentNode?.tagName, `${title}: trigger must sit in a heading`).toMatch(
        /^H[2-6]$/
      );
      // An aria-label would replace the visible title as the button's name.
      expect(trigger.hasAttribute('aria-label'), `${title}: aria-label`).toBe(false);
      return title;
    });
    expect(titles.sort()).toEqual([...FEATURED].sort());
  });

  it('serves card covers in sizes that fit the card', () => {
    // A cover renders at most ~500px wide. Without a srcset every visitor
    // downloads the full-size original, several times the bytes needed.
    const covers = index().dom.querySelectorAll('#projects article img');
    expect(covers.length).toBeGreaterThan(0);
    for (const img of covers) {
      const where = img.getAttribute('alt') ?? '';
      expect(img.getAttribute('srcset'), where).toMatch(/ 500w/);
      expect(img.getAttribute('sizes'), where).toContain('496px');
    }
  });

  it('stretches each card trigger over its own card, under the repo link', () => {
    // The trigger's ::after fills its containing block, which has to be the
    // card. Anything positioned or transformed on the way — the button itself
    // included — would shrink the overlay to that element; a card without
    // `relative` lets it cover the page instead. A repo link not raised above
    // the overlay can no longer be clicked.
    const after = builtCss().match(/\.card-trigger:{1,2}after\{([^}]*)\}/)?.[1] ?? '';
    expect(after).toMatch(/content:(""|'')/);
    expect(after).toContain('position:absolute');
    expect(after).toContain('inset:0');
    const CONTAINING_BLOCK =
      /^(relative|absolute|fixed|sticky|pressable|transform.*|(translate|scale|rotate|skew|perspective|backdrop|contain|will-change)-.+|filter|blur.*)$/;

    for (const trigger of index().dom.querySelectorAll('#projects [data-sheet-open]')) {
      const title = trigger.text.trim();
      const path = ancestors(trigger);
      const card = path.find((el) => el.tagName === 'ARTICLE');
      expect(card, `${title}: no card`).toBeTruthy();
      expect(classes(card!), `${title}: card must be positioned`).toContain('relative');
      const between = [trigger, ...path.slice(0, path.indexOf(card!))];
      // Variants included: `active:scale-95` transforms the button mid-press.
      const offenders = between.filter((el) =>
        classes(el).some((c) => CONTAINING_BLOCK.test(c.slice(c.lastIndexOf(':') + 1)))
      );
      expect(offenders.map((el) => el.tagName), `${title}: containing block in between`).toEqual(
        []
      );
      for (const link of card!.querySelectorAll('a[href]')) {
        expect(classes(link), `${title}: repo link`).toContain('relative');
        expect(classes(link).some((c) => /^z-\d+$/.test(c)), `${title}: repo link z-index`).toBe(true);
      }
    }
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

describe('project sheet', () => {
  it('renders the sheet and its scrim as direct children of <body>', () => {
    // While open, the sheet makes every sibling but its scrim inert. Anywhere
    // deeper — inside <main>, say — it would disable itself along with the
    // page behind it.
    const dom = index().dom;
    for (const id of ['sheet', 'sheet-scrim']) {
      const el = dom.querySelector(`#${id}`);
      expect(el, `#${id} missing`).toBeTruthy();
      expect(el?.parentNode?.tagName, `#${id} must be a child of <body>`).toBe('BODY');
    }
  });

  it('never nests a dialog inside the main landmark', () => {
    for (const page of pages) {
      const nested = page.dom
        .querySelectorAll('main [role="dialog"], main dialog')
        .map((el) => el.id || el.tagName);
      expect(nested, page.path).toEqual([]);
    }
  });

  it('keeps the write-up sources truly hidden until the sheet shows them', () => {
    // Visually clipped copies are still read aloud, as a detached block at the
    // end of the page, and still matched by find-in-page, invisibly.
    const sources = index().dom.querySelectorAll('[data-sheet-source]');
    const triggers = index().dom.querySelectorAll('[data-sheet-open]');
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.length).toBe(triggers.length);
    for (const source of sources) {
      const hiddenBy = [source, ...ancestors(source)].find(
        (el) => el.hasAttribute('hidden') && el.getAttribute('hidden') !== 'until-found'
      );
      expect(hiddenBy, `${source.id} is reachable`).toBeTruthy();
    }
  });
});

describe('built CSS', () => {
  it('ships every backdrop-filter in both its standard and -webkit- forms', () => {
    // Chrome and Firefox read only the standard property; Safari before 18
    // reads only the -webkit- one. Both have been lost before: a hand-written
    // -webkit- line made the minifier drop the standard one, and minifying
    // with no browser targets dropped the prefix.
    const rules = [...builtCss().matchAll(/([^{};@]+)\{([^{}]*)\}/g)];
    const blurred = rules.filter(([, , body]) => body.includes('backdrop-filter:'));
    expect(blurred.length).toBeGreaterThan(0);
    const incomplete = blurred
      .filter(
        ([, , body]) =>
          !/(?:^|;)backdrop-filter:/.test(body) || !body.includes('-webkit-backdrop-filter:')
      )
      .map(([, selector]) => selector.trim());
    expect(incomplete).toEqual([]);
  });

  it('never lets a :has() selector share a rule with other selectors', () => {
    // The minifier merges rules with identical bodies into one selector list.
    // A browser without :has() drops such a list whole, taking every other
    // selector in it down too — reduced-motion overrides included.
    const preludes = [...builtCss().matchAll(/(?:^|[{};])([^{};@]+)\{/g)].map((m) => m[1]);
    const mixed = preludes.filter((p) => p.includes(':has(') && splitSelectorList(p).length > 1);
    expect(mixed).toEqual([]);
  });
});

describe('visually hidden content', () => {
  it('never puts focusable content inside a visually clipped element', () => {
    // Keyboard focus would land on something the user cannot see. The skip
    // link is exempt: it is itself sr-only and becomes visible on focus.
    const FOCUSABLE = 'a[href], button, input, select, textarea, iframe, [tabindex]';
    for (const page of pages) {
      for (const clipped of page.dom.querySelectorAll('.sr-only')) {
        const inside = clipped.querySelectorAll(FOCUSABLE).map((el) => el.tagName);
        expect(inside, page.path).toEqual([]);
      }
    }
  });
});
