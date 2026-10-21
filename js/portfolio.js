'use strict';
document.getElementById('footer-year').textContent = new Date().getFullYear();

// The control stays outside the rail so it can always reopen navigation.
const sidebar = document.getElementById('section-sidebar');
const sidebarToggle = document.querySelector('.rail-toggle');
function setSidebarCollapsed(collapsed, persist = true) {
  if (collapsed && sidebar.contains(document.activeElement)) sidebarToggle.focus();
  sidebar.hidden = collapsed;
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
  const label = collapsed ? 'Open navigation' : 'Collapse sidebar';
  sidebarToggle.setAttribute('aria-label', label);
  sidebarToggle.title = label;
  if (persist) {
    try { localStorage.setItem('portfolio-sidebar-collapsed', String(collapsed)); }
    catch { /* Navigation works when storage is unavailable. */ }
  }
}
let savedSidebarCollapsed = false;
try { savedSidebarCollapsed = localStorage.getItem('portfolio-sidebar-collapsed') === 'true'; } catch { /* Default to open. */ }
setSidebarCollapsed(savedSidebarCollapsed, false);
sidebarToggle.hidden = false;
sidebarToggle.addEventListener('click', () => setSidebarCollapsed(!sidebar.hidden));
sidebar.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    setSidebarCollapsed(true);
  }
});

// Each public project appears once; filtering preserves its inline build notes.
const projectFilterButtons = [...document.querySelectorAll('[data-filter]')];
const projectCards = [...document.querySelectorAll('[data-project-category]')];
const projectCount = document.querySelector('.project-count');
function filterProjects(category) {
  projectFilterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  let visible = 0;
  projectCards.forEach(card => {
    card.hidden = category !== 'all' && card.dataset.projectCategory !== category;
    if (!card.hidden) visible++;
  });
  projectCount.textContent = `Showing ${visible} ${visible === 1 ? 'project' : 'projects'}`;
  document.dispatchEvent(new Event('portfolio:projects-filtered'));
}
projectFilterButtons.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
document.addEventListener('click', event => {
  if (event.target.closest('a[href^="#project-"]')) filterProjects('all');
});
// Preserve older shared URLs after consolidating the project gallery.
if (location.hash === '#project-details') {
  history.replaceState(null, '', '#projects');
  document.getElementById('projects').scrollIntoView({behavior: 'instant'});
}

// Search fallback when the enhanced orbital component cannot load.
const skillSearch = document.querySelector('.skill-search input');
if (skillSearch && !document.querySelector('.orbital-ready')) {
  const skillGroups = [...document.querySelectorAll('.toolkit-group')];
  const skillChips = [...document.querySelectorAll('.toolkit-group .skill-chips li')];
  const skillSearchCount = document.querySelector('.skill-search-count');
  const skillEmpty = document.querySelector('.toolkit-empty');
  skillSearch.addEventListener('input', () => {
    const query = skillSearch.value.trim().toLocaleLowerCase();
    let visible = 0;
    skillChips.forEach(chip => {
      chip.hidden = !chip.textContent.toLocaleLowerCase().includes(query);
      if (!chip.hidden) visible++;
    });
    skillGroups.forEach(group => {
      group.hidden = ![...group.querySelectorAll('li')].some(chip => !chip.hidden);
    });
    document.querySelector('.toolkit-directory').classList.toggle('is-searching', query.length > 0);
    skillSearchCount.textContent = `${visible} ${visible === 1 ? 'skill or tool' : 'skills & tools'}`;
    skillEmpty.hidden = visible > 0;
  });
}

const copyEmailButton = document.querySelector('.copy-email');
const copyEmailStatus = document.querySelector('.copy-status');
let copyEmailTimer;
copyEmailButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('swopnabbikram@gmail.com');
    copyEmailStatus.textContent = 'Email address copied.';
    copyEmailButton.textContent = 'COPIED ✓';
    clearTimeout(copyEmailTimer);
    copyEmailTimer = setTimeout(() => { copyEmailButton.textContent = 'COPY EMAIL'; }, 2500);
  } catch {
    copyEmailStatus.textContent = 'Copy is unavailable. You can contact me using the email link.';
  }
});

