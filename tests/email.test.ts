import { describe, it, expect } from 'vitest';
import { obfuscateEmail } from '../src/lib/email';

describe('obfuscateEmail', () => {
  it('builds a working mailto href from split parts', () => {
    const { href } = obfuscateEmail('eyantoun', 'outlook.com');
    expect(href).toBe('mailto:eyantoun@outlook.com');
  });

  it('renders the address as readable display text', () => {
    const { text } = obfuscateEmail('eyantoun', 'outlook.com');
    expect(text).toBe('eyantoun@outlook.com');
  });

  it('never stores the joined address as a literal in its own source', () => {
    // Regression guard: the point of splitting is that no source line
    // contains the full address for a naive scraper to lift.
    const src = obfuscateEmail.toString();
    expect(src).not.toContain('eyantoun@outlook.com');
  });
});
