const allPages = ['about', 'dataviz', 'writing', 'art', 'resume'];

function showPage(name, updateHash = true) {
  const allPages = ['about', 'dataviz', 'writing', 'art', 'resume'];

  allPages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (!el) return;
    el.classList.remove('visible');
    el.classList.remove('active');
    el.style.display = 'none';
  });

  const target = document.getElementById('page-' + name);
  if (!target) return;

  target.style.display = 'flex';
  target.classList.add('active');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => target.classList.add('visible'));
  });

  const projectsDD = document.getElementById('projectsDD');
  if (projectsDD) projectsDD.classList.remove('open');

  const mobileNav = document.getElementById('mobileNav');
  if (mobileNav) mobileNav.classList.remove('open');

  const pag = document.getElementById('pagination');
  if (pag) {
    if (name === 'writing') {
      pag.style.display = 'flex';
      setTimeout(() => renderPagination(), 400);
    } else {
      pag.style.display = 'none';
    }
  }

  if (updateHash) {
    window.location.hash = name;
  }
}

function toggleDD() {
  document.getElementById('projectsDD').classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!document.getElementById('projectsDD').contains(e.target))
    document.getElementById('projectsDD').classList.remove('open');
});

document.addEventListener('click', e => {
  if (!e.target.closest('.custom-filter')) {
    document.querySelectorAll('.custom-filter').forEach(dd => dd.classList.remove('open'));
  }
});