// Update the rail from the section currently nearest the top of the viewport.
const railLinks = [...document.querySelectorAll('.rail-links a')];
const sections = railLinks.map(link => document.querySelector(link.getAttribute('href')));
let scrollQueued = false;
let navigationTarget = sections.find(section => `#${section.id}` === location.hash) || null;
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  navigationTarget = sections.find(section => `#${section.id}` === link.getAttribute('href')) || null;
  queueSectionUpdate();
});
function resumeScrollTracking() {
  navigationTarget = null;
  queueSectionUpdate();
}
window.addEventListener('wheel', resumeScrollTracking, {passive: true});
window.addEventListener('touchstart', resumeScrollTracking, {passive: true});
window.addEventListener('keydown', event => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) resumeScrollTracking();
});
function updateActiveSection() {
  scrollQueued = false;
  const targetY = window.innerHeight * .35;
  let active = sections[0];
  sections.forEach(section => {
    if (section.getBoundingClientRect().top <= targetY) active = section;
  });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) active = sections[sections.length - 1];
  if (navigationTarget) active = navigationTarget;
  railLinks.forEach(link => {
    if (link.getAttribute('href') === `#${active.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function queueSectionUpdate() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(updateActiveSection);
}
window.addEventListener('scroll', queueSectionUpdate, {passive: true});
window.addEventListener('resize', queueSectionUpdate);
window.addEventListener('load', updateActiveSection);
updateActiveSection();

// Keep legacy links working after retiring the alternate mode.
if (location.hash === '#jujutsu') history.replaceState(null, '', '#home');

// Native equivalent of the supplied scroll container's perspective transforms.
// Layout offsets remain stable while the panels themselves are transformed.
const scrollMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollPanels = [...document.querySelectorAll('.project-stream, .project-card, .orbital-workbench, .toolkit-group, .service-card, .services-invitation, .about-portrait, .about-story, .interest-card, .life-gallery figure, .curiosity-film, .certificate-card, .link-grid > a, .contact-route')].filter(panel => !panel.matches('.orbital-ready .toolkit-group, .stream-ready .project-card'));
const scrollHeadings = [...document.querySelectorAll('.hero-copy, .section-header > div, .toolkit-panel-heading, .services-heading, .life-heading, .contact-section > div:first-child')];
scrollPanels.forEach(panel => panel.classList.add('scroll-panel'));
scrollHeadings.forEach(heading => heading.classList.add('scroll-heading'));
const motionTargets = [...scrollPanels, ...scrollHeadings];
const nearbyMotionTargets = new Set();
let motionFrame;
function layoutTop(element) {
  let top = 0;
  for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}
function queueScrollMotion() {
  if (motionFrame || document.hidden) return;
  motionFrame = requestAnimationFrame(updateScrollMotion);
}
function updateScrollMotion() {
  motionFrame = undefined;
  if (scrollMotionPreference.matches) {
    motionTargets.forEach(target => ['--scroll-y', '--scroll-rotate', '--scroll-scale', '--heading-y'].forEach(property => target.style.removeProperty(property)));
    return;
  }
  const height = window.innerHeight;
  const mobile = window.innerWidth <= 768;
  const updates = [];
  nearbyMotionTargets.forEach(target => {
    if (!target.offsetHeight || target.closest('[hidden]')) return;
    const top = layoutTop(target) - window.scrollY;
    // Keep the entrance moving until the panel reaches the upper viewport.
    // A viewport-based range also gives short cards a visible animation.
    const distance = height * .8;
    const progress = Math.max(0, Math.min(1, (height - top) / distance));
    updates.push({target, remaining: 1 - progress});
  });
  updates.forEach(({target, remaining}) => {
    if (target.classList.contains('scroll-heading')) {
      target.style.setProperty('--heading-y', `${(remaining * (mobile ? 44 : 72)).toFixed(2)}px`);
    } else {
      const maxRotate = target.classList.contains('toolkit-group') ? (mobile ? 10 : 18) : (mobile ? 14 : 28);
      target.style.setProperty('--scroll-rotate', `${(remaining * maxRotate).toFixed(2)}deg`);
      target.style.setProperty('--scroll-scale', (1 - remaining * (mobile ? .08 : .12)).toFixed(4));
      target.style.setProperty('--scroll-y', `${(remaining * (mobile ? 48 : 88)).toFixed(2)}px`);
    }
  });
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) nearbyMotionTargets.add(entry.target);
      else nearbyMotionTargets.delete(entry.target);
    });
    queueScrollMotion();
  }, {rootMargin: '150px 0px'});
  motionTargets.forEach(target => observer.observe(target));
} else {
  motionTargets.forEach(target => nearbyMotionTargets.add(target));
}
window.addEventListener('scroll', queueScrollMotion, {passive: true});
window.addEventListener('resize', queueScrollMotion);
window.addEventListener('load', queueScrollMotion);
document.addEventListener('visibilitychange', queueScrollMotion);
document.addEventListener('toggle', queueScrollMotion, true);
scrollMotionPreference.addEventListener('change', queueScrollMotion);
if ('ResizeObserver' in window) new ResizeObserver(queueScrollMotion).observe(document.getElementById('main'));
window.addEventListener('hashchange', () => { queueSectionUpdate(); queueScrollMotion(); });
if (document.fonts?.ready) document.fonts.ready.then(queueScrollMotion);
queueScrollMotion();
