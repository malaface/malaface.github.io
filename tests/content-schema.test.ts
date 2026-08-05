import { describe, expect, it } from 'vitest';
import { contentSchemaFor } from '../src/config/content-schema';

const validEntry = {
  title: 'Entrada pública',
  description: 'Descripción pública.',
  publishedAt: '2026-08-05',
  section: 'knowledge',
  category: 'ai-coding',
  tags: ['context-engineering'],
  featured: false,
  draft: false
};

describe('content collection schema', () => {
  it('binds each collection to its own explicit section', () => {
    const schema = contentSchemaFor('knowledge');

    expect(() => schema.parse(validEntry)).not.toThrow();
    expect(() => schema.parse({ ...validEntry, section: 'blog' })).toThrow();
  });

  it('rejects tags outside the approved public taxonomy', () => {
    expect(() => contentSchemaFor('knowledge').parse({ ...validEntry, tags: ['unapproved-tag'] })).toThrow();
  });
});
