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
  if (document.body.classList.contains('jujutsu-mode')) {
    railLinks.forEach(link => link.removeAttribute('aria-current'));
    return;
  }
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

// Adapt the supplied squeeze carousel to the existing static site. Both modes
// use the same project data, so their descriptions and destinations stay in sync.
const projectSlides = [...document.querySelectorAll('.project-card')].map(card => ({
  title: card.querySelector('h3').textContent,
  image: card.querySelector('img').getAttribute('src'),
  imageAlt: card.querySelector('img').alt,
  category: card.querySelector('.project-heading p').textContent,
  description: card.querySelector('.project-description').textContent,
  tags: card.querySelector('.tags').cloneNode(true),
  links: card.querySelector('.project-links').cloneNode(true)
}));
const aiFeature = document.querySelector('.ai-feature');
projectSlides.push({
  title: aiFeature.querySelector('h3').textContent,
  category: 'Persistent memory / Local AI assistant',
  description: aiFeature.querySelector('.ai-copy > p').textContent,
  links: aiFeature.querySelector('.project-links').cloneNode(true)
});
const carouselMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function createSqueezeCarousel(container, slides, label, id) {
  let active = 0;
  const root = document.createElement('div');
  root.className = 'squeeze-carousel';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', label);
  const controls = document.createElement('div');
  controls.className = 'squeeze-controls';
  const count = document.createElement('span');
  count.className = 'squeeze-count';
  controls.append(count);
  const makeArrow = (direction, text) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'squeeze-arrow';
    button.setAttribute('aria-label', text);
    button.textContent = direction < 0 ? '←' : '→';
    button.addEventListener('click', () => select(active + direction));
    controls.append(button);
  };
  makeArrow(-1, 'Previous project');
  makeArrow(1, 'Next project');
  const strip = document.createElement('div');
  strip.className = 'squeeze-strip';
  strip.setAttribute('role', 'tablist');
  strip.setAttribute('aria-label', label);
  strip.setAttribute('aria-orientation', 'horizontal');
  const panel = document.createElement('div');
  panel.className = 'squeeze-detail';
  panel.id = `${id}-panel`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-live', 'polite');
  const tabs = slides.map((slide, i) => {
    const button = document.createElement('button');
    button.className = 'squeeze-tab';
    button.type = 'button';
    button.id = `${id}-tab-${i}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-label', slide.title);
    button.setAttribute('aria-controls', panel.id);
    if (slide.image) {
      const image = document.createElement('img');
      image.src = slide.image;
      image.alt = slide.imageAlt;
      image.loading = 'lazy';
      image.draggable = false;
      button.append(image);
    } else {
      const art = document.createElement('span');
      art.className = 'squeeze-ai-art';
      art.setAttribute('aria-hidden', 'true');
      art.innerHTML = '<i></i><i></i><i></i><strong>z<span>✦</span></strong>';
      button.append(art);
    }
    const caption = document.createElement('span');
    caption.className = 'squeeze-caption';
    const number = document.createElement('small');
    number.textContent = `${String(i + 1).padStart(2, '0')} / ${slide.category}`;
    const title = document.createElement('strong');
    title.textContent = slide.title;
    caption.append(number, title);
    button.append(caption);
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', event => {
      const target = event.key === 'ArrowRight' ? active + 1 : event.key === 'ArrowLeft' ? active - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : null;
      if (target === null) return;
      event.preventDefault();
      select(target);
      tabs[active].focus({preventScroll: true});
    });
    strip.append(button);
    return button;
  });
  function select(index) {
    active = (index + slides.length) % slides.length;
    tabs.forEach((button, i) => {
      const position = (i - active + slides.length) % slides.length;
      button.style.order = position;
      button.style.setProperty('--panel-share', [6, 1.6, .9, .35][position]);
      button.setAttribute('aria-selected', String(i === active));
      button.tabIndex = i === active ? 0 : -1;
    });
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    panel.setAttribute('aria-labelledby', tabs[active].id);
    const slide = slides[active];
    const copy = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = slide.title;
    const description = document.createElement('p');
    description.textContent = slide.description;
    copy.append(title, description);
    if (slide.tags) copy.append(slide.tags.cloneNode(true));
    panel.replaceChildren(copy, slide.links.cloneNode(true));
    if (!carouselMotion.matches) copy.animate([{opacity: .3, transform: 'translateY(6px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 300});
  }
  root.append(controls, strip, panel);
  container.append(root);
  select(0);
}
const mainCarousel = document.createElement('div');
document.querySelector('.projects-grid').before(mainCarousel);
createSqueezeCarousel(mainCarousel, projectSlides, 'Featured projects', 'work');
document.getElementById('projects').classList.add('squeeze-enhanced');
const techniqueNames = ['Gesture control', 'Barrier technique', 'Opportunity tracking', 'Memory weaving'];
createSqueezeCarousel(document.getElementById('technique-carousel'), projectSlides.map((slide, i) => ({...slide, category: `${techniqueNames[i]} / ${slide.title}`})), 'Cursed techniques', 'technique');
document.querySelector('.technique-showcase').hidden = false;

// Share one animation-frame update for pointer depth and the red card spotlight.
const depthMedia = window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');
const depthCards = document.querySelectorAll('.project-card, .map-card, .link-grid > a, .dossier-group, .squeeze-tab, .domain-techniques > a');
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

// A small interactive reveal for the Jujutsu-inspired alter ego.
const domainButton = document.querySelector('.domain-button');
const domainContent = document.getElementById('domain-content');
const jujutsuSection = document.getElementById('jujutsu');
domainButton.addEventListener('click', () => {
  const expanded = domainButton.getAttribute('aria-expanded') !== 'true';
  domainButton.setAttribute('aria-expanded', String(expanded));
  domainContent.hidden = !expanded;
  jujutsuSection.classList.toggle('domain-open', expanded);
  domainButton.querySelector('.domain-button-label').textContent = expanded ? 'CLOSE DOMAIN' : 'EXPAND DOMAIN';
});


// Keep the alternate experience behind a theme-style mode switch.
const modeSwitch = document.querySelector('.mode-switch');
const modeExit = document.querySelector('.exit-mode');
let jujutsuMode = false;
function setJujutsuMode(enabled, {persist = true, navigate = false} = {}) {
  jujutsuMode = enabled;
  document.body.classList.toggle('jujutsu-mode', enabled);
  jujutsuSection.hidden = !enabled;
  modeSwitch.setAttribute('aria-checked', String(enabled));
  document.querySelector('footer a').setAttribute('href', enabled ? '#main' : '#home');
  navigationTarget = null;
  if (!enabled) {
    domainContent.hidden = true;
    domainButton.setAttribute('aria-expanded', 'false');
    domainButton.querySelector('.domain-button-label').textContent = 'EXPAND DOMAIN';
    jujutsuSection.classList.remove('domain-open');
  }
  if (persist) {
    try { localStorage.setItem('portfolio-mode', enabled ? 'jujutsu' : 'normal'); }
    catch { /* The switch still works when browser storage is unavailable. */ }
  }
  if (navigate) {
    history.replaceState(null, '', enabled ? '#jujutsu' : '#home');
    window.scrollTo({top: 0, behavior: 'instant'});
  }
  updateActiveSection();
}
modeSwitch.addEventListener('click', () => {
  if (jujutsuMode) setJujutsuMode(false, {navigate: true});
  else beginDomainIntro();
});
modeExit.addEventListener('click', () => {
  setJujutsuMode(false, {navigate: true});
  modeSwitch.focus({preventScroll: true});
});
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || !jujutsuMode) return;
  const target = document.getElementById(link.getAttribute('href').slice(1));
  if (target?.matches('main > section:not(#jujutsu)')) setJujutsuMode(false);
});
let savedMode = null;
try { savedMode = localStorage.getItem('portfolio-mode'); } catch { /* Use the default mode. */ }
setJujutsuMode(location.hash === '#jujutsu' || savedMode === 'jujutsu', {persist: false});
window.addEventListener('hashchange', () => {
  if (location.hash === '#jujutsu') setJujutsuMode(true);
  else if (jujutsuMode && document.getElementById(location.hash.slice(1))?.matches('main > section:not(#jujutsu)')) setJujutsuMode(false);
});


const introDialog = document.getElementById('domain-intro');
const introSkip = document.querySelector('.intro-skip');
const introStatus = document.querySelector('.intro-status');
const introVideo = document.getElementById('intro-video');
const introSound = document.querySelector('.intro-sound');
const introReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let introTimers = [];
let introLoadTimer;
let introPlaying = false;
let videoFallback = false;
function clearIntroTimers() {
  introTimers.forEach(clearTimeout);
  introTimers = [];
  clearTimeout(introLoadTimer);
}
function finishDomainIntro() {
  if (!introPlaying) return;
  introPlaying = false;
  clearIntroTimers();
  introVideo.pause();
  introDialog.close();
  document.body.classList.remove('domain-transition');
  modeSwitch.removeAttribute('aria-busy');
  setJujutsuMode(true, {navigate: true});
  jujutsuSection.setAttribute('tabindex', '-1');
  jujutsuSection.focus({preventScroll: true});
}
function startVectorFallback() {
  if (!introPlaying || videoFallback) return;
  videoFallback = true;
  clearIntroTimers();
  introVideo.pause();
  introDialog.classList.remove('video-mode');
  introDialog.classList.add('vector-fallback');
  introStatus.textContent = 'THE DOMAIN IS FORMING';
  introTimers = [
    setTimeout(() => { introStatus.textContent = 'MALEVOLENT SHRINE'; }, 1700),
    setTimeout(() => { introStatus.textContent = 'WELCOME TO SPECIAL GRADE'; }, 3700),
    setTimeout(finishDomainIntro, 4900)
  ];
}
function watchIntroLoading() {
  if (!introPlaying || videoFallback) return;
  clearTimeout(introLoadTimer);
  introLoadTimer = setTimeout(startVectorFallback, 10000);
}
function beginDomainIntro() {
  if (introPlaying) return;
  if (introReducedMotion.matches || typeof introDialog.showModal !== 'function') {
    setJujutsuMode(true, {navigate: true});
    return;
  }
  introPlaying = true;
  videoFallback = false;
  clearIntroTimers();
  introDialog.classList.remove('vector-fallback');
  introDialog.classList.add('video-mode');
  introDialog.style.setProperty('--intro-progress', '0');
  introStatus.textContent = 'THE DOMAIN IS FORMING';
  document.body.classList.add('domain-transition');
  modeSwitch.setAttribute('aria-busy', 'true');
  introVideo.muted = true;
  introSound.setAttribute('aria-pressed', 'false');
  introSound.textContent = 'SOUND OFF';
  introDialog.showModal();
  try {
    introVideo.currentTime = 0;
    watchIntroLoading();
    const playing = introVideo.play();
    if (playing) playing.catch(() => {
      if (introPlaying) startVectorFallback();
    });
  } catch { startVectorFallback(); }
}
introVideo.addEventListener('playing', () => {
  if (introPlaying) clearTimeout(introLoadTimer);
});
introVideo.addEventListener('waiting', watchIntroLoading);
introVideo.addEventListener('error', startVectorFallback);
introVideo.addEventListener('ended', () => {
  if (introPlaying && !videoFallback) finishDomainIntro();
});
introVideo.addEventListener('timeupdate', () => {
  if (!introPlaying || videoFallback || !Number.isFinite(introVideo.duration)) return;
  const progress = Math.min(1, introVideo.currentTime / introVideo.duration);
  introDialog.style.setProperty('--intro-progress', String(progress));
  const status = progress > .75 ? 'WELCOME TO SPECIAL GRADE' : progress > .25 ? 'MALEVOLENT SHRINE' : 'THE DOMAIN IS FORMING';
  if (introStatus.textContent !== status) introStatus.textContent = status;
});
introSound.addEventListener('click', () => {
  introVideo.muted = !introVideo.muted;
  introSound.setAttribute('aria-pressed', String(!introVideo.muted));
  introSound.textContent = introVideo.muted ? 'SOUND OFF' : 'SOUND ON';
});
introSkip.addEventListener('click', finishDomainIntro);
introDialog.addEventListener('cancel', event => {
  event.preventDefault();
  finishDomainIntro();
});
document.querySelector('.replay-intro').addEventListener('click', beginDomainIntro);
introReducedMotion.addEventListener('change', event => {
  if (event.matches && introPlaying) finishDomainIntro();
});
