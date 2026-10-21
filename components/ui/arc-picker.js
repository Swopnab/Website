'use strict';

// Native adaptation of the supplied ArcPicker; labels are always text nodes.
window.PortfolioArcPicker = class {
  constructor(root, options, onChange) {
    this.root = root;
    this.options = options;
    this.onChange = onChange;
    this.position = 0;
    this.selected = null;
    this.drag = null;
    root.className = 'skill-arc-picker';
    root.setAttribute('role', 'radiogroup');
    root.setAttribute('aria-label', 'Explore skill categories with the arc picker');
    root.setAttribute('aria-orientation', 'horizontal');
    root.setAttribute('aria-describedby', 'skill-arc-instructions');
    this.buttons = options.map((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'radio');
      button.textContent = option.label;
      button.setAttribute('aria-label', option.name);
      button.addEventListener('click', () => this.choose(index));
      button.addEventListener('focus', () => { if (button.matches(':focus-visible') && this.selected !== index) this.choose(index); });
      root.append(button);
      return button;
    });
    root.addEventListener('keydown', event => {
      const actions = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1};
      let next;
      if (event.key in actions) next = this.enabledAt((this.selected ?? 0) + actions[event.key], actions[event.key]);
      else if (event.key === 'Home') next = this.enabledAt(0, 1);
      else if (event.key === 'End') next = this.enabledAt(options.length - 1, -1);
      else return;
      event.preventDefault();
      if (next !== -1) this.choose(next, true, true);
    });
    root.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      this.drag = {id: event.pointerId, x: event.clientX, y: event.clientY, start: this.position, last: event.clientX, time: performance.now(), velocity: 0, moved: false};
    });
    root.addEventListener('pointermove', event => {
      const drag = this.drag;
      if (!drag || drag.id !== event.pointerId) return;
      const delta = event.clientX - drag.x;
      if (!drag.moved && Math.abs(event.clientY - drag.y) > Math.abs(delta) && Math.abs(event.clientY - drag.y) > 6) { this.drag = null; return; }
      if (!drag.moved && Math.abs(delta) < 6) return;
      drag.moved = true;
      root.setPointerCapture(event.pointerId);
      const now = performance.now();
      drag.velocity = (drag.last - event.clientX) / Math.max(8, now - drag.time) * 1000 / this.spacing;
      drag.time = now;
      drag.last = event.clientX;
      this.position = Math.max(0, Math.min(options.length - 1, drag.start - delta / this.spacing));
      this.paint(true);
    });
    const release = event => {
      const drag = this.drag;
      if (!drag || drag.id !== event.pointerId) return;
      this.drag = null;
      if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
      if (!drag.moved) return;
      this.suppressClick = true;
      const coast = event.type === 'pointerup' && performance.now() - drag.time < 100 ? drag.velocity * .18 : 0;
      const target = Math.round(Math.max(0, Math.min(options.length - 1, this.position + coast)));
      const nearest = this.nearestEnabled(target);
      if (nearest !== -1) this.choose(nearest);
      else this.paint();
    };
    root.addEventListener('pointerup', release);
    root.addEventListener('pointercancel', release);
    root.addEventListener('lostpointercapture', release);
    root.addEventListener('click', event => { if (this.suppressClick && event.detail) { this.suppressClick = false; event.preventDefault(); event.stopImmediatePropagation(); } }, true);
    // Ordinary vertical scrolling remains page scrolling.
    root.addEventListener('wheel', event => {
      if (Math.abs(event.deltaX) < Math.abs(event.deltaY) && !event.shiftKey) return;
      const delta = event.deltaX || event.deltaY;
      const next = this.enabledAt((this.selected ?? 0) + (delta > 0 ? 1 : -1), delta > 0 ? 1 : -1);
      if (next === -1) return;
      event.preventDefault();
      if (!this.wheelFrame) {
        this.choose(next);
        this.wheelFrame = setTimeout(() => { this.wheelFrame = null; }, 130);
      }
    }, {passive: false});
    if ('ResizeObserver' in window) new ResizeObserver(() => this.paint()).observe(root);
    this.paint();
  }
  enabledAt(at, step) { for (let i = at; i >= 0 && i < this.buttons.length; i += step) if (!this.buttons[i].disabled) return i; return -1; }
  nearestEnabled(at) { return this.buttons.map((button, index) => ({index, distance: button.disabled ? Infinity : Math.abs(index - at)})).sort((a, b) => a.distance - b.distance).find(item => item.distance < Infinity)?.index ?? -1; }
  choose(index, notify = true, focus = false) {
    if (this.buttons[index]?.disabled) return;
    this.set(index);
    if (notify) this.onChange(index);
    if (focus) this.buttons[index].focus({preventScroll: true});
  }
  set(index) { this.selected = index; if (index !== null) this.position = index; this.paint(); }
  paint(dragging = false) {
    this.spacing = this.root.clientWidth < 500 ? 112 : 150;
    const radius = Math.max(250, this.root.clientWidth * .7);
    const firstEnabled = this.buttons.findIndex(button => !button.disabled);
    this.buttons.forEach((button, index) => {
      const distance = index - this.position;
      const angle = Math.max(-1.4, Math.min(1.4, distance * this.spacing / radius));
      button.style.transform = `translate(calc(-50% + ${radius * Math.sin(angle)}px),${-radius * (1 - Math.cos(angle))}px) rotate(${-angle * 180 / Math.PI}deg)`;
      button.style.opacity = String(Math.max(0, 1 - Math.abs(distance) / (this.root.clientWidth < 500 ? 2 : 3.5)));
      const visible = Math.abs(distance) < (this.root.clientWidth < 500 ? 2 : 3.5);
      button.style.visibility = visible ? 'visible' : 'hidden';
      button.style.transitionDuration = dragging ? '0ms' : '';
      button.setAttribute('aria-checked', String(this.selected === index));
      button.tabIndex = index === (this.selected ?? firstEnabled) ? 0 : -1;
    });
  }
};
