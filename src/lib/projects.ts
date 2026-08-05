export interface ProjectRecord {
  repository: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  productionUrl?: string;
  status: string;
  updatedAt: string;
  featured: boolean;
}

type ProjectCandidate = ProjectRecord & { enabled?: boolean };

function toProjectRecord(project: ProjectCandidate): ProjectRecord {
  const record: ProjectRecord = {
    repository: project.repository,
    name: project.name,
    description: project.description,
    technologies: [...project.technologies],
    githubUrl: project.githubUrl,
    status: project.status,
    updatedAt: project.updatedAt,
    featured: project.featured
  };

  if (project.productionUrl) record.productionUrl = project.productionUrl;
  return record;
}

function updatedAtValue(project: ProjectRecord) {
  const value = Date.parse(project.updatedAt);
  return Number.isNaN(value) ? 0 : value;
}

export function getVisibleProjects(projects: readonly ProjectCandidate[]): ProjectRecord[] {
  return projects
    .filter(({ enabled }) => enabled === true)
    .map(toProjectRecord)
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        updatedAtValue(b) - updatedAtValue(a) ||
        a.repository.localeCompare(b.repository)
    );
}
