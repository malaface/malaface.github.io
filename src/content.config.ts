import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const categories = [
  'automation',
  'knowledge-systems',
  'ai-coding',
  'application-security',
  'product-building',
  'developer-experience'
] as const;

const sharedSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  section: z.string(),
  category: z.enum(categories),
  tags: z.array(z.string()),
  featured: z.boolean(),
  draft: z.boolean(),
  githubRepo: z.string().url().optional(),
  externalUrl: z.string().url().optional()
});

const collection = (name: string) =>
  defineCollection({
    loader: glob({ base: `./src/content/${name}`, pattern: '**/*.{md,mdx}' }),
    schema: sharedSchema
  });

export const collections = {
  knowledge: collection('knowledge'),
  playbooks: collection('playbooks'),
  blog: collection('blog'),
  lab: collection('lab'),
  resources: collection('resources')
};
