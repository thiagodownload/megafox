(() => {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.main-nav');
  const toggle = document.querySelector('.nav-toggle');

  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));

  document.querySelectorAll('[data-delay]').forEach(el => {
    el.style.setProperty('--delay', `${el.dataset.delay}ms`);
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  document.getElementById('year').textContent = new Date().getFullYear();

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    status.className = 'form-status ok';
    status.textContent = 'Demonstração: formulário preservado visualmente. O envio real será conectado ao backend na publicação de produção.';
  });

  // Telemetria anônima da demonstração. Não envia IP, nome, e-mail ou localização.
  const trackAccess = async () => {
    try {
      const visitorKey = 'megafox_visitor_id';
      const sessionKey = 'megafox_session_id';
      let visitorId = localStorage.getItem(visitorKey);
      let sessionId = sessionStorage.getItem(sessionKey);

      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(visitorKey, visitorId);
      }
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem(sessionKey, sessionId);
      }

      await fetch('https://odthqhyzrmjwynwpsdoc.supabase.co/functions/v1/megafox-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          visitor_id: visitorId,
          session_id: sessionId,
          path: location.pathname,
          referrer: document.referrer || null
        })
      });
    } catch {
      // O rastreamento jamais deve interferir na experiência do protótipo.
    }
  };

  trackAccess();
})();
