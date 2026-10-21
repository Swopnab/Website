'use strict';

// Progressive enhancement of the existing, server-readable skills directory.
// The original articles are the single source of displayed skill content.
(() => {
  const root = document.querySelector('.toolkit-panel');
  const directory = root?.querySelector('.toolkit-directory');
  const search = root?.querySelector('.skill-search input');
  if (!directory || !search || !window.PortfolioArcPicker) return;
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
  let active = null;
  let pinned = false;
  let listView = false;
  const workbench = document.createElement('div');
  workbench.className = 'orbital-workbench';
  workbench.id = 'skill-system';
  // Only local, fixed markup is templated. Profile/search values use textContent.
  workbench.innerHTML = `
    <div class="orbit-caption"><span class="eyebrow">A CONNECTED TOOLKIT</span><span>10 categories / ${total} skills</span></div>
    <div class="orbit-stage">
      <div class="orbit-scene" role="group" aria-label="Hover or focus a skill category">
        <div class="orbit-ring orbit-ring-outer" aria-hidden="true"></div><div class="orbit-ring orbit-ring-inner" aria-hidden="true"></div><div class="orbit-crosshair" aria-hidden="true"></div>
        <div class="orbit-core" aria-hidden="true"><span>S<span>.</span></span><small>ALWAYS EXPLORING</small></div>
        <div class="orbit-track">${categories.map(([label, icon], index) => `<div class="orbit-position" style="--node-angle:${index * 36}deg"><button type="button" class="orbit-node" data-orbit-node="${index}" aria-pressed="false" aria-controls="skill-category-${index}"><span class="orbit-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg></span><span class="orbit-node-label" data-number="${String(index+1).padStart(2,'0')}">${label}</span></button></div>`).join('')}</div>
      </div>
      <div class="orbit-detail glass-panel" hidden>
        <div class="orbit-detail-bar"><p class="eyebrow">INSIDE THE TOOLKIT</p><button type="button" class="orbit-close" aria-label="Close skill details">×</button></div>
        <p class="orbit-result-note" hidden></p><p class="orbit-selection-status sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
        <div class="orbit-related"><p class="eyebrow">CONNECTED CATEGORIES</p><div></div></div>
      </div>
    </div>
    <p class="orbit-instruction">Hover to discover. Tap to keep it open.<br><span>The orbit keeps moving. Explore the arc below.</span></p>
    <div class="orbit-arc-shell"><div class="orbit-arc"></div><p id="skill-arc-instructions">Drag sideways or use arrow keys to explore categories.</p></div>
    <div class="orbit-controls"><button type="button" class="orbit-view" aria-pressed="false">Browse all skills <span aria-hidden="true">↗</span></button></div>`;
  directory.before(workbench);
  const detail = workbench.querySelector('.orbit-detail');
  const scene = workbench.querySelector('.orbit-scene');
  const related = workbench.querySelector('.orbit-related');
  detail.insertBefore(directory, related);
  detail.insertBefore(empty, related);
  const nodes = [...workbench.querySelectorAll('.orbit-node')];
  const close = workbench.querySelector('.orbit-close');
  const view = workbench.querySelector('.orbit-view');
  const note = workbench.querySelector('.orbit-result-note');
  const status = workbench.querySelector('.orbit-selection-status');
  const picker = new window.PortfolioArcPicker(workbench.querySelector('.orbit-arc'), categories.map(([label], index) => ({label, name:names[index]})), index => choose(index, true));
  groups.forEach((group, index) => { group.id = `skill-category-${index}`; });
  function render(announce = true) {
    const query = search.value.trim().toLocaleLowerCase();
    const matches = groups.map(group => {
      let found=0;
      group.querySelectorAll('li').forEach(chip=>{chip.hidden=!chip.textContent.toLocaleLowerCase().includes(query);if(!chip.hidden)found++;});
      return found;
    });
    const found=matches.reduce((sum,n)=>sum+n,0);
    if (query && (active===null || !matches[active])) active=matches.findIndex(n=>n>0);
    if (active===-1) active=null;
    groups.forEach((group,index)=>{group.hidden=!matches[index]||(!listView&&active!==index);});
    nodes.forEach((node,index)=>{
      node.setAttribute('aria-pressed',String(!listView&&active===index));
      node.setAttribute('aria-disabled',String(!matches[index]));
      node.setAttribute('aria-label',`${names[index]}, ${matches[index]} ${query?'matching ':''}${matches[index]===1?'skill or tool':'skills and tools'}`);
      node.classList.toggle('is-related',active!==null&&categories[active][2].includes(index)&&matches[index]>0);
      picker.buttons[index].disabled=!matches[index];
    });
    picker.set(active);
    detail.hidden=!listView&&active===null&&found>0;
    workbench.classList.toggle('has-detail',!detail.hidden&&!listView);
    workbench.classList.toggle('is-list',listView);
    count.textContent=`${found} ${found===1?'skill or tool':'skills & tools'}`;
    empty.hidden=found>0;
    close.hidden=listView;
    note.hidden=!query||listView||!found;
    note.textContent=query&&found?`${matches[active]} of ${found} matches. Choose another lit node or browse all skills to see every match.`:'';
    related.hidden=listView||active===null;
    related.lastElementChild.replaceChildren();
    if(active!==null)categories[active][2].filter(i=>matches[i]>0).forEach(index=>{
      const button=document.createElement('button');button.type='button';button.textContent=`${categories[index][0]} ↗`;
      button.addEventListener('click',()=>{choose(index,true);close.focus({preventScroll:true});});related.lastElementChild.append(button);
    });
    if(!related.lastElementChild.children.length)related.hidden=true;
    view.textContent=listView?'Back to orbit ◎':'Browse all skills ↗';
    view.setAttribute('aria-pressed',String(listView));
    directory.classList.toggle('is-searching',!!query);
    if(announce)status.textContent=found===0?'No matching skills.':listView?`${found} skills and tools.`:active===null?'Skill details closed.':`${names[active]}. ${matches[active]} skills and tools.`;
  }
  function choose(index,pin=false) {
    if(nodes[index].getAttribute('aria-disabled')==='true')return;
    active=index;pinned=pin;render();
  }
  function dismiss() {
    active=null;pinned=false;
    if(search.value) {search.value='';}
    picker.set(null);render();
  }
  nodes.forEach((node,index)=>{
    node.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&!pinned)choose(index);});
    node.addEventListener('focus',()=>{if(!pinned)choose(index);});
    // Select on contact so a moving node cannot escape between press and release.
    node.addEventListener('pointerdown',event=>{if(event.isPrimary&&event.button===0)choose(index,true);});
    node.addEventListener('click',()=>choose(index,true));
  });
  // The hover card stays available while moving from a node into its content.
  workbench.addEventListener('pointerleave',()=>{if(!pinned&&!search.value&&!listView&&!workbench.contains(document.activeElement))dismiss();});
  workbench.addEventListener('focusout',event=>{if(!pinned&&!search.value&&!listView&&!workbench.contains(event.relatedTarget)&&!workbench.matches(':hover'))dismiss();});
  close.addEventListener('click',()=>{const previous=active;dismiss();if(previous!==null){pinned=true;nodes[previous].focus({preventScroll:true});pinned=false;}});
  workbench.addEventListener('keydown',event=>{if(event.key==='Escape'&&!listView){event.preventDefault();dismiss();search.focus({preventScroll:true});}});
  search.addEventListener('input',()=>{pinned=!!search.value;render();});
  view.addEventListener('click',()=>{listView=!listView;if(!listView){active=null;pinned=false;}render();});
  function sizeOrbit() {
    const compact=window.innerWidth<=600;
    const radius=Math.max(64,Math.min(290,(scene.clientWidth-(compact?68:160))/2,(scene.clientHeight-(compact?90:140))/2));
    scene.style.setProperty('--orbit-radius',`${radius}px`);
  }
  if('ResizeObserver'in window)new ResizeObserver(sizeOrbit).observe(scene);else window.addEventListener('resize',sizeOrbit);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>workbench.classList.toggle('is-offscreen',!entries[0].isIntersecting)).observe(workbench);
  document.addEventListener('visibilitychange',()=>workbench.classList.toggle('is-background',document.hidden));
  root.classList.add('orbital-ready');
  root.querySelector('.toolkit-panel-heading h3').textContent='Everything connects.';
  sizeOrbit();render(false);
})();
