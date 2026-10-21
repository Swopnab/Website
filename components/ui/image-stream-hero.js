'use strict';

// Two perspective rails, adapted from the supplied image-stream geometry.
// Each original project article appears once and retains its own real links.
(() => {
  const grid = document.querySelector('.project-grid');
  const cards = [...(grid?.querySelectorAll('.project-card') || [])];
  if (!cards.length) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.createElement('div');
  root.className = 'project-stream';
  const top = document.createElement('div');
  top.className = 'stream-topline';
  const hint = document.createElement('p');
  hint.textContent = 'Hover to hold. Open a demo and look inside the build.';
  const view = document.createElement('button');
  view.type = 'button';
  view.className = 'stream-view';
  view.setAttribute('aria-pressed', 'false');
  top.append(hint, view);
  const stage = document.createElement('div');
  stage.className = 'stream-stage';
  stage.setAttribute('aria-label', 'Moving project showcase');
  grid.before(root);
  stage.append(grid);
  root.append(top, stage);
  const items = cards.map(card => {
    const item = document.createElement('div');
    item.className = 'stream-item';
    card.before(item);
    item.append(card);
    return item;
  });
  const style = document.createElement('style');
  function keyframes(direction, name) {
    const steps = [];
    for (let s = 0; s <= 36; s++) {
      const u = s / 36;
      const scale = 8 / 32 * Math.pow(53 / 8, u);
      const depth = 36 * (1 - 1 / scale);
      const rail = 40 - 50 * Math.pow(1 - u, 3.3);
      const turn = 6 + 20 * u;
      steps.push(`${(u * 100).toFixed(2)}%{transform:translate3d(${(direction * rail).toFixed(3)}cqw,0,${depth.toFixed(3)}cqw) rotateY(${(-direction * turn).toFixed(3)}deg)}`);
    }
    return `@keyframes ${name}{${steps.join('')}}`;
  }
  style.textContent = keyframes(1, 'portfolio-stream-right') + keyframes(-1, 'portfolio-stream-left');
  root.prepend(style);
  let list = false;
  function setView(value) {
    list = value;
    root.classList.toggle('is-list', list);
    view.setAttribute('aria-pressed', String(list));
    view.textContent = list ? 'Back to stream ↗' : 'Browse project list ↗';
    view.hidden = reducedMotion.matches;
    hint.textContent = list ? 'Every project, with demo links and build notes.' : 'Hover to hold. Open a demo and look inside the build.';
  }
  function layout() {
    const visible = items.filter((item, index) => {
      item.hidden = cards[index].hidden;
      return !item.hidden;
    });
    const rails = [visible.filter((_, i) => i % 2 === 0), visible.filter((_, i) => i % 2 !== 0)];
    rails.forEach((rail, side) => rail.forEach((item, index) => {
      item.style.animationName = side ? 'portfolio-stream-right' : 'portfolio-stream-left';
      item.style.animationDelay = `${-((index + .5) * 40 / rail.length).toFixed(3)}s`;
    }));
    root.classList.toggle('is-single', visible.length < 2);
  }
  view.addEventListener('click', () => setView(!list));
  document.addEventListener('portfolio:projects-filtered', layout);
  document.addEventListener('click', event => {
    if (event.target.closest('a[href^="#project-"]')) setView(true);
  });
  root.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') root.classList.add('is-touch-held'); });
  document.addEventListener('pointerdown', event => { if (!root.contains(event.target)) root.classList.remove('is-touch-held'); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => root.classList.toggle('is-offscreen', !entries[0].isIntersecting)).observe(root);
  document.addEventListener('visibilitychange', () => root.classList.toggle('is-background', document.hidden));
  root.classList.add('stream-ready');
  setView(reducedMotion.matches || (location.hash.startsWith('#project-') && location.hash !== '#project-details'));
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) setView(true); else view.hidden = false; });
  layout();
})();
