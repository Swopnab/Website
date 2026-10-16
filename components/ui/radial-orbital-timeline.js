'use strict';

// Progressive enhancement of the existing, server-readable skills directory.
// The original articles are the single source of displayed skill content.
(() => {
  const root = document.querySelector('.toolkit-panel');
  const directory = root?.querySelector('.toolkit-directory');
  const search = root?.querySelector('.skill-search input');
  if (!directory || !search) return;
  const groups = [...directory.querySelectorAll('.toolkit-group')];
  const count = root.querySelector('.skill-search-count');
  const empty = root.querySelector('.toolkit-empty');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const categories = [
    ['Code', '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>', [1, 2, 6]],
    ['Web & APIs', '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>', [0, 3, 5]],
    ['AI & vision', '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>', [0, 3, 5]],
    ['Data & cloud', '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>', [1, 2, 4]],
    ['Security', '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6"/>', [1, 3, 6]],
    ['Browser', '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 10 5 3-5 3Z"/>', [1, 2, 8]],
    ['Delivery', '<path d="m5 12 4 4L19 6M4 3h16v18H4Z"/>', [0, 4, 7]],
    ['Dev tools', '<path d="m14 5 5-2-2 5-3 1-7 11-3-3 10-8Z"/>', [0, 6, 8]],
    ['Creative', '<path d="m15 3 6 6L9 21H3v-6ZM12 6l6 6"/>', [1, 5, 9]],
    ['Teamwork', '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 2 4v2"/>', [6, 7, 8]],
  ];
  if (groups.length !== categories.length) return;
  const names = groups.map(group => group.querySelector('h3').textContent);
  const total = groups.reduce((sum, group) => sum + group.querySelectorAll('li').length, 0);
  let active = 2;
  let paused = false;
  let listView = false;

  const workbench = document.createElement('div');
  workbench.className = 'orbital-workbench';
  workbench.id = 'skill-system';
  // All template values are local constants or numeric indexes, never remote HTML.
  workbench.innerHTML = `
    <div class="orbit-map">
      <div class="orbit-caption"><span class="eyebrow">CONNECTED BY CURIOSITY</span><span>10 categories / ${total} skills</span></div>
      <div class="orbit-scene" role="group" aria-label="Explore skill categories">
        <div class="orbit-ring orbit-ring-outer" aria-hidden="true"></div>
        <div class="orbit-ring orbit-ring-inner" aria-hidden="true"></div>
        <div class="orbit-crosshair" aria-hidden="true"></div>
        <div class="orbit-core" aria-hidden="true"><span>S<span>.</span></span><small>THE TOOLKIT</small></div>
        <div class="orbit-track">
          ${categories.map(([label, icon], index) => `<div class="orbit-position" style="--node-angle:${index * 36}deg"><button type="button" class="orbit-node" data-orbit-node="${index}" aria-pressed="false" aria-controls="skill-category-${index}"><span class="orbit-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg></span><span class="orbit-node-label" data-number="${String(index + 1).padStart(2, '0')}">${label}</span></button></div>`).join('')}
        </div>
      </div>
      <p class="orbit-instruction">Select a node to look inside.<br><span>Hover or focus to hold the orbit.</span></p>
      <label class="orbit-picker">Choose a category<select aria-label="Choose a skill category">${categories.map((_, index) => `<option value="${index}"></option>`).join('')}</select></label>
      <div class="orbit-controls"><button type="button" class="orbit-play" aria-pressed="false">Pause orbit <span aria-hidden="true">Ⅱ</span></button><button type="button" class="orbit-view" aria-pressed="false">List view <span aria-hidden="true">☷</span></button></div>
    </div>
    <div class="orbit-detail">
      <div class="orbit-detail-bar"><p class="eyebrow">INSIDE THE TOOLKIT</p><button class="orbit-close" type="button" aria-label="Close skill category">×</button></div>
      <p class="orbit-result-note" hidden></p>
      <div class="orbit-overview" hidden><p class="eyebrow">A LITTLE BIT OF EVERYTHING</p><h3>Pick your starting point<span>.</span></h3><p>Explore the orbit to see my languages, tools, and practical skills. Connected categories show how they come together.</p><button type="button" class="orbit-start">Explore AI & vision <span aria-hidden="true">↗</span></button></div>
      <p class="orbit-selection-status sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
      <div class="orbit-related"><p class="eyebrow">CONNECTED CATEGORIES</p><div></div></div>
    </div>`;
  directory.before(workbench);
  const detail = workbench.querySelector('.orbit-detail');
  detail.insertBefore(directory, workbench.querySelector('.orbit-related'));
  detail.insertBefore(empty, workbench.querySelector('.orbit-related'));
  const nodes = [...workbench.querySelectorAll('[data-orbit-node]')];
  const select = workbench.querySelector('select');
  const related = workbench.querySelector('.orbit-related');
  const overview = workbench.querySelector('.orbit-overview');
  const close = workbench.querySelector('.orbit-close');
  const play = workbench.querySelector('.orbit-play');
  const view = workbench.querySelector('.orbit-view');
  const status = workbench.querySelector('.orbit-selection-status');
  const resultNote = workbench.querySelector('.orbit-result-note');
  groups.forEach((group, index) => {
    group.id = `skill-category-${index}`;
    nodes[index].setAttribute('aria-label', names[index]);
    select.options[index].textContent = names[index];
  });

  function render(announce = true) {
    const query = search.value.trim().toLocaleLowerCase();
    const matches = groups.map(group => {
      let found = 0;
      group.querySelectorAll('li').forEach(chip => {
        chip.hidden = !chip.textContent.toLocaleLowerCase().includes(query);
        if (!chip.hidden) found++;
      });
      return found;
    });
    const found = matches.reduce((sum, value) => sum + value, 0);
    // Filtering changes selection only when the current category has no results.
    if (query && (active === null || matches[active] === 0)) active = matches.findIndex(value => value > 0);
    if (active === -1) active = null;
    groups.forEach((group, index) => { group.hidden = !matches[index] || (!listView && active !== index); });
    nodes.forEach((node, index) => {
      node.setAttribute('aria-pressed', String(!listView && active === index));
      node.setAttribute('aria-disabled', String(!matches[index]));
      node.classList.toggle('is-related', !listView && active !== null && categories[active][2].includes(index) && matches[index] > 0);
      node.setAttribute('aria-label', `${names[index]}, ${matches[index]} ${query ? 'matching ' : ''}${matches[index] === 1 ? 'skill or tool' : 'skills and tools'}`);
      select.options[index].disabled = !matches[index];
      select.options[index].textContent = `${String(index + 1).padStart(2, '0')} / ${names[index]}${query ? ` (${matches[index]})` : ''}`;
    });
    select.value = active === null ? '' : String(active);
    count.textContent = `${found} ${found === 1 ? 'skill or tool' : 'skills & tools'}`;
    empty.hidden = found > 0;
    resultNote.hidden = !query || listView || !found;
    resultNote.textContent = query && found ? `${matches[active]} of ${found} matches shown here. Choose another lit node, or use List view to see all matches.` : '';
    overview.hidden = listView || active !== null || found === 0;
    close.hidden = listView || active === null || !!query;
    related.hidden = listView || active === null;
    related.lastElementChild.replaceChildren();
    if (active !== null) {
      categories[active][2].filter(index => matches[index] > 0).forEach(index => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${categories[index][0]} ↗`;
        button.addEventListener('click', () => choose(index, true));
        related.lastElementChild.append(button);
      });
      related.hidden = listView || !related.lastElementChild.children.length;
    }
    workbench.classList.toggle('is-paused', paused || !!query || listView || reduceMotion.matches);
    workbench.classList.toggle('is-list', listView);
    play.textContent = paused ? 'Resume orbit ↻' : 'Pause orbit Ⅱ';
    play.disabled = !!query;
    if (query) play.textContent = 'Search holds orbit';
    play.setAttribute('aria-pressed', String(paused));
    play.hidden = reduceMotion.matches || listView;
    view.textContent = listView ? 'Orbit view ◎' : 'List view ☷';
    view.setAttribute('aria-pressed', String(listView));
    directory.classList.toggle('is-searching', query.length > 0);
    if (announce) status.textContent = found === 0 ? 'No matching skills.' : listView ? `List view. ${found} skills and tools.` : active === null ? 'Category closed. Choose another node.' : `${names[active]}. ${matches[active]} ${query ? 'matching ' : ''}skills and tools.`;
  }
  function choose(index, moveFocus = false) {
    if (nodes[index].getAttribute('aria-disabled') === 'true') return;
    active = index;
    paused = true;
    render();
    // Connected buttons are replaced on selection; put focus on a stable control.
    if (moveFocus) nodes[index].focus({preventScroll: true});
  }
  nodes.forEach((node, index) => node.addEventListener('click', () => choose(index)));
  select.addEventListener('change', () => choose(Number(select.value)));
  search.addEventListener('input', () => render());
  play.addEventListener('click', () => { paused = !paused; render(false); });
  view.addEventListener('click', () => { listView = !listView; render(); });
  function closeCategory() {
    if (active !== null) nodes[active].focus({preventScroll: true});
    active = null;
    render();
  }
  close.addEventListener('click', closeCategory);
  workbench.querySelector('.orbit-start').addEventListener('click', () => choose(2, true));
  workbench.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !listView && active !== null && !search.value) { event.preventDefault(); closeCategory(); }
  });
  reduceMotion.addEventListener('change', () => render(false));
  const scene = workbench.querySelector('.orbit-scene');
  function sizeOrbit() {
    const gutter = window.innerWidth <= 600 ? 64 : 102;
    scene.style.setProperty('--orbit-radius', `${Math.min(178, Math.max(60, (scene.clientWidth - gutter) / 2))}px`);
  }
  if ('ResizeObserver' in window) new ResizeObserver(sizeOrbit).observe(scene);
  else window.addEventListener('resize', sizeOrbit);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => workbench.classList.toggle('is-offscreen', !entries[0].isIntersecting)).observe(workbench);
  }
  document.addEventListener('visibilitychange', () => workbench.classList.toggle('is-background', document.hidden));
  root.classList.add('orbital-ready');
  root.querySelector('.toolkit-panel-heading h3').textContent = 'Explore my skill system.';
  sizeOrbit();
  render(false);
})();
