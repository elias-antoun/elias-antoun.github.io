import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema } from './lib/project-schema';

const projects = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/projects' }),
  // image() resolves and optimises covers at build time; a missing or
  // unresolvable file fails the build rather than shipping a broken card.
  schema: ({ image }) => projectSchema(image()),
});

export const collections = { projects };
