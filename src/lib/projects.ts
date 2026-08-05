export const projectStatuses = ['production', 'maintenance', 'archived'] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  productionUrl: string;
  status: ProjectStatus;
  updatedAt: string;
  featured: boolean;
}

const projectKeys = [
  'description',
  'featured',
  'id',
  'name',
  'productionUrl',
  'status',
  'technologies',
  'updatedAt'
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isAbsolutePublicUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isIsoDate(value: unknown): value is string {
  if (!isNonEmptyString(value) || Number.isNaN(Date.parse(value))) return false;
  return new Date(value).toISOString() === value;
}

function invalidRecord(index: number, reason: string): never {
  throw new Error(`Invalid manual project record at index ${index}: ${reason}`);
}

export function parseProjectRecords(input: unknown): ProjectRecord[] {
  if (!Array.isArray(input)) throw new Error('Invalid manual project catalog: expected an array.');

  return input.map((value, index) => {
    if (!isRecord(value)) invalidRecord(index, 'expected an object.');

    const keys = Object.keys(value).sort();
    if (keys.length !== projectKeys.length || keys.some((key, keyIndex) => key !== projectKeys[keyIndex])) {
      invalidRecord(index, 'expected exactly the approved fields.');
    }
    if (!isNonEmptyString(value.id)) invalidRecord(index, 'id must be a non-empty string.');
    if (!isNonEmptyString(value.name)) invalidRecord(index, 'name must be a non-empty string.');
    if (!isNonEmptyString(value.description)) invalidRecord(index, 'description must be a non-empty string.');
    if (!Array.isArray(value.technologies) || !value.technologies.every(isNonEmptyString)) {
      invalidRecord(index, 'technologies must be an array of non-empty strings.');
    }
    if (!isAbsolutePublicUrl(value.productionUrl)) {
      invalidRecord(index, 'productionUrl must be an absolute HTTP(S) URL without credentials.');
    }
    if (!projectStatuses.includes(value.status as ProjectStatus)) {
      invalidRecord(index, 'status is not supported.');
    }
    if (!isIsoDate(value.updatedAt)) invalidRecord(index, 'updatedAt must be a valid ISO timestamp.');
    if (typeof value.featured !== 'boolean') invalidRecord(index, 'featured must be a boolean.');

    return {
      id: value.id,
      name: value.name,
      description: value.description,
      technologies: [...value.technologies],
      productionUrl: value.productionUrl,
      status: value.status as ProjectStatus,
      updatedAt: value.updatedAt,
      featured: value.featured
    };
  });
}

function updatedAtValue(project: ProjectRecord) {
  const value = Date.parse(project.updatedAt);
  return Number.isNaN(value) ? 0 : value;
}

export function getVisibleProjects(projects: readonly ProjectRecord[]): ProjectRecord[] {
  return [...projects].sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) || updatedAtValue(b) - updatedAtValue(a) || a.id.localeCompare(b.id)
  );
}

export function getHomeProject(projects: readonly ProjectRecord[]): ProjectRecord | undefined {
  const sorted = getVisibleProjects(projects);
  return sorted.find(({ featured }) => featured) ?? sorted[0];
}
