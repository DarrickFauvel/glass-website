// GLASS website — main.js

// ===== Theme Toggle =====
(function () {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    localStorage.setItem('glass-theme', theme);
  }

  // Sync button state on load
  applyTheme(document.documentElement.getAttribute('data-theme') || 'light');

  btn.addEventListener('click', () => {
    // Button pop animation
    btn.classList.remove('popping');
    void btn.offsetWidth;
    btn.classList.add('popping');
    btn.addEventListener('animationend', () => btn.classList.remove('popping'), { once: true });

    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.classList.add('theme-transitioning');
    applyTheme(next);
    setTimeout(() => html.classList.remove('theme-transitioning'), 500);
  });
})();

// ===== Mobile Nav Toggle =====
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const header = document.querySelector('header');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !header || !nav) return;

  function openMenu() {
    header.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }

  function closeMenu() {
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', () => {
    header.classList.contains('nav-open') ? closeMenu() : openMenu();
  });

  // Close when a nav link, the logo, or the theme toggle is clicked
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
  document.querySelector('.header-logo').addEventListener('click', closeMenu);
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', closeMenu);

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (header.classList.contains('nav-open') && !header.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) {
      closeMenu();
      toggle.focus();
    }
  });
}());

// ===== Scroll Reveal =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Show all elements immediately — no animation
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
}

// ===== Scrollspy =====
(function () {
  const navLinks = document.querySelectorAll('#primary-nav a[href*="#"]');
  const sectionIds = Array.from(navLinks).map((a) => a.getAttribute('href').split('#')[1]);
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  function setActive(id) {
    navLinks.forEach((a) => {
      a.classList.toggle('nav-active', a.getAttribute('href').split('#')[1] === id);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
}());

// ===== Contact Form =====
(function () {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const submit = form && form.querySelector('.form-submit');
  if (!form || !status || !submit) return;

  const rules = {
    name:    (v) => v.trim() ? '' : 'Please enter your name.',
    email:   (v) => !v.trim() ? 'Please enter your email address.'
                  : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Please enter a valid email address.'
                  : '',
    message: (v) => v.trim() ? '' : 'Please enter a message.',
  };

  function getError(field) {
    const group = field.closest('.form-group');
    return group ? group.querySelector('.field-error') : null;
  }

  function showError(field, msg) {
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const err = getError(field);
    if (!err) return;
    err.textContent = msg;
    err.hidden = !msg;
  }

  function validateField(field) {
    const rule = rules[field.name];
    const msg = rule ? rule(field.value) : '';
    showError(field, msg);
    return !msg;
  }

  // Validate on blur, but only if the field has been touched
  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('blur', () => {
      if (field.value !== '' || field.dataset.touched) {
        field.dataset.touched = '1';
        validateField(field);
      }
    });
    field.addEventListener('input', () => {
      if (field.dataset.touched) validateField(field);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Mark all fields as touched and validate
    let valid = true;
    form.querySelectorAll('input[name]:not([type="hidden"]), textarea[name]:not([name="h-captcha-response"])').forEach((field) => {
      field.dataset.touched = '1';
      if (!validateField(field)) valid = false;
    });

    if (!valid) {
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }

    submit.disabled = true;
    status.hidden = true;
    status.className = 'form-status';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json();
      if (data.success) {
        status.textContent = 'Message sent — thank you!';
        status.classList.add('form-status--success');
        form.reset();
        form.querySelectorAll('input, textarea').forEach((f) => {
          delete f.dataset.touched;
          f.removeAttribute('aria-invalid');
        });
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      status.textContent = err?.message || 'Something went wrong. Please try again.';
      status.classList.add('form-status--error');
      submit.disabled = false;
    }

    status.hidden = false;
  });
}());

// ===== Scroll Progress =====
(function () {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total) * 100 + '%' : '0%';
  }, { passive: true });
}());

// ===== Button Ripple =====
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.hero-btn, .form-submit').forEach((btn) => {
    btn.addEventListener('mouseenter', (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}());

