'use strict';
document.getElementById('footer-year').textContent = new Date().getFullYear();

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
const depthCards = document.querySelectorAll('.project-card, .map-card, .link-grid > a, .marquee-card');
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
