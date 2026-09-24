// Progressive enhancement: HTML stays visible without JS or animation support.
// Native animations keep the static Astro pages free of a UI framework runtime.
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const active = new Set<Animation>();
let observer: IntersectionObserver | undefined;

function stopMotion() {
  observer?.disconnect();
  active.forEach(animation => animation.cancel());
  active.clear();
}

if (!preference.matches && 'IntersectionObserver' in window && 'animate' in Element.prototype) {
  observer = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;
      observer?.unobserve(entry.target);
      const animation = entry.target.animate(
        [{ transform: 'translateY(8px)' }, { transform: 'translateY(0)' }],
        { duration: 220, delay: Math.min(index, 3) * 35, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' },
      );
      active.add(animation);
      animation.onfinish = animation.oncancel = () => active.delete(animation);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach(element => observer?.observe(element));
}

// A keyboard focus must never wait for an entrance animation.
document.addEventListener('focusin', event => {
  const element = event.target instanceof Element ? event.target.closest('[data-reveal]') : null;
  if (element) {
    observer?.unobserve(element);
    element.getAnimations().forEach(animation => animation.cancel());
  }
});
preference.addEventListener('change', () => { if (preference.matches) stopMotion(); });
window.addEventListener('pagehide', stopMotion, { once: true });