// ===== QR Code Modal =====
(function () {
  const openBtn  = document.getElementById('qr-open');
  const modal    = document.getElementById('qr-modal');
  const closeBtn = document.getElementById('qr-close');
  const backdrop = document.getElementById('qr-backdrop');
  const canvas   = document.getElementById('qr-canvas');
  const urlEl    = document.getElementById('qr-url');
  if (!openBtn || !modal) return;

  let generated = false;

  function openModal() {
    modal.hidden = false;
    closeBtn.focus();

    if (!generated) {
      const url = window.location.origin;
      urlEl.textContent = url;
      /* global QRCode */
      new QRCode(canvas, {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#1c1410',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M,
      });
      generated = true;
    }
  }

  function closeModal() {
    modal.hidden = true;
    openBtn.focus();
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}());


// ===== Hero Lens Magnifier =====
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const eyepiece = hero.querySelector('.hero-eyepiece');

  const SCALE      = 1.55;
  const LENS_R     = 60;
  const ATTRACT_R  = 200;
  const TOUCH_LIFT = -48; // px upward offset when finger is on lens

  // Compute resting lens center before CSS hides the eyepiece
  const hr0 = hero.getBoundingClientRect();
  const er0 = eyepiece.getBoundingClientRect();
  const REST = {
    x: Math.min(er0.left - hr0.left + er0.width  / 2, hr0.width  - LENS_R - 8),
    y: er0.top  - hr0.top  + er0.height / 2,
  };

  // Scatter hidden secret texts across the hero
  const secrets = hero.querySelector('.hero-secrets');
  const clues = [
      {
        text: 'bigfoot?',
        topic: 'bigfoot', // matches content/topics.md and post frontmatter
        belief: 'Many believe Bigfoot is an undiscovered great ape roaming remote North American forests, supported by alleged footprints and blurry footage like the Patterson–Gimlin film.',
        question: 'If a large primate exists in North America, why has no confirmed physical evidence — bones, tissue, or definitive DNA — ever been recovered despite millions of acres under constant surveillance by hunters and cameras?',
      },
      {
        text: 'chemtrails?',
        topic: 'chemtrails', // matches content/topics.md and post frontmatter
        belief: 'Some believe the white trails left by aircraft are chemical or biological agents deliberately sprayed by governments for population control, weather manipulation, or mass sedation.',
        question: 'Contrails are well-understood water vapor condensation. How would a program requiring the silence of hundreds of thousands of pilots, engineers, and ground crews across competing nations remain secret?',
      },
      {
        text: 'GMOs?',
        topic: 'gmos', // matches content/topics.md and post frontmatter
        belief: 'Some believe genetically modified organisms pose unique dangers to human health, biodiversity, and ecosystems, and that safety data is suppressed by corporations.',
        question: 'Over 2,000 peer-reviewed studies and scientific consensus from WHO, NAS, and the EU find no evidence of GMO-specific health risks. What specific biological mechanism would make a gene-edited crop inherently harmful?',
      },
      {
        text: 'psychics?',
        topic: 'psychics', // matches content/topics.md and post frontmatter
        belief: 'Many believe certain individuals possess extrasensory abilities — reading minds, predicting futures, or communicating with the deceased — often demonstrated in readings.',
        question: 'The JREF offered $1 million for demonstrated psychic ability under controlled conditions for over a decade. No one claimed it. Why do psychic powers vanish when double-blind testing eliminates cold reading and confirmation bias?',
      },
      {
        text: 'ufo?',
        topic: 'ufos', // matches content/topics.md and post frontmatter
        belief: 'Many believe unidentified aerial phenomena are evidence of extraterrestrial spacecraft visiting Earth, sometimes citing government cover-ups of recovered craft and bodies.',
        question: '"We don\'t know what this is" is a legitimate scientific position — but what specific evidence distinguishes an unexplained atmospheric phenomenon from an alien spacecraft?',
      },
      {
        text: 'astrology?',
        topic: 'astrology', // matches content/topics.md and post frontmatter
        belief: 'Millions believe the positions of celestial bodies at birth shape personality, compatibility, and destiny through the twelve zodiac signs.',
        question: 'Controlled studies find no correlation between birth date and personality traits. If astrology is valid, why do identical twins — born minutes apart under the same sky — often lead strikingly different lives?',
      },
      {
        text: 'spirits?',
        topic: 'spirits', // matches content/topics.md and post frontmatter
        belief: 'Many cultures believe spirits of the deceased can interact with the living, haunt locations, or communicate through mediums and séances.',
        question: 'In controlled studies, mediums perform at chance level when verifiable specifics are required. What physical mechanism allows a non-corporeal entity to move objects, affect EMF readings, or produce sound?',
      },
      {
        text: 'aliens?',
        topic: 'aliens', // matches content/topics.md and post frontmatter
        belief: 'Some believe extraterrestrial beings have visited Earth, made contact with governments, and that evidence is actively suppressed at the highest levels.',
        question: 'The universe almost certainly harbors other life — but what testable, reproducible evidence supports the claim that intelligent aliens have specifically visited Earth rather than any of the billions of other planets?',
      },
      {
        text: 'ghosts?',
        topic: 'ghosts', // matches content/topics.md and post frontmatter
        belief: 'Many believe ghosts are spirits of the deceased that linger in the physical world, detectable by temperature drops, EVP recordings, or visual apparitions.',
        question: 'EMF detectors measure electromagnetic fields from electrical appliances — they were never designed for spirit detection. What peer-reviewed evidence links EMF fluctuations to anything other than wiring and electronics?',
      },
      {
        text: 'flat earth?',
        topic: 'flat-earth', // matches content/topics.md and post frontmatter
        belief: 'Some believe Earth is a flat disc enclosed by a dome, and that space agencies worldwide collaborate in an elaborate deception to hide its true shape.',
        question: 'GPS, satellite imagery, circumnavigation, eclipses, and the physics of gravity all depend on a spherical Earth and make accurate predictions. What model of a flat Earth makes equally precise, testable predictions?',
      },
  ];

  let lensLocked = false;
  let openSecretModal = () => {};

  if (secrets) {
    const heroW  = hero.offsetWidth;
    const heroH  = hero.offsetHeight;
    const placed = [];
    const MIN_DIST = 16; // % — minimum gap between secret centers

    // Shadow hint layer — sits below hero-content, shows faint blobs at each secret position
    const shadowLayer = document.createElement('div');
    shadowLayer.className = 'hero-secret-shadows';
    shadowLayer.setAttribute('aria-hidden', 'true');
    hero.insertBefore(shadowLayer, secrets);

    clues.forEach(({ text }, i) => {
      let x, y, tries = 0;

      if (i === 0) {
        // Tease: place first secret so it's partially revealed by the resting lens
        x = ((REST.x + LENS_R * 0.75) / heroW) * 100;
        y = ((REST.y - LENS_R * 0.35) / heroH) * 100;
      } else {
        do {
          x = 5 + Math.random() * 90;
          y = 5 + Math.random() * 90;
          tries++;
        } while (tries < 60 && placed.some(p => Math.hypot(x - p.x, y - p.y) < MIN_DIST));
      }

      placed.push({ x, y });

      const angle = (Math.random() * 8 - 4).toFixed(1) + 'deg';

      const el = document.createElement('span');
      el.className = 'hero-secret';
      el.textContent = text;
      el.style.left = x + '%';
      el.style.top  = y + '%';
      el.dataset.clue = text;
      el.style.setProperty('--tape-angle', angle);
      secrets.appendChild(el);

      // Matching faint shadow blob at the same position
      const shadow = document.createElement('span');
      shadow.className = 'hero-secret-shadow';
      shadow.textContent = text;
      shadow.style.left = x + '%';
      shadow.style.top  = y + '%';
      shadow.style.setProperty('--tape-angle', angle);
      shadowLayer.appendChild(shadow);

      // Crisp "?" marker centred on the shadow (separate from blur)
      const q = document.createElement('span');
      q.className = 'hero-secret-question';
      q.textContent = '?';
      q.style.left = x + '%';
      q.style.top  = y + '%';
      q.style.setProperty('--tape-angle', angle);
      shadowLayer.appendChild(q);
    });

    // Build secrets modal
    const sModal = document.createElement('div');
    sModal.className = 'secrets-modal';
    sModal.setAttribute('role', 'dialog');
    sModal.setAttribute('aria-modal', 'true');
    sModal.setAttribute('aria-labelledby', 'secrets-modal-title');
    sModal.hidden = true;
    sModal.innerHTML = `
      <div class="secrets-modal-backdrop"></div>
      <div class="secrets-modal-inner">
        <div class="secrets-modal-tape" aria-hidden="true"></div>
        <div class="secrets-modal-body">
          <button class="secrets-modal-close" aria-label="Close">&times;</button>
          <p class="secrets-modal-eyebrow">⚠ Case File</p>
          <h2 class="secrets-modal-title" id="secrets-modal-title"></h2>
          <div class="secrets-modal-section">
            <p class="secrets-modal-label">What some people believe</p>
            <p class="secrets-modal-text" id="secrets-belief"></p>
          </div>
          <div class="secrets-modal-section">
            <p class="secrets-modal-label">Scientific question</p>
            <p class="secrets-modal-text secrets-modal-text--question" id="secrets-question"></p>
          </div>
          <a class="secrets-modal-article" id="secrets-article" hidden></a>
        </div>
        <div class="secrets-modal-tape" aria-hidden="true"></div>
      </div>`;
    document.body.appendChild(sModal);

    const sClose    = sModal.querySelector('.secrets-modal-close');
    const sBackdrop = sModal.querySelector('.secrets-modal-backdrop');
    const sTitle    = sModal.querySelector('#secrets-modal-title');
    const sBelief   = sModal.querySelector('#secrets-belief');
    const sQuestion = sModal.querySelector('#secrets-question');
    const sArticle  = sModal.querySelector('#secrets-article');

    // Published blog posts by topic, rendered server-side into home.eta (only
    // posts already live). A clue links to its article once one exists.
    let clueArticles = {};
    try {
      const dataEl = document.getElementById('clue-articles');
      if (dataEl) clueArticles = JSON.parse(dataEl.textContent);
    } catch (e) { /* malformed data — just show no links */ }

    openSecretModal = function (clue) {
      sTitle.textContent    = clue.text;
      sBelief.textContent   = clue.belief;
      sQuestion.textContent = clue.question;
      const article = clueArticles[clue.topic];
      sArticle.hidden = !article;
      if (article) {
        sArticle.href = `/blog/${article.slug}`;
        sArticle.textContent = `Read: ${article.title} →`;
      }
      lensLocked = true;
      sModal.hidden = false;
      sClose.focus();
    }
    function closeSecretModal() {
      sModal.hidden = true;
      lensLocked = false;
      following  = false;
      attracting = false;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(restoreTick);
    }

    sClose.addEventListener('click', closeSecretModal);
    sBackdrop.addEventListener('click', closeSecretModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !sModal.hidden) closeSecretModal();
    });

    // Accessible keyboard hotspots — one visually-hidden button per secret.
    // Tab to focus → lens jumps to reveal it; activate → opens the modal.
    const accessLayer = document.createElement('div');
    accessLayer.className = 'hero-secret-access';
    accessLayer.setAttribute('aria-label', 'Hidden secrets');
    hero.appendChild(accessLayer);

    clues.forEach((clue, i) => {
      const pos = placed[i];
      const btn = document.createElement('button');
      btn.className = 'lens-secret-btn';
      btn.setAttribute('aria-label', 'Reveal hidden secret');
      btn.style.left = pos.x + '%';
      btn.style.top  = pos.y + '%';

      btn.addEventListener('focus', () => {
        const px = (pos.x / 100) * hero.offsetWidth;
        const py = (pos.y / 100) * hero.offsetHeight;
        stopIdleDrift();
        clearTimeout(idleTimer);
        following  = false;
        attracting = false;
        cancelAnimationFrame(rafId);
        lensX = px;
        lensY = py;
        if (mag.style.opacity !== '1') {
          mag.style.opacity     = '1';
          setLensOpacity('1');
        }
        applyLens(px, py);
      });

      btn.addEventListener('blur', () => {
        if (!lensLocked) resetIdleTimer();
      });

      btn.addEventListener('click', () => openSecretModal(clue));

      accessLayer.appendChild(btn);
    });
  }

  // Build magnifier layer from cloned hero content

  const mag = document.createElement('div');
  mag.className = 'hero-mag';
  mag.setAttribute('aria-hidden', 'true');
  ['hero-bg-grid', 'hero-tagline', 'hero-content', 'hero-secrets'].forEach(cls => {
    const el = hero.querySelector('.' + cls);
    if (!el) return;
    const clone = el.cloneNode(true);
    if (cls === 'hero-bg-grid') {
      // Remove the mask so the full grid is visible through the lens
      clone.style.maskImage = 'none';
      clone.style.webkitMaskImage = 'none';
    }
    // hero-content stays in flow: .hero-mag repeats the hero's own flex
    // centring and padding, so the copy lines up with the original even after
    // fonts load or the hero resizes.
    mag.appendChild(clone);
  });
  // Wire clicks on the cloned secrets in the mag layer
  mag.querySelectorAll('.hero-secret').forEach(clone => {
    const clue = clues.find(c => c.text === clone.dataset.clue);
    if (clue) clone.addEventListener('click', () => openSecretModal(clue));
  });
  hero.insertBefore(mag, eyepiece);

  // Lens glass-edge overlay
  const overlay = document.createElement('div');
  overlay.className = 'hero-lens-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  overlay.style.width  = LENS_R * 2 + 'px';
  overlay.style.height = LENS_R * 2 + 'px';
  overlay.style.left   = REST.x + 'px';
  overlay.style.top    = REST.y + 'px';
  // Glass layers inside the lens: a thick ground edge (whose bright inner rim
  // lags behind movement like a reflection) and a faint colour fringe.
  ['hero-lens-edge', 'hero-lens-rim', 'hero-lens-fringe'].forEach(cls => {
    const layer = document.createElement('span');
    layer.className = cls;
    overlay.appendChild(layer);
  });
  hero.insertBefore(overlay, eyepiece);

  // Shadow the lens casts on the page, with a bright spot of focused light.
  // Sits under the magnified layer, so only the part outside the glass shows.
  const caustic = document.createElement('div');
  caustic.className = 'hero-lens-caustic';
  caustic.setAttribute('aria-hidden', 'true');
  caustic.style.width  = LENS_R * 2.15 + 'px';
  caustic.style.height = LENS_R * 2.15 + 'px';
  hero.insertBefore(caustic, mag);

  // The lens body and its shadow always show and hide together.
  function setLensOpacity(value) {
    overlay.style.opacity = value;
    caustic.style.opacity = value;
  }

  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let prevX = null, prevY = null;


  let targetX = REST.x, targetY = REST.y;
  let lensX   = REST.x, lensY   = REST.y;
  let rafId = null, following = false, attracting = false;
  let touchStartClientX = 0, touchStartClientY = 0;
  let touchStartElement = null;
  let idleActive = false, idleVx = 0, idleVy = 0, idleTimer = null;
  let idleCurVx  = 0, idleCurVy = 0; // actual velocity, eases toward idleVx/Vy
  let motionPaused = false;

  // Flick physics
  const velHistory = [];
  let flickVx = 0, flickVy = 0;

  function trackVelocity(x, y) {
    const now = performance.now();
    velHistory.push({ x, y, t: now });
    if (velHistory.length > 12) velHistory.shift();
  }

  function getFlickVelocity() {
    const now = performance.now();
    const recent = velHistory.filter(p => now - p.t < 80);
    if (recent.length < 2) return { vx: 0, vy: 0 };
    const first = recent[0];
    const last  = recent[recent.length - 1];
    const dt = (last.t - first.t) / 16; // normalize to 60fps frames
    if (dt === 0) return { vx: 0, vy: 0 };
    const MAX = 22;
    return {
      vx: Math.max(-MAX, Math.min(MAX, (last.x - first.x) / dt)),
      vy: Math.max(-MAX, Math.min(MAX, (last.y - first.y) / dt)),
    };
  }

  function momentumTick() {
    const heroW  = hero.offsetWidth;
    const heroH  = hero.offsetHeight;
    const margin = LENS_R + 6;
    const FRICTION = 0.91;
    const BOUNCE   = 0.55;

    flickVx *= FRICTION;
    flickVy *= FRICTION;
    lensX   += flickVx;
    lensY   += flickVy;

    if (lensX < margin)        { lensX = margin;        flickVx =  Math.abs(flickVx) * BOUNCE; }
    else if (lensX > heroW - margin) { lensX = heroW - margin; flickVx = -Math.abs(flickVx) * BOUNCE; }
    if (lensY < margin)        { lensY = margin;        flickVy =  Math.abs(flickVy) * BOUNCE; }
    else if (lensY > heroH - margin) { lensY = heroH - margin; flickVy = -Math.abs(flickVy) * BOUNCE; }

    applyLens(lensX, lensY);

    if (Math.hypot(flickVx, flickVy) > 0.4) {
      rafId = requestAnimationFrame(momentumTick);
    } else {
      rafId = null;
      resetIdleTimer();
    }
  }

  // Hide lens and overlay until intro sweep fires
  mag.style.opacity        = '0';
  mag.style.transition     = 'opacity 0.6s';
  setLensOpacity('0');
  overlay.style.transition = 'opacity 0.6s';
  caustic.style.transition = 'opacity 0.6s';

  // Intro sweep: appear at lower-left, glide to resting position
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lensX = REST.x;
    lensY = REST.y;
    mag.style.opacity     = '1';
    setLensOpacity('1');
    applyLens(REST.x, REST.y);
    resetIdleTimer();
  } else {
    setTimeout(() => {
      if (following || attracting) return;
      lensX = hero.offsetWidth  * 0.12;
      lensY = hero.offsetHeight * 0.78;
      applyLens(lensX, lensY);
      mag.style.opacity     = '1';
      setLensOpacity('1');

      function introTick() {
        lensX = lerp(lensX, REST.x, 0.04);
        lensY = lerp(lensY, REST.y, 0.04);
        applyLens(lensX, lensY);
        if (Math.hypot(lensX - REST.x, lensY - REST.y) > 0.8) {
          rafId = requestAnimationFrame(introTick);
        } else {
          lensX = REST.x;
          lensY = REST.y;
          applyLens(REST.x, REST.y);
          resetIdleTimer();
        }
      }
      rafId = requestAnimationFrame(introTick);
    }, 1600);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function applyLens(x, y) {
    mag.style.clipPath        = `circle(${(LENS_R / SCALE).toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
    mag.style.transformOrigin = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    mag.style.transform       = `scale(${SCALE})`;
    overlay.style.left = x + 'px';
    overlay.style.top  = y + 'px';
    caustic.style.left = (x + LENS_R * 0.32) + 'px';
    caustic.style.top  = (y + LENS_R * 0.42) + 'px';
    // The rim's reflection lags a few pixels behind the lens's movement.
    if (motionOK && prevX !== null) {
      const lagX = Math.max(-4, Math.min(4, -(x - prevX) * 0.5));
      const lagY = Math.max(-4, Math.min(4, -(y - prevY) * 0.5));
      overlay.style.setProperty('--lens-lag-x', lagX.toFixed(2) + 'px');
      overlay.style.setProperty('--lens-lag-y', lagY.toFixed(2) + 'px');
    }
    prevX = x;
    prevY = y;
  }

  function followTick() {
    lensX = lerp(lensX, targetX, 0.1);
    lensY = lerp(lensY, targetY, 0.1);
    applyLens(lensX, lensY);
    rafId = requestAnimationFrame(followTick);
  }

  // Touch follow — faster lerp so lift and drag feel responsive
  function touchFollowTick() {
    lensX = lerp(lensX, targetX, 0.25);
    lensY = lerp(lensY, targetY, 0.25);
    applyLens(lensX, lensY);
    rafId = requestAnimationFrame(touchFollowTick);
  }

  // Slowly drift toward cursor when nearby but not grabbed
  function attractTick() {
    lensX = lerp(lensX, targetX, 0.03);
    lensY = lerp(lensY, targetY, 0.03);
    applyLens(lensX, lensY);
    rafId = requestAnimationFrame(attractTick);
  }

  // Glide back to REST after attraction ends (mag stays visible)
  function restoreTick() {
    lensX = lerp(lensX, REST.x, 0.06);
    lensY = lerp(lensY, REST.y, 0.06);
    applyLens(lensX, lensY);
    if (Math.hypot(lensX - REST.x, lensY - REST.y) > 0.8) {
      rafId = requestAnimationFrame(restoreTick);
    } else {
      lensX = REST.x;
      lensY = REST.y;
      applyLens(REST.x, REST.y);
      rafId = null;
      resetIdleTimer();
    }
  }

  // ===== Idle drift =====
  const IDLE_SPEED   = 0.65;
  const IDLE_TIMEOUT = 3000;

  function idleTick() {
    if (!idleActive) return;
    const heroW  = hero.offsetWidth;
    const heroH  = hero.offsetHeight;
    const margin = LENS_R + 6;

    // Ease actual velocity toward target (smooth general movement + eased start)
    idleCurVx = lerp(idleCurVx, idleVx, 0.07);
    idleCurVy = lerp(idleCurVy, idleVy, 0.07);

    lensX += idleCurVx;
    lensY += idleCurVy;

    // On border contact: snap the perpendicular velocity component for an immediate
    // physical bounce, apply slight damping, then set a new reflected target angle
    // with variation so paths never repeat.
    let a;
    if (lensX < margin) {
      lensX     = margin;
      idleCurVx = Math.abs(idleCurVx) * 0.82;          // snap + dampen
      a = Math.atan2(idleVy, Math.abs(idleVx)) + (Math.random() - 0.5) * 0.5;
      idleVx = Math.cos(a) * IDLE_SPEED;
      idleVy = Math.sin(a) * IDLE_SPEED;
    } else if (lensX > heroW - margin) {
      lensX     = heroW - margin;
      idleCurVx = -Math.abs(idleCurVx) * 0.82;
      a = Math.atan2(idleVy, -Math.abs(idleVx)) + (Math.random() - 0.5) * 0.5;
      idleVx = Math.cos(a) * IDLE_SPEED;
      idleVy = Math.sin(a) * IDLE_SPEED;
    }
    if (lensY < margin) {
      lensY     = margin;
      idleCurVy = Math.abs(idleCurVy) * 0.82;
      a = Math.atan2(Math.abs(idleVy), idleVx) + (Math.random() - 0.5) * 0.5;
      idleVx = Math.cos(a) * IDLE_SPEED;
      idleVy = Math.sin(a) * IDLE_SPEED;
    } else if (lensY > heroH - margin) {
      lensY     = heroH - margin;
      idleCurVy = -Math.abs(idleCurVy) * 0.82;
      a = Math.atan2(-Math.abs(idleVy), idleVx) + (Math.random() - 0.5) * 0.5;
      idleVx = Math.cos(a) * IDLE_SPEED;
      idleVy = Math.sin(a) * IDLE_SPEED;
    }

    applyLens(lensX, lensY);
    rafId = requestAnimationFrame(idleTick);
  }

  function startIdleDrift() {
    if (following || attracting || mag.style.opacity !== '1') return;
    idleActive  = true;
    idleCurVx   = 0;
    idleCurVy   = 0;
    const angle = Math.random() * Math.PI * 2;
    idleVx = Math.cos(angle) * IDLE_SPEED;
    idleVy = Math.sin(angle) * IDLE_SPEED;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(idleTick);
  }

  function stopIdleDrift() {
    if (!idleActive) return;
    idleActive = false;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  function resetIdleTimer() {
    stopIdleDrift();
    clearTimeout(idleTimer);
    if (!prefersReducedMotion && !motionPaused) {
      idleTimer = setTimeout(startIdleDrift, IDLE_TIMEOUT);
    }
  }

  hero.addEventListener('mousemove', (e) => {
    if (idleActive) stopIdleDrift();
    const hr   = hero.getBoundingClientRect();
    const mx   = e.clientX - hr.left;
    const my   = e.clientY - hr.top;
    const dist = Math.hypot(mx - lensX, my - lensY);

    if (following) {
      targetX = mx;
      targetY = my;
      trackVelocity(mx, my);
      return;
    }

    if (dist <= LENS_R) {
      // Grab the lens — switch to full follow
      attracting = false;
      following  = true;
      cancelAnimationFrame(rafId);
      targetX = lensX = mx;
      targetY = lensY = my;
      rafId = requestAnimationFrame(followTick);
      return;
    }

    // Always attract toward cursor anywhere in the hero
    targetX = mx;
    targetY = my;
    if (!attracting) {
      attracting = true;
      cancelAnimationFrame(rafId);
      if (mag.style.opacity !== '1') {
        mag.style.opacity     = '1';
        setLensOpacity('1');
        applyLens(lensX, lensY);
      }
      rafId = requestAnimationFrame(attractTick);
    }
  });

  hero.addEventListener('mouseenter', (e) => {
    if (lensLocked || following) return;
    const hr = hero.getBoundingClientRect();
    targetX = e.clientX - hr.left;
    targetY = e.clientY - hr.top;
    stopIdleDrift();
    if (!attracting) {
      attracting = true;
      cancelAnimationFrame(rafId);
      if (mag.style.opacity !== '1') {
        mag.style.opacity     = '1';
        setLensOpacity('1');
        applyLens(lensX, lensY);
      }
      rafId = requestAnimationFrame(attractTick);
    }
  });

  hero.addEventListener('mouseleave', () => {
    if (lensLocked) return;
    stopIdleDrift();
    attracting = false;
    if (following) {
      following = false;
      const { vx, vy } = getFlickVelocity();
      velHistory.length = 0;
      cancelAnimationFrame(rafId);
      if (Math.hypot(vx, vy) > 1.5) {
        flickVx = vx;
        flickVy = vy;
        rafId = requestAnimationFrame(momentumTick);
        return;
      }
    }
    following = false;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(restoreTick);
  });

  // ===== Touch support =====
  hero.addEventListener('touchstart', (e) => {
    const hr    = hero.getBoundingClientRect();
    const touch = e.touches[0];
    const tx    = touch.clientX - hr.left;
    const ty    = touch.clientY - hr.top;

    // Generous grab radius for finger imprecision
    if (Math.hypot(tx - lensX, ty - lensY) > LENS_R * 1.8) return;

    e.preventDefault();
    stopIdleDrift();
    touchStartClientX = touch.clientX;
    touchStartClientY = touch.clientY;
    // Capture hit element now, before the lift animation moves the lens
    touchStartElement = document.elementFromPoint(touch.clientX, touch.clientY);
    attracting = false;
    following  = true;
    cancelAnimationFrame(rafId);

    // Ensure lens is visible if intro hasn't fired yet
    if (mag.style.opacity !== '1') {
      mag.style.opacity     = '1';
      setLensOpacity('1');
    }
    // Target is finger position offset upward — lerp smoothly rises to it
    targetX = tx;
    targetY = ty + TOUCH_LIFT;
    rafId = requestAnimationFrame(touchFollowTick);
  }, { passive: false });

  hero.addEventListener('touchmove', (e) => {
    if (!following) return;
    e.preventDefault();
    const hr    = hero.getBoundingClientRect();
    const touch = e.touches[0];
    targetX = touch.clientX - hr.left;
    targetY = touch.clientY - hr.top + TOUCH_LIFT;
    trackVelocity(targetX, targetY);
  }, { passive: false });

  function onTouchEnd(e) {
    if (!following || lensLocked) return;
    following = false;
    cancelAnimationFrame(rafId);
    rafId = null;

    // Detect tap (minimal movement) and fire secret modal if one was hit
    const t = e.changedTouches[0];
    const isTap = Math.hypot(t.clientX - touchStartClientX, t.clientY - touchStartClientY) < 10;
    if (isTap) {
      const el = touchStartElement;
      if (el && el.classList.contains('hero-secret') && el.dataset.clue) {
        const clue = clues.find(c => c.text === el.dataset.clue);
        if (clue) openSecretModal(clue);
      }
      velHistory.length = 0;
      resetIdleTimer();
    } else {
      const { vx, vy } = getFlickVelocity();
      velHistory.length = 0;
      if (Math.hypot(vx, vy) > 1.5) {
        flickVx = vx;
        flickVy = vy;
        rafId = requestAnimationFrame(momentumTick);
      } else {
        resetIdleTimer();
      }
    }
  }
  hero.addEventListener('touchend',    onTouchEnd);
  hero.addEventListener('touchcancel', onTouchEnd);

  window.addEventListener('resize', () => { orig = getOrigCenter(); }, { passive: true });

  // Pause/resume button for lens idle motion (hidden when OS reduced-motion is on)
  if (!prefersReducedMotion) {
    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'lens-pause-btn';
    pauseBtn.setAttribute('aria-pressed', 'false');
    pauseBtn.textContent = 'Pause lens';
    hero.appendChild(pauseBtn);

    pauseBtn.addEventListener('click', () => {
      motionPaused = !motionPaused;
      pauseBtn.setAttribute('aria-pressed', String(motionPaused));
      pauseBtn.textContent = motionPaused ? 'Resume lens' : 'Pause lens';
      if (motionPaused) {
        stopIdleDrift();
        clearTimeout(idleTimer);
      } else {
        resetIdleTimer();
      }
    });
  }
}());

// ===== Eyepiece Pulse Rings =====
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const eyepiece = document.querySelector('.hero-eyepiece');
  if (!eyepiece) return;

  function scheduleRing(ring) {
    const delay = 800 + Math.random() * 5000;
    setTimeout(() => {
      ring.classList.add('hero-ring--pulse');
      ring.addEventListener('animationend', function onEnd() {
        ring.removeEventListener('animationend', onEnd);
        ring.classList.remove('hero-ring--pulse');
        scheduleRing(ring);
      }, { once: true });
    }, delay);
  }

  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div');
    ring.className = 'hero-ring';
    eyepiece.appendChild(ring);
    scheduleRing(ring);
  }
}());

// ===== Animated attendee list expand/collapse =====
// Delegated (not bound per-element) because the RSVP attendee <details> is
// re-rendered wholesale by a Datastar SSE patch after every RSVP change.
(function () {
  const DURATION_MS = 240;

  function animate(details, opening) {
    const summary = details.querySelector(':scope > summary');
    const body = details.querySelector(':scope > .rsvp-attendees-body');
    if (!summary || !body) return;

    if (details._rsvpAnim) details._rsvpAnim.cancel();

    const startHeight = details.offsetHeight;
    details.style.overflow = 'hidden';
    if (opening) details.open = true;
    const endHeight = opening ? summary.offsetHeight + body.offsetHeight : summary.offsetHeight;

    details._rsvpAnim = details.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      { duration: DURATION_MS, easing: 'ease-out' }
    );
    details._rsvpAnim.onfinish = () => {
      if (!opening) details.open = false;
      details.style.overflow = '';
      details._rsvpAnim = null;
    };
    details._rsvpAnim.oncancel = () => {
      details.style.overflow = '';
    };
  }

  document.addEventListener('click', (e) => {
    const summary = e.target.closest('.rsvp-attendees > summary');
    if (!summary) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    e.preventDefault();
    animate(summary.parentElement, !summary.parentElement.open);
  });
})();

// ===== RSVP avatar stack tooltip =====
// Delegated for the same reason as the accordion above: the stack is
// re-rendered by a Datastar SSE patch after every RSVP change.
(function () {
  function showTooltip(el) {
    const stack = el.closest('.rsvp-avatar-stack');
    const tooltip = stack?.querySelector('.rsvp-stack-tooltip');
    if (!stack || !tooltip) return;

    const rect = stack.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + 10}px`;

    tooltip.replaceChildren();
    const name = document.createElement('span');
    name.className = 'rsvp-stack-tooltip-name';
    name.textContent = el.dataset.name || '';
    tooltip.appendChild(name);

    if (el.dataset.comment) {
      const comment = document.createElement('span');
      comment.className = 'rsvp-stack-tooltip-comment';
      comment.textContent = `“${el.dataset.comment}”`;
      tooltip.appendChild(comment);
    }
    if (!tooltip.matches(':popover-open')) tooltip.showPopover();
  }

  function hideTooltip(el) {
    const tooltip = el.closest('.rsvp-avatar-stack')?.querySelector('.rsvp-stack-tooltip');
    if (tooltip && tooltip.matches(':popover-open')) tooltip.hidePopover();
  }

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('.rsvp-stack-avatar');
    if (!el || el.contains(e.relatedTarget)) return;
    showTooltip(el);
  });
  document.addEventListener('mouseout', (e) => {
    const el = e.target.closest('.rsvp-stack-avatar');
    if (!el || el.contains(e.relatedTarget)) return;
    hideTooltip(el);
  });
})();

