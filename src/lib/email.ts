/**
 * Build a mailto link from separately-stored parts.
 *
 * The address is never present as one literal in the source, which defeats
 * the simplest address scrapers without hurting accessibility — the rendered
 * text and href are both complete and correct.
 */
export function obfuscateEmail(user: string, domain: string): { href: string; text: string } {
  const address = `${user}@${domain}`;
  return { href: `mailto:${address}`, text: address };
}
