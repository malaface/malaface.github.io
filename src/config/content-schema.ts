import { z } from 'zod';

export const contentSections = ['knowledge', 'playbooks', 'blog', 'lab', 'resources'] as const;
export type ContentSection = typeof contentSections[number];

export const contentCategories = [
  'automation',
  'knowledge-systems',
  'ai-coding',
  'application-security',
  'product-building',
  'developer-experience'
] as const;

export const contentTags = [
  'ai-coding',
  'context-engineering',
  'metodologia',
  'supabase',
  'rls',
  'seguridad-de-aplicaciones',
  'automatizacion',
  'revision',
  'contenido-publico',
  'documentacion',
  'knowledge-systems',
  'aprendizaje',
  'calidad',
  'pruebas-web',
  'desarrollo-de-producto',
  'checklist',
  'publicacion',
  'n8n',
  'flowise',
  'open-webui',
  'pydantic',
  'modelos-de-ia',
  'validacion-de-datos',
  'toma-de-decisiones'
] as const;

export const contentSchemaFor = (section: ContentSection) => z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  section: z.literal(section),
  category: z.enum(contentCategories),
  tags: z.array(z.enum(contentTags)),
  featured: z.boolean(),
  draft: z.boolean(),
  externalUrl: z.url().optional()
});
