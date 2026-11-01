(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const seen = new WeakSet();
  let revealObserver;
  let fieldObserver;
  let initialized = false;

  document.querySelectorAll('.home-hero, .site-footer').forEach(section => {
    const field = document.createElement('div');
    field.className = 'ink-field';
    field.setAttribute('aria-hidden', 'true');
    section.prepend(field);
  });

  const syncMotion = () => {
    revealObserver?.disconnect();
    fieldObserver?.disconnect();
    root.classList.toggle('motion-ready', !motion.matches);
    document.querySelectorAll('.motion-enter, .intro-play, .ink-active').forEach(target => {
      target.classList.remove('motion-enter', 'intro-play', 'ink-active');
    });
    if (motion.matches || !('IntersectionObserver' in window)) return;

    // Returning to a reading position must not restart the page introduction.
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!initialized && !location.hash && window.scrollY < 24 && navigation?.type !== 'back_forward') {
      document.querySelector('.home-hero, .case-display')?.classList.add('intro-play');
    }
    initialized = true;

    revealObserver = new IntersectionObserver(entries => {
      if (motion.matches) return;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!seen.has(entry.target)) {
          entry.target.classList.add('motion-enter');
          seen.add(entry.target);
        }
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });
    document.querySelectorAll(
      '.home-intro .lead, .section-heading, .project-header, .project-card > .media-frame, ' +
      '.compact-card > .media-frame, .chapter .heading, .chapter > .container > .media-frame, ' +
      '.media-pair, .case-cover, .result-number, .next-project .heading'
    ).forEach(target => revealObserver.observe(target));

    fieldObserver = new IntersectionObserver(entries => {
      if (motion.matches) return;
      entries.forEach(entry => entry.target.classList.toggle('ink-active', entry.isIntersecting));
    });
    document.querySelectorAll('.ink-field').forEach(field => fieldObserver.observe(field));
  };

  document.addEventListener('animationend', event => {
    if (event.animationName.startsWith('portfolio-')) event.target.classList.remove('motion-enter');
    if (event.animationName === 'portfolio-portrait') event.target.closest('.intro-play')?.classList.remove('intro-play');
    if (event.target.matches('.case-display')) event.target.classList.remove('intro-play');
  });
  document.addEventListener('visibilitychange', () => root.classList.toggle('page-sleep', document.hidden));
  motion.addEventListener?.('change', syncMotion);
  syncMotion();
})();

(() => {
  const dialog = document.querySelector('#media-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('.dialog-image');
  const caption = dialog.querySelector('.dialog-caption');
  let trigger;
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-lightbox]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const thumbnail = link.querySelector('img');
    trigger = link;
    image.src = link.href;
    image.alt = thumbnail.alt;
    caption.textContent = thumbnail.alt;
    dialog.showModal();
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    trigger?.focus({ preventScroll: true });
  });
})();
