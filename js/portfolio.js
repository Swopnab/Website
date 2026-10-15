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

// Filter the case-study cards; the marquee remains a tour of selected work.
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
  document.querySelectorAll('[data-project-group]').forEach(group => {
    group.hidden = ![...group.querySelectorAll('[data-project-category]')].some(card => !card.hidden);
  });
  projectCount.textContent = `Showing ${visible} ${visible === 1 ? 'project' : 'projects'}`;
}
projectFilterButtons.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
document.addEventListener('click', event => {
  if (event.target.closest('a[href^="#project-"]')) filterProjects('all');
});

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

// Pause the decorative marquee while keeping project links usable.
const projectMarquee = document.querySelector('.project-marquee');
const marqueeToggle = document.querySelector('.marquee-toggle');
marqueeToggle.addEventListener('click', () => {
  const paused = projectMarquee.classList.toggle('is-paused');
  marqueeToggle.setAttribute('aria-pressed', String(paused));
  marqueeToggle.setAttribute('aria-label', paused ? 'Resume project animation' : 'Pause project animation');
  marqueeToggle.innerHTML = paused ? 'RESUME ANIMATION <span aria-hidden="true">▶</span>' : 'PAUSE ANIMATION <span aria-hidden="true">Ⅱ</span>';
});
// Keep legacy links working after retiring the alternate mode.
if (location.hash === '#jujutsu') history.replaceState(null, '', '#home');

// Share one animation-frame update for pointer depth and the red card spotlight.
const depthMedia = window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');
const depthCards = document.querySelectorAll('.project-card, .map-card, .link-grid > a, .marquee-card, .recent-project, .capability-grid article, .education-card');
const pointerFrames = new WeakMap();
function resetDepth(card) {
  const pending = pointerFrames.get(card);
  if (pending) cancelAnimationFrame(pending);
  pointerFrames.delete(card);
  ['--rotate-x', '--rotate-y', '--spot-x', '--spot-y', '--glow-active'].forEach(property => card.style.removeProperty(property));
}
depthCards.forEach(card => {
  card.setAttribute('data-spotlight', '');
  card.addEventListener('pointermove', event => {
    if (!depthMedia.matches || event.pointerType === 'touch') return;
    const pending = pointerFrames.get(card);
    if (pending) cancelAnimationFrame(pending);
    const clientX = event.clientX;
    const clientY = event.clientY;
    pointerFrames.set(card, requestAnimationFrame(() => {
      pointerFrames.delete(card);
      const bounds = card.getBoundingClientRect();
      const x = clientX - bounds.left;
      const y = clientY - bounds.top;
      card.style.setProperty('--spot-x', `${x.toFixed(2)}px`);
      card.style.setProperty('--spot-y', `${y.toFixed(2)}px`);
      card.style.setProperty('--glow-active', '1');
      if (card.matches('.project-card, .map-card')) {
        card.style.setProperty('--rotate-x', `${(-(y / bounds.height - .5) * 4).toFixed(2)}deg`);
        card.style.setProperty('--rotate-y', `${((x / bounds.width - .5) * 5).toFixed(2)}deg`);
      }
    }));
  });
  card.addEventListener('pointerleave', () => resetDepth(card));
});
depthMedia.addEventListener('change', () => depthCards.forEach(resetDepth));

// Native equivalent of the supplied scroll container's perspective transforms.
// Layout offsets remain stable while the panels themselves are transformed.
const scrollMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollPanels = [...document.querySelectorAll('.profile-section, .capability-grid article, .recent-project, .project-card, .ai-feature, .map-card, .education-card, .project-journey, .credentials-grid article, .link-grid > a, .offscreen figure, .contact-route')];
const scrollHeadings = [...document.querySelectorAll('.hero-copy, .section-bar > div, .adventure-heading > div, .projects-hero-copy, .offscreen-title, .contact-section > div:first-child')];
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
    const distance = Math.min(target.offsetHeight, height) * .6 + height * .2;
    const progress = Math.max(0, Math.min(1, (height - top) / distance));
    updates.push({target, remaining: 1 - progress});
  });
  updates.forEach(({target, remaining}) => {
    if (target.classList.contains('scroll-heading')) {
      target.style.setProperty('--heading-y', `${(remaining * 16).toFixed(2)}px`);
    } else {
      target.style.setProperty('--scroll-rotate', `${(remaining * (mobile ? 9 : 20)).toFixed(2)}deg`);
      target.style.setProperty('--scroll-scale', (1 - remaining * (mobile ? .04 : .035)).toFixed(4));
      target.style.setProperty('--scroll-y', `${(remaining * (mobile ? 16 : 28)).toFixed(2)}px`);
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
if (document.fonts?.ready) document.fonts.ready.then(queueScrollMotion);
queueScrollMotion();