// ===== Blog article read-aloud =====
// Uses the browser's built-in speech synthesis, so there are no audio files or
// API keys — the bar stays hidden where speechSynthesis isn't supported. Text
// is spoken one block (paragraph/heading/list item) at a time: long single
// utterances get cut off in Chrome, and per-block chunks let us highlight the
// block being read and resume from it. Footnote markers and the References
// list are skipped.
(function () {
  const bar = document.getElementById('listen-bar');
  const prose = document.querySelector('.article-prose');
  if (!bar || !prose || !('speechSynthesis' in window)) return;

  const synth = window.speechSynthesis;
  const toggle = document.getElementById('listen-toggle');
  const stopBtn = document.getElementById('listen-stop');
  const rateSelect = document.getElementById('listen-rate');
  const status = document.getElementById('listen-status');
  const label = toggle.querySelector('.listen-label');
  const prevBtn = document.getElementById('listen-prev');
  const nextBtn = document.getElementById('listen-next');
  const article = bar.closest('article');

  const header = document.querySelector('.article-header');
  const blocks = [
    ...header.querySelectorAll('h1, .auth-subtitle'),
    ...Array.from(prose.querySelectorAll('h2, p, li')).filter(
      (el) => !el.closest('.footnotes') && !(el.tagName === 'P' && el.closest('li'))
    ),
  ];
  // Builds the spoken text for a block (footnote <sup>s and link hints dropped, whitespace
  // collapsed) alongside a map from each spoken character back to its DOM text
  // node + offset, so word-boundary events can be turned into a highlight Range.
  function readableText(el) {
    let text = '';
    const positions = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      // Skip footnote markers and the new-tab hint on external links.
      acceptNode: (node) => (node.parentElement.closest('sup, .external-link-icon, .visually-hidden')
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT),
    });
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (let offset = 0; offset < node.data.length; offset++) {
        const ch = node.data[offset];
        if (/\s/.test(ch)) {
          if (!text || text.endsWith(' ')) continue;
          text += ' ';
        } else {
          text += ch;
        }
        positions.push({ node, offset });
      }
    }
    if (text.endsWith(' ')) {
      text = text.slice(0, -1);
      positions.pop();
    }
    return { text, positions };
  }

  const chunks = blocks
    .map((el) => ({ el, ...readableText(el) }))
    .filter((chunk) => chunk.text);
  const chunkIndex = new Map(chunks.map((chunk, i) => [chunk.el, i]));
  chunks.forEach((chunk) => chunk.el.classList.add('listen-chunk'));

  let index = 0;
  let playing = false;
  // True from the first Listen until Stop/the end — paused still counts.
  let sessionActive = false;
  // Bumped on every cancel so the onend of a cancelled utterance can't advance playback.
  let generation = 0;
  let voice = null;
  let voices = [];

  // Offers the device's English voices, higher-quality US ones first. The
  // reader's pick is remembered per browser (by voiceURI); otherwise we default
  // to the best-sounding US voice available. Voices load asynchronously in
  // some browsers, hence re-running this on `voiceschanged`.
  const voiceSelect = document.getElementById('listen-voice');
  const VOICE_KEY = 'glass-listen-voice';
  const PREFERRED_VOICE = /natural|neural|google|samantha|premium|enhanced/i;

  // macOS ships joke/effect voices ("Bubbles", "Zarvox", …) that read an
  // article badly — leave them out of the picker entirely.
  const NOVELTY_VOICES = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|fred|kathy|princess)\b/i;

  const ACCENTS = {
    US: 'American', GB: 'British', UK: 'British', AU: 'Australian', CA: 'Canadian',
    IE: 'Irish', IN: 'Indian', NZ: 'New Zealand', ZA: 'South African', SG: 'Singaporean',
    PH: 'Filipino', NG: 'Nigerian', KE: 'Kenyan', HK: 'Hong Kong', SC: 'Scottish',
  };

  // eSpeak (Chrome/Firefox on Linux) names voices after the language, e.g.
  // "English (Scotland)" or "English (America)+Annie" — the accent lives in the
  // parentheses and the voice's identity in the "+variant" suffix.
  const ESPEAK_ACCENTS = {
    'america': 'American', 'united states': 'American', 'great britain': 'British',
    'united kingdom': 'British', 'received pronunciation': 'British RP', 'scotland': 'Scottish',
    'caribbean': 'Caribbean', 'lancaster': 'Lancashire', 'west midlands': 'West Midlands',
  };
  const ESPEAK_NOVELTY_VARIANTS = /^(whisper|whisperf|croak|klatt\d*|robot|universalrobot|mr ?serious)$/i;

  function espeakVariantName(variant) {
    const code = variant.match(/^([fm])(\d+)$/i);
    if (code) return `${code[1].toLowerCase() === 'f' ? 'Female' : 'Male'} ${code[2]}`;
    return variant
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')   // "AnxiousAndy" → "Anxious Andy"
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Turns engine names like "Microsoft Aria Online (Natural) - English (United States)",
  // "Google UK English Female" or "English (America)+Annie" into
  // "Aria (American, natural)", "Google female (British)" and "Annie (American)".
  function friendlyVoiceName(v) {
    const region = (v.lang.split(/[-_]/)[1] || '').toUpperCase();
    let accent = ACCENTS[region] || 'English';
    const [base, variant] = v.name.split('+');
    const quality = (base.match(/\b(natural|neural|enhanced|premium)\b/i) || [])[1];
    const gender = (base.match(/\b(female|male)\b/i) || [])[1];

    const espeakAccent = (base.match(/^english\s*\(([^)]+)\)/i) || [])[1];
    if (espeakAccent && ESPEAK_ACCENTS[espeakAccent.toLowerCase()]) {
      accent = ESPEAK_ACCENTS[espeakAccent.toLowerCase()];
    }

    let name = base
      .replace(/\s+-\s+English.*$/i, '')            // " - English (United States)"
      .replace(/\((natural|neural|enhanced|premium)\)/gi, '')
      .replace(/\b(online|desktop|multilingual|compact)\b/gi, '')
      .replace(/^(microsoft|apple|com\.apple\S*)\s+/i, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // ChromeOS names its voices "Chrome OS US English 1", "Chrome OS UK English 2", …
    // and Android-backed ones "Android Speech Recognition and Synthesis from Google
    // en-us-x-tpf-local" — neither carries a person's name, so number them instead.
    const chromeOS = base.match(/^chrome ?os\b.*?english\s*(\d+)?\s*$/i);
    const android = /^android speech/i.test(base);

    if (variant) {
      name = espeakVariantName(variant.trim());
    } else if (chromeOS) {
      name = chromeOS[1] ? `Voice ${chromeOS[1]}` : 'Voice';
    } else if (android) {
      // Distinct from ChromeOS's own numbered voices so the two can't collide.
      name = 'Android voice';
    } else if (/^google\b/i.test(name)) {
      name = gender ? `Google ${gender.toLowerCase()}` : 'Google';
    } else if (!name || /english|^en[-_]|^default$/i.test(name)) {
      name = 'Voice';
    }

    const details = [accent, quality && quality.toLowerCase()].filter(Boolean).join(', ');
    return `${name} (${details})`;
  }

  function isNoveltyVoice(v) {
    const variant = v.name.split('+')[1];
    return NOVELTY_VOICES.test(v.name) || Boolean(variant && ESPEAK_NOVELTY_VARIANTS.test(variant.trim()));
  }

  function voiceRank(v) {
    const us = /^en[-_]US/i.test(v.lang);
    const preferred = PREFERRED_VOICE.test(v.name);
    return (us && preferred ? 0 : us ? 1 : preferred ? 2 : 3);
  }

  function loadVoices() {
    voices = synth
      .getVoices()
      .filter((v) => /^en[-_]/i.test(v.lang) && !isNoveltyVoice(v))
      .sort((a, b) => voiceRank(a) - voiceRank(b) || a.name.localeCompare(b.name));

    let savedURI = null;
    try { savedURI = localStorage.getItem(VOICE_KEY); } catch (e) { /* storage unavailable */ }
    voice = voices.find((v) => v.voiceURI === (voice ? voice.voiceURI : savedURI)) || voices[0] || null;

    // Unnamed voices tidy down to the same label (e.g. several "Voice (American)"),
    // so number every member of a repeated label: Voice 1, Voice 2, …
    const labels = voices.map(friendlyVoiceName);
    const totals = new Map();
    labels.forEach((text) => totals.set(text, (totals.get(text) || 0) + 1));
    const seen = new Map();
    voiceSelect.replaceChildren(
      ...voices.map((v, i) => {
        const option = document.createElement('option');
        option.value = v.voiceURI;
        let text = labels[i];
        if (totals.get(text) > 1) {
          const n = (seen.get(text) || 0) + 1;
          seen.set(text, n);
          text = text.replace(/ \(/, ` ${n} (`);
        }
        option.textContent = text;
        option.title = v.name;
        option.selected = v === voice;
        return option;
      })
    );
    // With zero or one voice there's nothing to choose between.
    voiceSelect.hidden = voices.length < 2;
  }
  loadVoices();
  synth.addEventListener('voiceschanged', loadVoices);

  voiceSelect.addEventListener('change', () => {
    voice = voices.find((v) => v.voiceURI === voiceSelect.value) || voice;
    try { localStorage.setItem(VOICE_KEY, voice.voiceURI); } catch (e) { /* storage unavailable */ }
    if (playing) speakFrom(index);
  });

  // Follow along by scrolling the block being read to mid-screen, but back off
  // for a few seconds whenever the reader scrolls on their own.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const USER_SCROLL_GRACE_MS = 4000;
  let userScrolledAt = 0;
  ['wheel', 'touchmove'].forEach((type) =>
    window.addEventListener(type, () => { userScrolledAt = Date.now(); }, { passive: true })
  );
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
      userScrolledAt = Date.now();
    }
  });

  // Keep the bar pinned directly under the sticky site header, whose height
  // varies with viewport width.
  const siteHeader = document.querySelector('header');
  function pinBelowHeader() {
    bar.style.top = (siteHeader ? siteHeader.offsetHeight : 0) + 'px';
    updateStuck();
  }
  function updateStuck() {
    const pinnedTop = parseFloat(bar.style.top) || 0;
    bar.classList.toggle('is-stuck', bar.getBoundingClientRect().top <= pinnedTop + 1);
  }
  window.addEventListener('resize', pinBelowHeader);
  window.addEventListener('scroll', updateStuck, { passive: true });

  // Auto-scroll is on by default; the reader's choice is remembered per browser.
  const followToggle = document.getElementById('listen-follow');
  const FOLLOW_KEY = 'glass-listen-autoscroll';
  try {
    if (localStorage.getItem(FOLLOW_KEY) === 'off') followToggle.checked = false;
  } catch (e) { /* storage unavailable — keep the default */ }
  followToggle.addEventListener('change', () => {
    try {
      localStorage.setItem(FOLLOW_KEY, followToggle.checked ? 'on' : 'off');
    } catch (e) { /* storage unavailable — choice lasts for this page only */ }
    if (followToggle.checked && playing && chunks[index]) {
      userScrolledAt = 0;
      followAlong(chunks[index].el);
    }
  });

  function followAlong(el) {
    if (!followToggle.checked) return;
    if (Date.now() - userScrolledAt < USER_SCROLL_GRACE_MS) return;
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    // The header and pinned bar cover the top of the screen. Measure from where
    // the bar's bottom edge will be once it's pinned (it may not be yet), so the
    // block never lands underneath it.
    const coveredTop = (parseFloat(bar.style.top) || 0) + bar.offsetHeight;
    const available = viewH - coveredTop;
    const GAP = 16;
    // Leave it alone while its top is clear of the bar and it's reasonably in view.
    const topClear = rect.top >= coveredTop + GAP;
    if (topClear && (rect.bottom <= viewH - GAP || rect.top <= coveredTop + available * 0.35)) return;
    // Short blocks sit centred in the space below the bar; tall ones align their
    // top just under it, so the start of the paragraph is always visible.
    const targetTop = rect.height <= available - GAP * 2
      ? coveredTop + (available - rect.height) / 2
      : coveredTop + GAP;
    window.scrollTo({
      top: window.scrollY + rect.top - targetTop,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  // A muted underline under the word being spoken. It's a
  // single absolutely-positioned element placed from the word's Range rects, so
  // the article's HTML is never touched. Needs a voice that fires word-boundary
  // events — network voices such as Chrome's "Google" ones don't, in which case
  // only the paragraph highlight shows.
  const underline = document.createElement('span');
  underline.className = 'reading-underline';
  underline.setAttribute('aria-hidden', 'true');
  article.appendChild(underline);
  let currentWordRange = null;

  function wordRange(chunk, charIndex, charLength) {
    const { text, positions } = chunk;
    let end = charLength ? charIndex + charLength : charIndex;
    if (!charLength) while (end < text.length && !/\s/.test(text[end])) end++;
    // Don't underline trailing punctuation or spaces.
    while (end > charIndex && /[\s.,;:!?"'”’)\]]/.test(text[end - 1])) end--;
    const start = positions[charIndex];
    const last = positions[end - 1];
    if (!start || !last) return null;
    const range = new Range();
    range.setStart(start.node, start.offset);
    range.setEnd(last.node, last.offset + 1);
    return range;
  }

  function placeUnderline(range) {
    const rect = range.getClientRects()[0];
    if (!rect) return false;
    const base = article.getBoundingClientRect();
    underline.style.left = `${rect.left - base.left}px`;
    underline.style.top = `${rect.bottom - base.top}px`;
    underline.style.width = `${rect.width}px`;
    return true;
  }

  function underlineWord(chunk, charIndex, charLength) {
    const range = wordRange(chunk, charIndex, charLength);
    if (!range) return;
    currentWordRange = range;
    underline.classList.toggle('is-visible', placeUnderline(range));
  }

  function clearWord() {
    currentWordRange = null;
    underline.classList.remove('is-visible');
  }

  // Text reflows on resize, so move the underline with its word.
  window.addEventListener('resize', () => {
    if (currentWordRange) placeUnderline(currentWordRange);
  });

  function setHighlight(i) {
    clearWord();
    chunks.forEach((chunk, j) => chunk.el.classList.toggle('is-reading', j === i));
    if (i >= 0 && playing) followAlong(chunks[i].el);
  }

  // Listening-time estimate: total, and what's left from the current position.
  // Starts from a typical speech-synthesis pace and then calibrates to the
  // actual voice by timing each block that's read to the end. Progress within
  // a block comes from word-boundary events when the voice sends them,
  // otherwise from elapsed time.
  const timeEl = document.getElementById('listen-time');
  const wordCount = (text) => text.split(' ').length;
  chunks.forEach((chunk) => { chunk.words = wordCount(chunk.text); });
  const totalWords = chunks.reduce((sum, chunk) => sum + chunk.words, 0);
  let baseWpm = 170; // words per minute at 1×
  let chunkStartedAt = 0;
  let spokenInChunk = 0;
  let boundaryWords = false;
  let timeTimer = null;

  const wordsPerSecond = () => (baseWpm * Number(rateSelect.value)) / 60;

  function formatClock(seconds) {
    const s = Math.max(0, Math.round(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function formatMinutes(seconds) {
    return `${Math.max(1, Math.round(seconds / 60))} min`;
  }

  function updateTime() {
    const totalSeconds = totalWords / wordsPerSecond();
    if (!sessionActive) {
      timeEl.textContent = `${formatMinutes(totalSeconds)} listen`;
      return;
    }
    let doneInChunk = 0;
    if (playing) {
      doneInChunk = boundaryWords
        ? spokenInChunk
        : ((performance.now() - chunkStartedAt) / 1000) * wordsPerSecond();
    }
    const current = chunks[index];
    const wordsBefore = chunks.slice(0, index).reduce((sum, chunk) => sum + chunk.words, 0);
    const remainingWords = totalWords - wordsBefore - Math.min(doneInChunk, current ? current.words : 0);
    timeEl.textContent = `${formatClock(remainingWords / wordsPerSecond())} left of ${formatMinutes(totalSeconds)}`;
  }

  function startTimeTicker() {
    if (!timeTimer) timeTimer = setInterval(updateTime, 1000);
  }

  function stopTimeTicker() {
    clearInterval(timeTimer);
    timeTimer = null;
  }

  // Blend each fully-read block's measured pace into the estimate; tiny blocks
  // (headings, one-liners) are too noisy to learn from.
  function calibrate(chunk) {
    const seconds = (performance.now() - chunkStartedAt) / 1000;
    if (chunk.words < 8 || seconds < 1) return;
    const measured = (chunk.words / (seconds / 60)) / Number(rateSelect.value);
    if (measured > 60 && measured < 400) baseWpm = baseWpm * 0.6 + measured * 0.4;
  }

  function render() {
    updateTime();
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.classList.toggle('is-playing', playing);
    label.textContent = playing ? 'Pause' : sessionActive ? 'Resume' : 'Listen';
    stopBtn.hidden = !sessionActive;
    prevBtn.hidden = !sessionActive;
    nextBtn.hidden = !sessionActive;
    prevBtn.disabled = index <= 0;
    article.classList.toggle('listen-session', sessionActive);
  }

  function speakFrom(i) {
    synth.cancel();
    const myGeneration = ++generation;
    if (i >= chunks.length) {
      finish();
      return;
    }
    index = i;
    setHighlight(i);
    chunkStartedAt = performance.now();
    spokenInChunk = 0;
    boundaryWords = false;
    updateTime();
    const utterance = new SpeechSynthesisUtterance(chunks[i].text);
    utterance.rate = Number(rateSelect.value);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.onboundary = (e) => {
      if (myGeneration !== generation || e.name !== 'word') return;
      underlineWord(chunks[i], e.charIndex, e.charLength);
      boundaryWords = true;
      spokenInChunk = e.charIndex ? wordCount(chunks[i].text.slice(0, e.charIndex).trim()) : 0;
    };
    utterance.onend = () => {
      if (myGeneration !== generation || !playing) return;
      calibrate(chunks[i]);
      speakFrom(i + 1);
    };
    utterance.onerror = (e) => {
      if (myGeneration !== generation || e.error === 'interrupted' || e.error === 'canceled') return;
      playing = false;
      status.textContent = 'Audio playback isn’t available right now.';
      render();
    };
    synth.speak(utterance);
  }

  // Pausing cancels and later restarts the current block, rather than using
  // synth.pause(), which is unreliable on mobile browsers.
  function pause() {
    playing = false;
    generation++;
    synth.cancel();
    clearWord();
    stopTimeTicker();
    status.textContent = 'Paused';
    render();
  }

  function finish() {
    playing = false;
    sessionActive = false;
    generation++;
    synth.cancel();
    stopTimeTicker();
    index = 0;
    setHighlight(-1);
    status.textContent = '';
    render();
  }

  function playFrom(i) {
    if (!sessionActive) status.textContent = 'Tip: click any paragraph to jump there.';
    else status.textContent = '';
    playing = true;
    sessionActive = true;
    render();
    startTimeTicker();
    speakFrom(i);
  }

  toggle.addEventListener('click', () => {
    if (playing) pause();
    else playFrom(index);
  });
  prevBtn.addEventListener('click', () => playFrom(Math.max(0, index - 1)));
  nextBtn.addEventListener('click', () => playFrom(index + 1));

  // Clicking a block jumps playback there — but only mid-session, so ordinary
  // clicks (or text selection) on the page never start audio unexpectedly.
  article.addEventListener('click', (e) => {
    if (!sessionActive) return;
    if (e.target.closest('a, button, input, select, label')) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    const el = e.target.closest('.listen-chunk');
    if (!el || !chunkIndex.has(el)) return;
    userScrolledAt = 0;
    playFrom(chunkIndex.get(el));
  });
  stopBtn.addEventListener('click', finish);
  // Reading speed is remembered per browser, like the voice and auto-scroll choices.
  const RATE_KEY = 'glass-listen-rate';
  try {
    const savedRate = localStorage.getItem(RATE_KEY);
    if (savedRate && [...rateSelect.options].some((o) => o.value === savedRate)) rateSelect.value = savedRate;
  } catch (e) { /* storage unavailable — keep 1× */ }
  rateSelect.addEventListener('change', () => {
    try { localStorage.setItem(RATE_KEY, rateSelect.value); } catch (e) { /* storage unavailable */ }
    if (playing) speakFrom(index);
    else updateTime();
  });
  window.addEventListener('pagehide', () => synth.cancel());

  synth.cancel(); // clear anything still queued from a previous page
  bar.hidden = false;
  pinBelowHeader();
  render();
}());

// ===== "Add to calendar" dropdown interactions =====
// Dates and calendar links (Google Calendar / .ics) are rendered server-side
// from the events table (see events-preview.eta, src/lib/calendarLinks.js) —
// this just wires up the hover-to-open behavior for whatever dropdowns exist.
(function () {
  document.querySelectorAll('.cal-dropdown').forEach(function (drop) {
    const links = drop.querySelector('.cal-links');
    let leaveTimer = null;
    let openTimer = null;

    drop.addEventListener('mouseenter', () => {
      clearTimeout(leaveTimer);
      drop.classList.add('cal-open');
      links.style.pointerEvents = 'none';
      clearTimeout(openTimer);
      openTimer = setTimeout(() => { links.style.pointerEvents = ''; }, 220);
    });
    drop.addEventListener('mouseleave', () => {
      clearTimeout(openTimer);
      leaveTimer = setTimeout(() => drop.classList.remove('cal-open'), 100);
    });
  });
}());
