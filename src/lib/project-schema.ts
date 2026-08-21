import { z } from 'astro/zod';

/**
 * Shared field definitions for the projects collection.
 *
 * `coverType` is parameterised because the real collection uses Astro's
 * `image()` helper — which resolves and optimises the file at build time —
 * while the exported test schema uses a plain string. The validation logic
 * is otherwise identical.
 */
const projectFields = (coverType: z.ZodTypeAny) =>
  z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    featured: z.boolean(),
    order: z.number(),
    tags: z.array(z.string()).min(1),
    period: z.string().optional(),
    cover: coverType.optional(),
    coverAlt: z.string().optional(),
    links: z
      .object({
        repo: z.url().optional(),
        demo: z.url().optional(),
      })
      .optional(),
    metrics: z
      .array(
        z.object({
          value: z.string().min(1),
          label: z.string().min(1),
        })
      )
      .optional(),
  });

/**
 * Build the full project schema for a given cover representation.
 *
 * The refinement makes a cover image without alt text a build failure rather
 * than something a reviewer has to notice. The callback parameter is inferred
 * from the concrete object schema, so it stays type-safe without annotation.
 */
export const projectSchema = (coverType: z.ZodTypeAny) =>
  projectFields(coverType).refine(
    (data) => !data.cover || (typeof data.coverAlt === 'string' && data.coverAlt.trim().length > 0),
    { message: 'coverAlt is required and must be non-empty when cover is set', path: ['coverAlt'] }
  );

/** Exported for unit tests. Uses a string stand-in for the image field. */
export const projectFrontmatterSchema = projectSchema(z.string());
