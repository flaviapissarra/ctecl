const GITHUB_USER = 'flaviapissarra';
const GITHUB_REPO = 'ctecl';
const PROJECTS_DIR = './p/';
const API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/p`;

let allProjects = [];

async function init() {
  const grid = document.getElementById('projectsGrid');
  const countEl = document.getElementById('projectCount');
  
  if (!grid) return; // Segurança caso o ID não exista
  
  grid.innerHTML = '<div class="empty-state">Loading repository data...</div>';

  try {
    // 1. Busca as pastas
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    
    const folders = data.filter(item => item.type === 'dir').map(item => item.name);
    
    // 2. Busca os metadata.json de cada pasta
    const promises = folders.map(async (folder) => {
      try {
        const metaRes = await fetch(`${PROJECTS_DIR}${folder}/metadata.json`);
        if (!metaRes.ok) return null;
        const meta = await metaRes.json();
        return { ...meta, folder };
      } catch (e) { return null; }
    });

    const results = await Promise.all(promises);
    allProjects = results.filter(p => p !== null).sort((a, b) => a.title.localeCompare(b.title));

    renderProjects(allProjects);
    
    // Configura a busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allProjects.filter(p => 
          p.title.toLowerCase().includes(term) || 
          p.tags.some(t => t.toLowerCase().includes(term))
        );
        renderProjects(filtered);
      });
    }

  } catch (error) {
    console.error(error);
    grid.innerHTML = '<div class="empty-state">Error loading projects. Please try again later.</div>';
  }
}

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  const countEl = document.getElementById('projectCount');
  
  grid.innerHTML = '';
  countEl.textContent = `${projects.length} project${projects.length !== 1 ? 's' : ''}`;

  if (projects.length === 0) {
    grid.innerHTML = '<div class="empty-state">No projects found matching your search.</div>';
    return;
  }

  projects.forEach(proj => {
    const card = document.createElement('a');
    card.className = 'project-card'; // Classe essencial para o CSS
    card.href = `${PROJECTS_DIR}${proj.folder}/`;
    
    // Construção segura do HTML interno
    const tagsHtml = (proj.tags || []).map(tag => `<span class="tech-tag">#${tag}</span>`).join('');
    
    card.innerHTML = `
      <span class="project-status">${proj.status || 'In Dev'}</span>
      <h3 class="project-title">${proj.title}</h3>
      <p class="project-desc">${proj.description}</p>
      <div class="tech-tags">${tagsHtml}</div>
    `;
    
    grid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', init);
