import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import { siteConfig } from '../config/site';
import { contentHref, getPublishedEntries } from '../lib/content';

type RssEntry =
  | CollectionEntry<'blog'>
  | CollectionEntry<'knowledge'>
  | CollectionEntry<'playbooks'>;

export async function GET() {
  const collections = await Promise.all([
    getCollection('blog'),
    getCollection('knowledge'),
    getCollection('playbooks')
  ]);
  const entries = getPublishedEntries(collections.flat() as RssEntry[]);

  return rss({
    title: `${siteConfig.name} · Publicaciones`,
    description: 'Artículos, conocimiento y guías públicas sobre automatización, IA aplicada y desarrollo de producto.',
    site: siteConfig.url,
    customData: `<language>${siteConfig.locale}</language>`,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishedAt,
      link: contentHref(entry),
      categories: [...entry.data.tags]
    }))
  });
}
