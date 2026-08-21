import { describe, it, expect } from 'vitest';
import { projectFrontmatterSchema } from '../src/lib/project-schema';

const valid = {
  title: 'InMindCNN',
  summary: 'CIFAR-10 classification in PyTorch.',
  featured: true,
  order: 10,
  tags: ['PyTorch', 'CNN'],
};

describe('project frontmatter schema', () => {
  it('accepts a minimal valid entry', () => {
    expect(projectFrontmatterSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an entry missing a title', () => {
    const { title, ...rest } = valid;
    expect(projectFrontmatterSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects an empty tags array', () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, tags: [] }).success).toBe(false);
  });

  it('rejects a non-boolean featured flag', () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, featured: 'yes' }).success).toBe(false);
  });

  it('rejects a cover supplied without alt text', () => {
    const result = projectFrontmatterSchema.safeParse({ ...valid, cover: 'cover.png' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(JSON.stringify(result.error.issues)).toMatch(/coverAlt/);
    }
  });

  it('rejects a cover with whitespace-only alt text', () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      cover: 'cover.png',
      coverAlt: '   ',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a cover with real alt text', () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      cover: 'cover.png',
      coverAlt: 'Training accuracy curve across four architectures',
    });
    expect(result.success).toBe(true);
  });

  it('accepts alt text with no cover, which renders nothing', () => {
    expect(projectFrontmatterSchema.safeParse({ ...valid, coverAlt: 'unused' }).success).toBe(true);
  });

  it('rejects a malformed repo URL', () => {
    const result = projectFrontmatterSchema.safeParse({ ...valid, links: { repo: 'not-a-url' } });
    expect(result.success).toBe(false);
  });

  it('accepts a well-formed repo URL', () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      links: { repo: 'https://github.com/elias-antoun/Multi-Sensor-Pipeline' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts well-formed metrics', () => {
    const result = projectFrontmatterSchema.safeParse({
      ...valid,
      metrics: [{ value: '98.24%', label: 'test accuracy' }],
    });
    expect(result.success).toBe(true);
  });
});
