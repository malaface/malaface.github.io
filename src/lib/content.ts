export function getPublishedEntries<T extends { data: { draft: boolean; publishedAt: Date } }>(entries: T[]) {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

export function readingTime(body: string) {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).filter(Boolean).length / 220));
}
