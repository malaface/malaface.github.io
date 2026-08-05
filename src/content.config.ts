import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { contentSchemaFor, type ContentSection } from './config/content-schema';

const collection = (name: ContentSection) =>
  defineCollection({
    loader: glob({ base: `./src/content/${name}`, pattern: '**/*.{md,mdx}' }),
    schema: contentSchemaFor(name)
  });

export const collections = {
  knowledge: collection('knowledge'),
  playbooks: collection('playbooks'),
  blog: collection('blog'),
  lab: collection('lab'),
  resources: collection('resources')
};
