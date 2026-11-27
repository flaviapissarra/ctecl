const GITHUB_USER = 'flaviapissarra';
const GITHUB_REPO = 'ctecl';
const PROJECTS_DIR = './p/';
const API_LIST_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/p`;
const CACHE_KEY = 'ctecl_projects_cache';
const CACHE_TTL = 10 * 60 * 1000;

let allProjects = [];

function getCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null;
    return parsed.data;
  } catch { return null; }
}

function setCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data })); } catch {}
}

async function listProjectFolders() {
  const cached = getCache();
  if (cached) return cached;
  try {
    const response = await fetch(API_LIST_URL, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
    if (!response.ok) throw new Error(`GitHub API status ${response.status}`);
    const items = await response.json();
    const folders = items.filter(item => item.type === 'dir').map(item => item.name);
    setCache(folders);
    return folders;
  } catch (error) {
    console.warn('Falha ao listar pastas via API:', error);
    return ['rag-customer-insights-engine', 'fact-checking-rag-agent', 'bi-llm-query-interface'];
  }
}

async function fetchProjectMetadata(folderName) {
  try {
    const response = await fetch(`${PROJECTS_DIR}${folderName}/metadata.json`);
    if (!response.ok) return null;
    const data = await response.json();
    return { ...data, folder: folderName };
  } catch { return null; }
}

function createProjectCard(project) {
  const card = document.createElement('a');
  card.className = 'project-card';
  card.href = `${PROJECTS_DIR}${project.folder}/`;
  card.innerHTML = `
    <span class="project-status">${project.status || 'In Development'}</span>
    <h3 class="project-title">${project.title}</h3>
    <p class="project-desc">${project.description}</p>
    <div class="tech-tags">
      ${(project.tags || []).map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
    </div>
  `;
  return card;
}

function renderProjects(projectsToRender) {
  const grid = document.getElementById('projectsGrid');
  const countEl = document.getElementById('projectCount');
  if (!grid) return;
  
  grid.innerHTML = '';
  if (projectsToRender.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>No projects found matching your search.</p></div>`;
    countEl.textContent = '0 projects';
    return;
  }
  projectsToRender.forEach(p => grid.appendChild(createProjectCard(p)));
  countEl.textContent = `${projectsToRender.length} project${projectsToRender.length !== 1 ? 's' : ''}`;
}

function filterProjects(query) {
  const q = query.toLowerCase().trim();
  if (!q) return allProjects;
  return allProjects.filter(p => {
    const haystack = [p.title, p.description, p.category, ...(p.tags || [])].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

async function init() {
  const grid = document.getElementById('projectsGrid');
  const searchInput = document.getElementById('searchInput');
  if (!grid) return;

  grid.innerHTML = '<div class="empty-state"><p>Loading projects...</p></div>';
  const folders = await listProjectFolders();
  const results = await Promise.all(folders.map(fetchProjectMetadata));
  allProjects = results.filter(p => p !== null).sort((a, b) => a.title.localeCompare(b.title));
  
  renderProjects(allProjects);
  if (searchInput) {
    searchInput.addEventListener('input', e => renderProjects(filterProjects(e.target.value)));
  }
}

document.addEventListener('DOMContentLoaded', init);