function drawGrid() {
  const canvas = document.getElementById('gridCanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 67;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(154, 42, 42, 0.9)';
  ctx.lineWidth = 1.5;
  const step = 25;
  for (let y = 0; y < canvas.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let x = 0; x < canvas.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
}

// ── Paginación ────────────────────────────────────────
const CARDS_PER_PAGE = 9;
let currentPage = 1;

function addDots(container) {
  const dots = document.createElement('span');
  dots.textContent = '...';
  dots.style.color = '#E5B21E';
  dots.style.fontFamily = 'var(--hand)';
  dots.style.fontSize = '1.4rem';
  dots.style.padding = '0 0.3rem';
  dots.style.alignSelf = 'flex-end';
  container.appendChild(dots);
}

function addBtn(container, i) {
  const btn = document.createElement('button');
  btn.textContent = i;
  btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
  btn.onclick = () => {
    currentPage = i;
    renderPagination();
    document.getElementById('page-writing').scrollTop = 0;
  };
  container.appendChild(btn);
}

function renderPagination() {
  const allCards = Array.from(document.querySelectorAll('#cards-writing a'));
  const visible = allCards.filter(c => !c.dataset.hidden);
  const totalPages = Math.ceil(visible.length / CARDS_PER_PAGE);

  allCards.forEach(card => {
    if (card.dataset.hidden) {
      card.style.display = 'none';
      return;
    }
    const idx = visible.indexOf(card);
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    const end = start + CARDS_PER_PAGE;
    card.style.display = (idx >= start && idx < end) ? 'block' : 'none';
  });

  const container = document.getElementById('pagination');
  if (!container) return;
  container.innerHTML = '';
  if (totalPages <= 1) return;

  const pages = new Set();
  pages.add(1);
  pages.add(totalPages);
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  let prev = 0;
  sorted.forEach(i => {
    if (i - prev > 1) addDots(container);
    addBtn(container, i);
    prev = i;
  });
}

let activeFilters = {
  medio: 'all',
  idioma: 'all',
  tema: 'all',
  year: 'all'
};

function toggleFilterDropdown(id) {
  document.querySelectorAll('.custom-filter').forEach(dd => {
    if (dd.id !== id) dd.classList.remove('open');
  });

  document.getElementById(id).classList.toggle('open');
}

function setFilterValue(type, value, label) {
  activeFilters[type] = value;

  const labelMap = {
    medio: 'dropdown-medio-label',
    idioma: 'dropdown-idioma-label',
    tema: 'dropdown-tema-label',
    year: 'dropdown-year-label'
  };

  document.getElementById(labelMap[type]).textContent = label;
  document.getElementById('dropdown-' + type).classList.remove('open');

  filterCards();
}

function filterCards() {
  const cards = document.querySelectorAll('#cards-writing a');

  cards.forEach(card => {
    const mMatch = activeFilters.medio === 'all' || card.dataset.medio === activeFilters.medio;
    const iMatch = activeFilters.idioma === 'all' || card.dataset.idioma === activeFilters.idioma;
    const tMatch = activeFilters.tema === 'all' || card.dataset.tema === activeFilters.tema;
    const yMatch = activeFilters.year === 'all' || card.dataset.year === activeFilters.year;

    if (mMatch && iMatch && tMatch && yMatch) {
      delete card.dataset.hidden;
    } else {
      card.dataset.hidden = 'true';
    }
  });

  currentPage = 1;
  renderPagination();
}

function resetFilters() {
  activeFilters = {
    medio: 'all',
    idioma: 'all',
    tema: 'all',
    year: 'all'
  };

  document.getElementById('dropdown-medio-label').textContent = 'Outlet';
  document.getElementById('dropdown-idioma-label').textContent = 'Language';
  document.getElementById('dropdown-tema-label').textContent = 'Topic';
  document.getElementById('dropdown-year-label').textContent = 'Year';

  // 🔴 ESTA LÍNEA ES CLAVE
  document.querySelectorAll('.custom-filter').forEach(dd => dd.classList.remove('open'));

  currentPage = 1;
  filterCards();
}

window.addEventListener('load', () => {
  drawGrid();

  const savedPage = window.location.hash
    ? window.location.hash.replace('#', '')
    : 'about';

  const validPages = ['about', 'dataviz', 'writing', 'art', 'resume'];
  const pageToShow = validPages.includes(savedPage) ? savedPage : 'about';

  showPage(pageToShow, false);
});

window.addEventListener('resize', drawGrid);

let datavizFilters = {
  medio: 'all',
  idioma: 'all',
  tema: 'all',
  year: 'all'
};

function toggleDatavizDropdown(id) {
  document.querySelectorAll('#page-dataviz .custom-filter').forEach(dd => {
    if (dd.id !== id) dd.classList.remove('open');
  });
  document.getElementById(id).classList.toggle('open');
}

function setDatavizFilterValue(type, value, label) {
  datavizFilters[type] = value;

  const labelMap = {
    medio: 'dataviz-dropdown-medio-label',
    idioma: 'dataviz-dropdown-idioma-label',
    tema: 'dataviz-dropdown-tema-label',
    year: 'dataviz-dropdown-year-label'
  };

  document.getElementById(labelMap[type]).textContent = label;
  document.getElementById('dataviz-dropdown-' + type).classList.remove('open');

  filterDatavizCards();
}

function filterDatavizCards() {
  const cards = document.querySelectorAll('#cards-dataviz a');

  cards.forEach(card => {
    const mMatch = datavizFilters.medio === 'all' || card.dataset.medio === datavizFilters.medio;
    const iMatch = datavizFilters.idioma === 'all' || card.dataset.idioma === datavizFilters.idioma;
    const tMatch = datavizFilters.tema === 'all' || card.dataset.tema === datavizFilters.tema;
    const yMatch = datavizFilters.year === 'all' || card.dataset.year === datavizFilters.year;

    card.style.display = (mMatch && iMatch && tMatch && yMatch) ? 'block' : 'none';
  });
}

function resetDatavizFilters() {
  datavizFilters = {
    medio: 'all',
    idioma: 'all',
    tema: 'all',
    year: 'all'
  };

  document.getElementById('dataviz-dropdown-medio-label').textContent = 'Outlet';
  document.getElementById('dataviz-dropdown-idioma-label').textContent = 'Language';
  document.getElementById('dataviz-dropdown-tema-label').textContent = 'Topic';
  document.getElementById('dataviz-dropdown-year-label').textContent = 'Year';

  document.querySelectorAll('#page-dataviz .custom-filter').forEach(dd => dd.classList.remove('open'));

  filterDatavizCards();
}

document.addEventListener('click', e => {
  if (!e.target.closest('#page-dataviz .custom-filter')) {
    document.querySelectorAll('#page-dataviz .custom-filter').forEach(dd => dd.classList.remove('open'));
  }
});

function refreshDatavizPage() {
  resetDatavizFilters();
  document.getElementById('page-dataviz').scrollTop = 0;
  showPage('dataviz');
}

function refreshResumePage() {
  showPage('resume');

  const page = document.getElementById('page-resume');
  if (page) {
    page.scrollTop = 0;
  }

  const resumeImg = page ? page.querySelector('.resume-image') : null;
  if (resumeImg) {
    const currentSrc = resumeImg.src;
    resumeImg.src = '';
    requestAnimationFrame(() => {
      resumeImg.src = currentSrc;
    });
  }
}

function toggleMobileMenu() {
  const nav = document.getElementById('mobileNav');
  const btn = document.getElementById('hamburger');
  const open = nav.classList.toggle('open');

  btn.textContent = open ? '✕' : '☰';
  document.body.classList.toggle('menu-open', open);

  if (!open) {
    document.getElementById('mobileProjects').classList.remove('open');
  }
}

function closeMobileMenu() {
  const nav = document.getElementById('mobileNav');
  const btn = document.getElementById('hamburger');

  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
  document.getElementById('mobileProjects').classList.remove('open');
  btn.textContent = '☰';
}

function toggleMobileProjects() {
  document.getElementById('mobileProjects').classList.toggle('open');
}