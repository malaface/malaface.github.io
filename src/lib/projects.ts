export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  productionUrl: string;
  status: string;
  updatedAt: string;
  featured: boolean;
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
