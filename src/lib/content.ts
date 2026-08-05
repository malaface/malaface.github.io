import type { CollectionEntry } from 'astro:content';

export type PublicEntry =
  | CollectionEntry<'knowledge'>
  | CollectionEntry<'playbooks'>
  | CollectionEntry<'blog'>
  | CollectionEntry<'lab'>
  | CollectionEntry<'resources'>;

export const collectionDetails = {
  knowledge: { href: '/knowledge-hub/', label: 'Conocimiento' },
  playbooks: { href: '/playbooks/', label: 'Guías' },
  blog: { href: '/blog/', label: 'Blog' },
  lab: { href: '/laboratorio/', label: 'Laboratorio' },
  resources: { href: '/recursos/', label: 'Recursos' }
} as const;

export const categoryLabels = {
  automation: 'Automatización',
  'knowledge-systems': 'Sistemas de conocimiento',
  'ai-coding': 'IA aplicada',
  'application-security': 'Seguridad de aplicaciones',
  'product-building': 'Desarrollo de producto',
  'developer-experience': 'Experiencia de desarrollo'
} as const;

export function contentHref(entry: Pick<PublicEntry, 'collection' | 'id'>) {
  return `${collectionDetails[entry.collection].href}${entry.id}/`;
}

export function getPublishedEntries<T extends { data: { draft: boolean; publishedAt: Date } }>(entries: T[]) {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

export function readingTime(body: string) {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).filter(Boolean).length / 220));
}

interface RelatedEntryData {
  category: string;
  tags: readonly string[];
  draft: boolean;
}

interface RelatedEntry {
  id: string;
  collection?: string;
  data: RelatedEntryData;
}

export function relatedEntries<T extends RelatedEntry>(current: RelatedEntry, candidates: T[], limit = 3) {
  const currentTags = new Set(current.data.tags);
  const isCurrent = (candidate: T) =>
    candidate === current ||
    (candidate.id === current.id &&
      (!candidate.collection || !current.collection || candidate.collection === current.collection));

  return candidates
    .map((entry, index) => ({
      entry,
      index,
      score:
        (entry.data.category === current.data.category ? 3 : 0) +
        entry.data.tags.filter((tag) => currentTags.has(tag)).length
    }))
    .filter(({ entry, score }) => !isCurrent(entry) && !entry.data.draft && score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.max(0, limit))
    .map(({ entry }) => entry);
}
