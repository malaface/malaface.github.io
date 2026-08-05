import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const allowlistFile = new URL('../src/data/project-allowlist.json', import.meta.url);
const projectsFile = new URL('../src/data/live-projects.json', import.meta.url);
const activityFile = new URL('../src/data/activity.json', import.meta.url);
const repositoryPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

/** @typedef {import('../src/lib/projects').ProjectRecord} ProjectRecord */
/**
 * @typedef {object} ProjectSelection
 * @property {string} repository
 * @property {boolean} enabled
 * @property {boolean} featured
 * @property {string=} manualProductionUrl
 */
/**
 * @typedef {object} ActivityRecord
 * @property {string} repository
 * @property {'metadata-unavailable'} status
 * @property {string} checkedAt
 */

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

function apiHeaders(token) {
  const headers = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function safeExistingRecord(project) {
  if (!project) return undefined;

  const record = {
    repository: project.repository,
    name: project.name,
    description: project.description,
    technologies: Array.isArray(project.technologies) ? [...project.technologies] : [],
    githubUrl: project.githubUrl,
    status: project.status,
    updatedAt: project.updatedAt,
    featured: Boolean(project.featured)
  };

  if (project.productionUrl) record.productionUrl = project.productionUrl;
  return record;
}

function safePreviousActivity(entries, enabledRepositories) {
  return entries.flatMap((entry) => {
    if (
      !enabledRepositories.has(entry?.repository) ||
      entry.status !== 'metadata-unavailable' ||
      typeof entry.checkedAt !== 'string'
    ) {
      return [];
    }

    return [{ repository: entry.repository, status: entry.status, checkedAt: entry.checkedAt }];
  });
}

function normalizeProject({ selection, repositoryData, languages, existingProject, checkedAt }) {
  if (
    repositoryData?.full_name !== selection.repository ||
    repositoryData?.fork === true ||
    typeof repositoryData?.name !== 'string'
  ) {
    throw new Error('Unexpected repository metadata');
  }

  const productionUrl = selection.manualProductionUrl || existingProject?.productionUrl;
  const languageEntries = Object.entries(languages ?? {}).filter(
    ([language, bytes]) => language.trim() !== '' && typeof bytes === 'number' && Number.isFinite(bytes)
  );
  const updatedAt = Number.isNaN(Date.parse(repositoryData.updated_at))
    ? existingProject?.updatedAt || checkedAt
    : repositoryData.updated_at;
  const project = {
    repository: selection.repository,
    name: repositoryData.name,
    description:
      typeof repositoryData.description === 'string' && repositoryData.description.trim()
        ? repositoryData.description.trim()
        : existingProject?.description || 'Repositorio público seleccionado.',
    technologies: languageEntries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([language]) => language),
    githubUrl: `https://github.com/${selection.repository}`,
    status: productionUrl ? 'production' : 'selected',
    updatedAt,
    featured: Boolean(selection.featured)
  };

  if (productionUrl) project.productionUrl = productionUrl;
  return project;
}

/**
 * @param {object} options
 * @param {ProjectSelection[]} options.allowlist
 * @param {ProjectRecord[]=} options.existingProjects
 * @param {ActivityRecord[]=} options.existingActivity
 * @param {((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>)=} options.fetchImpl
 * @param {string=} options.token
 * @param {string=} options.checkedAt
 */
export async function collectGitHubData({
  allowlist,
  existingProjects = [],
  existingActivity = [],
  fetchImpl = fetch,
  token = '',
  checkedAt = new Date().toISOString()
}) {
  const selections = allowlist.filter(({ enabled }) => enabled === true);
  const enabledRepositories = new Set(selections.map(({ repository }) => repository));
  const existingByRepository = new Map(existingProjects.map((project) => [project.repository, project]));
  const projects = [];
  const activity = safePreviousActivity(existingActivity, enabledRepositories);

  for (const selection of selections) {
    const existingProject = safeExistingRecord(existingByRepository.get(selection.repository));

    try {
      if (!repositoryPattern.test(selection.repository)) throw new Error('Invalid repository');

      const endpoint = `https://api.github.com/repos/${selection.repository}`;
      const request = { headers: apiHeaders(token) };
      const repositoryResponse = await fetchImpl(endpoint, request);
      if (!repositoryResponse.ok) throw new Error('Repository metadata unavailable');

      const languagesResponse = await fetchImpl(`${endpoint}/languages`, request);
      if (!languagesResponse.ok) throw new Error('Repository languages unavailable');

      projects.push(
        normalizeProject({
          selection,
          repositoryData: await repositoryResponse.json(),
          languages: await languagesResponse.json(),
          existingProject,
          checkedAt
        })
      );
    } catch {
      if (existingProject) projects.push(existingProject);
      activity.push({ repository: selection.repository, status: 'metadata-unavailable', checkedAt });
    }
  }

  return { projects, activity };
}

export async function generateGitHubData() {
  const [allowlist, existingProjects, existingActivity] = await Promise.all([
    readJson(allowlistFile, []),
    readJson(projectsFile, []),
    readJson(activityFile, [])
  ]);
  const result = await collectGitHubData({
    allowlist,
    existingProjects,
    existingActivity,
    token: process.env.GITHUB_TOKEN || ''
  });

  await Promise.all([
    writeFile(projectsFile, `${JSON.stringify(result.projects, null, 2)}\n`),
    writeFile(activityFile, `${JSON.stringify(result.activity, null, 2)}\n`)
  ]);

  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  generateGitHubData()
    .then(({ projects, activity }) => {
      console.log(`GitHub: ${projects.length} proyectos seleccionados; ${activity.length} estados conservados.`);
    })
    .catch(() => {
      console.error('No fue posible actualizar los datos seleccionados de GitHub.');
      process.exitCode = 1;
    });
}
