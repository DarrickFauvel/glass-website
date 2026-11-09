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

    // Build secrets modal: a native <dialog>, so showModal() handles the
    // focus trap, Escape, and returning focus to whatever opened it.
    const sModal = document.createElement('dialog');
    sModal.className = 'secrets-modal';
    sModal.setAttribute('aria-labelledby', 'secrets-modal-title');
    sModal.innerHTML = `
      <span class="secrets-modal-tape" aria-hidden="true"></span>
      <div class="secrets-modal-card">
        <button type="button" class="secrets-modal-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <p class="secrets-modal-eyebrow">Found under the glass</p>
        <h2 class="secrets-modal-title" id="secrets-modal-title"></h2>
        <div class="secrets-modal-section">
          <h3 class="secrets-modal-label">The claim</h3>
          <p class="secrets-modal-text" id="secrets-belief"></p>
        </div>
        <div class="secrets-modal-section secrets-modal-section--question">
          <h3 class="secrets-modal-label">The question to ask</h3>
          <p class="secrets-modal-question" id="secrets-question"></p>
        </div>
        <p class="secrets-modal-footer">
          <a class="secrets-modal-cta" id="secrets-article"></a>
        </p>
      </div>`;
    document.body.appendChild(sModal);

    const sClose    = sModal.querySelector('.secrets-modal-close');
    const sTitle    = sModal.querySelector('#secrets-modal-title');
    const sBelief   = sModal.querySelector('#secrets-belief');
    const sQuestion = sModal.querySelector('#secrets-question');
    const sArticle  = sModal.querySelector('#secrets-article');

    // Published blog posts by topic, rendered server-side into home.eta (only
    // posts already live). A clue links to its article once one exists;
    // until then it points to the next meetup instead.
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
      if (article) {
        sArticle.href = `/blog/${article.slug}`;
        sArticle.textContent = 'Read the evidence';
        sArticle.setAttribute('aria-label', `Read the evidence: ${article.title}`);
      } else {
        sArticle.href = '/#events';
        sArticle.textContent = 'Talk it through at a meetup';
        sArticle.removeAttribute('aria-label');
      }
      // Taped up by hand: a slightly different lean, and the tape a little
      // off-centre at its own angle, every time a card comes out.
      const rand = (min, max) => min + Math.random() * (max - min);
      const lean = rand(0.8, 2.6) * (Math.random() < 0.5 ? -1 : 1);
      sModal.style.setProperty('--card-tilt', lean.toFixed(2) + 'deg');
      sModal.style.setProperty('--tape-tilt', (-lean * 1.4 + rand(-3, 3)).toFixed(2) + 'deg');
      sModal.style.setProperty('--tape-x', rand(-14, 14).toFixed(1) + '%');
      lensLocked = true;
      if (!sModal.open) sModal.showModal();
      sClose.focus();
    };

    // Runs however the dialog closes: button, Escape, backdrop, or a link.
    sModal.addEventListener('close', () => {
      lensLocked = false;
      following  = false;
      attracting = false;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(restoreTick);
    });

    sClose.addEventListener('click', () => sModal.close());
    // A click on the dialog element itself (not the card) is the backdrop.
    sModal.addEventListener('click', (e) => {
      if (e.target === sModal) sModal.close();
    });
    sArticle.addEventListener('click', () => sModal.close());

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

  // The beam frame around the magnified layer. In light mode it does nothing.
  // In dark mode the lens is a torch: the frame is masked to a soft-edged
  // beam, with a warm tint and falloff.
  const beam = document.createElement('div');
  beam.className = 'hero-beam';
  beam.setAttribute('aria-hidden', 'true');
  beam.appendChild(mag);
  const beamWarm = document.createElement('div');
  beamWarm.className = 'hero-beam-warm';
  const beamFalloff = document.createElement('div');
  beamFalloff.className = 'hero-beam-falloff';
  beam.append(beamWarm, beamFalloff);
  hero.insertBefore(beam, eyepiece);

  // Light the torch spills onto the page around the beam (dark mode only).
  const spill = document.createElement('div');
  spill.className = 'hero-beam-spill';
  spill.setAttribute('aria-hidden', 'true');
  hero.insertBefore(spill, beam);

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
  hero.insertBefore(caustic, beam);

  // The lens body and its shadow always show and hide together.
  function setLensOpacity(value) {
    if (value === '1' && overlay.style.opacity !== '1') flickerOn();
    overlay.style.opacity = value;
    caustic.style.opacity = value;
    spill.style.opacity   = value;
  }

  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let prevX = null, prevY = null;

  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

  // A short stutter when the torch comes on (dark mode, motion allowed).
  function flickerOn() {
    if (!motionOK || !isDark()) return;
    // Show the light at once: the flicker is its fade-in. (The usual 0.6s
    // fade would otherwise smooth the flicker's dips away.)
    [mag, spill].forEach(el => {
      el.style.transition = 'none';
      el.style.opacity = '1';
    });
    setTimeout(() => {
      mag.style.transition = 'opacity 0.6s';
      spill.style.transition = 'opacity 0.6s';
    }, 750);
    [beam, spill].forEach(el => {
      el.classList.remove('is-flickering');
      void el.offsetWidth;
      el.classList.add('is-flickering');
    });
  }

  // Follow theme changes: redraw the lens as glass or torch, and flick the
  // torch on when switching to dark.
  new MutationObserver(() => {
    applyLens(lensX, lensY);
    if (isDark() && overlay.style.opacity === '1') flickerOn();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });


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
  spill.style.transition   = 'opacity 0.6s';

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
    const at = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    if (isDark()) {
      applyBeam(x, y, at);
    } else {
      beam.style.transform = '';
      beam.style.clipPath = '';
      beam.style.maskImage = beam.style.webkitMaskImage = '';
      mag.style.clipPath        = `circle(${(LENS_R / SCALE).toFixed(1)}px at ${at})`;
      mag.style.transformOrigin = at;
      mag.style.transform       = `scale(${SCALE})`;
    }
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

  // Dark-mode torch: a soft-edged circle of warm light, brightest in the middle.
  function applyBeam(x, y, at) {
    const shape = `circle ${LENS_R}px at ${at}`;
    beam.style.transform = '';
    // The clip keeps clicks inside the beam; the mask softens its edge.
    beam.style.clipPath = `circle(${LENS_R}px at ${at})`;
    beam.style.maskImage = beam.style.webkitMaskImage =
      `radial-gradient(${shape}, #000 0%, #000 72%, rgba(0, 0, 0, 0.55) 86%, transparent 100%)`;
    mag.style.clipPath = 'none';
    mag.style.transformOrigin = at;
    mag.style.transform = `scale(${SCALE})`;
    // A hot core of light, then a gentler dim toward the edge of the beam.
    beamFalloff.style.background =
      `radial-gradient(${shape}, rgba(255, 226, 170, 0.16) 0%, rgba(255, 226, 170, 0) 40%), ` +
      `radial-gradient(${shape}, rgba(24, 17, 12, 0) 30%, rgba(24, 17, 12, 0.16) 68%, rgba(24, 17, 12, 0.36) 100%)`;
    const size = LENS_R * 6;
    spill.style.width  = size + 'px';
    spill.style.height = size + 'px';
    spill.style.left   = (x - size / 2) + 'px';
    spill.style.top    = (y - size / 2) + 'px';
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

// ===== Read-aloud for long-form pages =====
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
    ...Array.from(prose.querySelectorAll('h2, h3, p, li')).filter(
      (el) => !el.closest('.footnotes, .toolkit-activities') && !(el.tagName === 'P' && el.closest('li'))
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
    if (playing) speakFrom(index, sentence);
  });

  // Follow along by keeping the sentence being read on screen, but back off
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
    if (followToggle.checked && playing) {
      userScrolledAt = 0;
      followAlong(currentSentenceRange);
    }
  });

  // Keeps the sentence being read comfortably on screen. Once it would sit
  // under the pinned bar or low in the window, scroll so it starts about a
  // third of the way down the visible area. Following the sentence, not the
  // whole paragraph, means a long paragraph scrolls as it's read instead of
  // running off the bottom until the next paragraph begins.
  function followAlong(range) {
    if (!range || !followToggle.checked) return;
    if (Date.now() - userScrolledAt < USER_SCROLL_GRACE_MS) return;
    const rect = range.getBoundingClientRect();
    if (!rect.height) return;
    const viewH = window.innerHeight;
    // The header and pinned bar cover the top of the screen. Measure from where
    // the bar's bottom edge will be once it's pinned (it may not be yet).
    const coveredTop = (parseFloat(bar.style.top) || 0) + bar.offsetHeight;
    const available = viewH - coveredTop;
    const GAP = 16;
    const comfortableBottom = viewH - Math.min(available * 0.2, 160);
    if (rect.top >= coveredTop + GAP && rect.bottom <= comfortableBottom) return;
    const targetTop = coveredTop + Math.max(GAP, Math.min(available * 0.3, available - rect.height - GAP));
    window.scrollTo({
      top: window.scrollY + rect.top - targetTop,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  // A DOM Range over spoken characters [start, end) of a block.
  function textRange(chunk, start, end) {
    const first = chunk.positions[start];
    const last = chunk.positions[end - 1];
    if (!first || !last) return null;
    const range = new Range();
    range.setStart(first.node, first.offset);
    range.setEnd(last.node, last.offset + 1);
    return range;
  }

  // Each block is spoken one sentence at a time, so the sentence highlight
  // changes exactly when the voice moves on — in every browser, with no need
  // for word-boundary events (which Android Chrome never sends). Sentences are
  // [start, end) offsets into the block's spoken text; initials ("J. B. Rhine")
  // and common abbreviations don't end one.
  const wordCount = (text) => text.split(' ').length;
  const NOT_SENTENCE_END = /(?:^|[\s(“"‘'])(?:[A-Z]|e\.g|i\.e|etc|vs|Dr|Mr|Mrs|Ms|St|Jr|Sr|No|U\.S|U\.K|al|Fig|ca|approx)\.$/;

  function splitSentences(text) {
    const sentences = [];
    let start = 0;
    for (const match of text.matchAll(/[.!?]+["'”’)\]]*\s+(?=["'“‘(\[]?[A-Z0-9])/g)) {
      if (NOT_SENTENCE_END.test(text.slice(Math.max(start, match.index - 12), match.index + 1))) continue;
      sentences.push({ start, end: match.index + match[0].trimEnd().length });
      start = match.index + match[0].length;
    }
    if (start < text.length) sentences.push({ start, end: text.length });
    let before = 0;
    sentences.forEach((sentence) => {
      sentence.words = wordCount(text.slice(sentence.start, sentence.end));
      sentence.before = before; // words in this block before the sentence
      before += sentence.words;
    });
    return sentences;
  }

  chunks.forEach((chunk) => {
    chunk.words = wordCount(chunk.text);
    chunk.sentences = splitSentences(chunk.text);
  });

  // The sentence being read gets a soft highlight via the CSS Custom Highlight
  // API, so the article's HTML is never touched. Browsers without it fall back
  // to shading the whole paragraph (see .no-sentence-highlight in the CSS).
  const sentenceHighlight = window.CSS && CSS.highlights && typeof Highlight === 'function'
    ? new Highlight()
    : null;
  if (sentenceHighlight) CSS.highlights.set('listen-sentence', sentenceHighlight);
  else article.classList.add('no-sentence-highlight');
  let currentSentenceRange = null;

  function showSentence(range) {
    currentSentenceRange = range;
    if (!sentenceHighlight) return;
    sentenceHighlight.clear();
    if (range) sentenceHighlight.add(range);
  }

  // The paragraph being read gets a quiet bar in the margin.
  function setBlock(i) {
    chunks.forEach((chunk, j) => chunk.el.classList.toggle('is-reading', j === i));
  }

  // Optional underline under each word as it's spoken ("Follow words", off by
  // default and remembered per browser). A single absolutely-positioned
  // element placed from the word's Range rects; it glides along a line and
  // jumps straight to the next one. Driven by word-boundary events when the
  // voice sends them; otherwise paced by estimate (see startPacer).
  const wordsToggle = document.getElementById('listen-words');
  const WORDS_KEY = 'glass-listen-words';
  try {
    if (localStorage.getItem(WORDS_KEY) === 'on') wordsToggle.checked = true;
  } catch (e) { /* storage unavailable — keep the default */ }

  const underline = document.createElement('span');
  underline.className = 'reading-underline';
  underline.setAttribute('aria-hidden', 'true');
  article.appendChild(underline);
  let currentWordRange = null;
  let underlineTop = null;

  function wordRange(chunk, charIndex, charLength) {
    const { text } = chunk;
    let end = charLength ? charIndex + charLength : charIndex;
    if (!charLength) while (end < text.length && !/\s/.test(text[end])) end++;
    // Don't underline trailing punctuation or spaces.
    while (end > charIndex && /[\s.,;:!?"'”’)\]]/.test(text[end - 1])) end--;
    return textRange(chunk, charIndex, end);
  }

  function placeUnderline(range) {
    const rect = range.getClientRects()[0];
    if (!rect) return false;
    const base = article.getBoundingClientRect();
    const top = rect.bottom - base.top;
    // Glide between words on the same line, but jump to a new line rather
    // than sweeping diagonally across the paragraph.
    const newLine = top !== underlineTop;
    underline.classList.toggle('no-glide', newLine);
    underline.style.left = `${rect.left - base.left}px`;
    underline.style.top = `${top}px`;
    underline.style.width = `${rect.width}px`;
    underlineTop = top;
    if (newLine) {
      void underline.offsetWidth; // apply the jump before re-enabling the glide
      underline.classList.remove('no-glide');
    }
    return true;
  }

  function underlineWord(chunk, charIndex, charLength) {
    if (!wordsToggle.checked) return;
    const range = wordRange(chunk, charIndex, charLength);
    if (!range) return;
    currentWordRange = range;
    underline.classList.toggle('is-visible', placeUnderline(range));
  }

  function clearWord() {
    stopPacer();
    currentWordRange = null;
    underlineTop = null;
    underline.classList.remove('is-visible');
  }

  wordsToggle.addEventListener('change', () => {
    try {
      localStorage.setItem(WORDS_KEY, wordsToggle.checked ? 'on' : 'off');
    } catch (e) { /* storage unavailable — choice lasts for this page only */ }
    if (!wordsToggle.checked) clearWord();
    // Turning it on mid-sentence picks up from the next sentence.
  });

  // Many voices never send word-boundary events: every voice in Android
  // Chrome, and network voices such as desktop Chrome's "Google" ones. For
  // those, step the underline through the sentence at the estimated speaking
  // pace, weighting each word by its length plus a pause after punctuation.
  // It restarts with every sentence so drift stays small, and a real boundary
  // event takes over the moment one arrives.
  let pacer = null;

  function stopPacer() {
    clearInterval(pacer);
    pacer = null;
  }

  function startPacer(chunk, sentence, myGeneration) {
    stopPacer();
    const words = [];
    let total = 0;
    for (const match of chunk.text.slice(sentence.start, sentence.end).matchAll(/\S+/g)) {
      const word = match[0];
      const pause = /[,;:—–]["'”’)\]]*$/.test(word) ? 3 : 0;
      words.push({ at: sentence.start + match.index, from: total });
      total += word.length + 1 + pause;
    }
    if (!words.length) return;
    const startedAt = performance.now();
    let shown = -1;
    const tick = () => {
      if (myGeneration !== generation || boundaryWords || !wordsToggle.checked) {
        stopPacer();
        return;
      }
      const duration = sentence.words / wordsPerSecond();
      const reached = ((performance.now() - startedAt) / 1000 / duration) * total;
      let k = Math.max(shown, 0);
      while (k + 1 < words.length && words[k + 1].from <= reached) k++;
      if (k !== shown) {
        shown = k;
        underlineWord(chunk, words[k].at, 0);
      }
    };
    tick();
    pacer = setInterval(tick, 80);
  }

  // Text reflows on resize, so move the underline with its word.
  window.addEventListener('resize', () => {
    if (currentWordRange) placeUnderline(currentWordRange);
  });

  // Listening-time estimate: total, and what's left from the current position.
  // Starts from a typical speech-synthesis pace and then calibrates to the
  // actual voice by timing each sentence that's read to the end. Progress
  // within a sentence comes from word-boundary events when the voice sends
  // them, otherwise from elapsed time.
  const timeEl = document.getElementById('listen-time');
  const totalWords = chunks.reduce((sum, chunk) => sum + chunk.words, 0);
  let baseWpm = 170; // words per minute at 1×
  let sentence = 0; // index of the sentence being read within chunks[index]
  let sentenceStartedAt = 0;
  let spokenInSentence = 0;
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
    const current = chunks[index];
    const currentSentence = current && current.sentences[sentence];
    let doneInChunk = 0;
    if (currentSentence) {
      let doneInSentence = 0;
      if (playing) {
        doneInSentence = boundaryWords
          ? spokenInSentence
          : ((performance.now() - sentenceStartedAt) / 1000) * wordsPerSecond();
      }
      doneInChunk = currentSentence.before + Math.min(doneInSentence, currentSentence.words);
    }
    const wordsBefore = chunks.slice(0, index).reduce((sum, chunk) => sum + chunk.words, 0);
    const remainingWords = totalWords - wordsBefore - doneInChunk;
    timeEl.textContent = `${formatClock(remainingWords / wordsPerSecond())} left of ${formatMinutes(totalSeconds)}`;
  }

  function startTimeTicker() {
    if (!timeTimer) timeTimer = setInterval(updateTime, 1000);
  }

  function stopTimeTicker() {
    clearInterval(timeTimer);
    timeTimer = null;
  }

  // Blend each fully-read sentence's measured pace into the estimate; short
  // ones (headings, fragments) are too noisy to learn from.
  function calibrate(spoken) {
    const seconds = (performance.now() - sentenceStartedAt) / 1000;
    if (spoken.words < 8 || seconds < 1) return;
    const measured = (spoken.words / (seconds / 60)) / Number(rateSelect.value);
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

  function speakFrom(i, s = 0) {
    synth.cancel();
    const myGeneration = ++generation;
    if (i >= chunks.length) {
      finish();
      return;
    }
    const chunk = chunks[i];
    if (s >= chunk.sentences.length) {
      speakFrom(i + 1);
      return;
    }
    index = i;
    sentence = s;
    setBlock(i);
    clearWord();
    const spoken = chunk.sentences[s];
    const range = textRange(chunk, spoken.start, spoken.end);
    showSentence(range);
    if (playing) followAlong(range);
    sentenceStartedAt = performance.now();
    spokenInSentence = 0;
    boundaryWords = false;
    updateTime();
    const text = chunk.text.slice(spoken.start, spoken.end);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Number(rateSelect.value);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    // Pace from when speech actually starts, not when it was queued (mobile
    // voices can take a moment to begin).
    utterance.onstart = () => {
      if (myGeneration !== generation) return;
      sentenceStartedAt = performance.now();
      if (!boundaryWords && wordsToggle.checked) startPacer(chunk, spoken, myGeneration);
    };
    utterance.onboundary = (e) => {
      if (myGeneration !== generation || e.name !== 'word') return;
      stopPacer();
      boundaryWords = true;
      spokenInSentence = e.charIndex ? wordCount(text.slice(0, e.charIndex).trim()) : 0;
      underlineWord(chunk, spoken.start + e.charIndex, e.charLength);
    };
    utterance.onend = () => {
      if (myGeneration !== generation || !playing) return;
      calibrate(spoken);
      speakFrom(i, s + 1);
    };
    utterance.onerror = (e) => {
      if (myGeneration !== generation || e.error === 'interrupted' || e.error === 'canceled') return;
      playing = false;
      status.textContent = 'Audio playback isn’t available right now.';
      render();
    };
    synth.speak(utterance);
  }

  // Pausing cancels and later restarts the current sentence, rather than using
  // synth.pause(), which is unreliable on mobile browsers. The sentence stays
  // highlighted to show where Resume will pick up.
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
    sentence = 0;
    setBlock(-1);
    showSentence(null);
    clearWord();
    status.textContent = '';
    render();
  }

  function playFrom(i, s = 0) {
    if (!sessionActive) status.textContent = 'Tip: click any sentence to jump there.';
    else status.textContent = '';
    playing = true;
    sessionActive = true;
    render();
    startTimeTicker();
    speakFrom(i, s);
  }

  toggle.addEventListener('click', () => {
    if (playing) pause();
    else playFrom(index, sentence);
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
    const i = chunkIndex.get(el);
    playFrom(i, sentenceAtPoint(chunks[i], e.clientX, e.clientY));
  });

  // Which sentence of a block sits under the pointer (0 if it can't tell).
  function sentenceAtPoint(chunk, x, y) {
    let node = null;
    let offset = 0;
    if (document.caretPositionFromPoint) {
      const caret = document.caretPositionFromPoint(x, y);
      if (caret) ({ offsetNode: node, offset } = caret);
    } else if (document.caretRangeFromPoint) {
      const caret = document.caretRangeFromPoint(x, y);
      if (caret) ({ startContainer: node, startOffset: offset } = caret);
    }
    if (!node) return 0;
    const at = chunk.positions.findIndex((p) => p.node === node && p.offset >= offset);
    if (at < 0) return 0;
    const found = chunk.sentences.findIndex((sentence) => at < sentence.end);
    return Math.max(0, found);
  }
  stopBtn.addEventListener('click', finish);
  // Reading speed is remembered per browser, like the voice and auto-scroll choices.
  const RATE_KEY = 'glass-listen-rate';
  try {
    const savedRate = localStorage.getItem(RATE_KEY);
    if (savedRate && [...rateSelect.options].some((o) => o.value === savedRate)) rateSelect.value = savedRate;
  } catch (e) { /* storage unavailable — keep 1× */ }
  rateSelect.addEventListener('change', () => {
    try { localStorage.setItem(RATE_KEY, rateSelect.value); } catch (e) { /* storage unavailable */ }
    if (playing) speakFrom(index, sentence);
    else updateTime();
  });
  window.addEventListener('pagehide', () => synth.cancel());

  synth.cancel(); // clear anything still queued from a previous page
  bar.hidden = false;
  pinBelowHeader();
  render();
}());


// ===== Toolkit exercises =====
const svgEl = (name, attrs = {}) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
};

// A patient's face for the exercises: flushed and frowning while unwell,
// plain and smiling once better.
function labFace(x, y, index, better) {
  const tilt = ((index * 7) % 11) - 5; // a fixed, hand-drawn wobble
  const placed = svgEl('g', { transform: `translate(${x} ${y}) rotate(${tilt})` });
  const patient = svgEl('g', { class: `fallacy-lab-patient${better ? ' is-better' : ''}` });
  if (better) patient.style.animationDelay = `${index * 25}ms`;
  patient.append(
    svgEl('circle', { class: 'fallacy-lab-face', r: 15 }),
    svgEl('circle', { class: 'fallacy-lab-eye', cx: -5, cy: -3, r: 1.8 }),
    svgEl('circle', { class: 'fallacy-lab-eye', cx: 5, cy: -3, r: 1.8 }),
    svgEl('path', { class: 'fallacy-lab-mouth', d: better ? 'M-7 4 Q0 12 7 4' : 'M-6 9 Q0 3 6 9' }),
  );
  placed.append(patient);
  return placed;
}

// Texas sharpshooter exercise.
// The visitor fires random shots, paints a target around the best cluster, then
// fires again at the same target. The copy lives in content/toolkit.md. Its
// odds were simulated: a painted target averages about 7 hits, a fixed one 2.6.
document.querySelectorAll('[data-fallacy-lab="sharpshooter"]').forEach((lab) => {
  const WIDTH = 400;
  const HEIGHT = 260;
  const RADIUS = 52;
  const SHOTS = 30;
  const MARGIN = 4;

  const svg = svgEl('svg', { viewBox: `0 0 ${WIDTH} ${HEIGHT}`, role: 'group', 'aria-label': 'The side of a barn, with bullet holes and a painted target' });
  svg.append(svgEl('rect', { class: 'fallacy-lab-wall', width: WIDTH, height: HEIGHT }));
  for (let x = 50; x < WIDTH; x += 50) {
    svg.append(svgEl('line', { class: 'fallacy-lab-plank', x1: x, y1: 0, x2: x, y2: HEIGHT }));
  }
  const holes = svgEl('g');
  const target = svgEl('g', { class: 'fallacy-lab-target', tabindex: '0', role: 'button', 'aria-label': 'Target. Use the arrow keys to move it.' });
  [RADIUS, RADIUS * 0.66, RADIUS * 0.33].forEach((r, i) => {
    target.append(svgEl('circle', { r, class: i % 2 ? 'fallacy-lab-ring-light' : 'fallacy-lab-ring' }));
  });
  svg.append(target, holes);
  lab.querySelector('[data-lab-barn]').append(svg);

  const score = lab.querySelector('[data-lab-score]');
  let shots = [];
  let centre = { x: WIDTH / 2, y: HEIGHT / 2 };
  let painted = 0;
  let movable = false;

  const fire = () => Array.from({ length: SHOTS }, () => ({
    x: MARGIN + Math.random() * (WIDTH - 2 * MARGIN),
    y: MARGIN + Math.random() * (HEIGHT - 2 * MARGIN),
  }));
  const hits = (at) => shots.filter((s) => (s.x - at.x) ** 2 + (s.y - at.y) ** 2 <= RADIUS ** 2).length;

  function drawShots() {
    holes.replaceChildren(...shots.map((s, i) => {
      const hole = svgEl('circle', { class: 'fallacy-lab-hole', cx: s.x, cy: s.y, r: 3.5 });
      hole.style.animationDelay = `${i * 25}ms`;
      return hole;
    }));
  }

  function placeTarget(x, y) {
    centre = {
      x: Math.min(WIDTH - RADIUS, Math.max(RADIUS, x)),
      y: Math.min(HEIGHT - RADIUS, Math.max(RADIUS, y)),
    };
    target.setAttribute('transform', `translate(${centre.x} ${centre.y})`);
    if (movable) score.textContent = `${hits(centre)} of ${SHOTS} shots inside the target`;
  }

  function showStep(name) {
    lab.querySelectorAll('[data-lab-step]').forEach((step) => {
      step.hidden = step.dataset.labStep !== name;
    });
    movable = name === 'paint';
    target.style.display = name === 'fire' ? 'none' : '';
    svg.classList.toggle('is-painting', movable);
    lab.querySelector(`[data-lab-step="${name}"] button`).focus({ preventScroll: true });
  }

  const actions = {
    fire() {
      shots = fire();
      drawShots();
      showStep('paint');
      placeTarget(WIDTH / 2, HEIGHT / 2);
    },
    find() {
      let best = centre;
      let most = -1;
      for (let x = RADIUS; x <= WIDTH - RADIUS; x += 6) {
        for (let y = RADIUS; y <= HEIGHT - RADIUS; y += 6) {
          const count = hits({ x, y });
          if (count > most) { most = count; best = { x, y }; }
        }
      }
      placeTarget(best.x, best.y);
    },
    lock() {
      painted = hits(centre);
      showStep('fair');
      score.textContent = `${painted} of ${SHOTS} shots inside the target`;
    },
    retest() {
      shots = fire();
      drawShots();
      const fair = hits(centre);
      lab.querySelector('[data-lab-after]').textContent = painted;
      lab.querySelector('[data-lab-before]').textContent = fair;
      showStep('result');
      score.textContent = `${fair} of ${SHOTS} new shots inside the target`;
    },
    restart() {
      shots = [];
      holes.replaceChildren();
      score.textContent = '';
      showStep('fire');
    },
  };
  lab.addEventListener('click', (e) => {
    const action = e.target.closest('[data-lab-action]');
    if (action) actions[action.dataset.labAction]();
  });

  // The whole barn takes the drag, not just the target: the bullet holes sit on
  // top of it and would swallow a press, and touch-action only works reliably
  // on the <svg> itself. Pressing the target keeps it under the same spot of
  // the finger; pressing elsewhere moves it there.
  function pointerPosition(e) {
    const box = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - box.left) / box.width) * WIDTH,
      y: ((e.clientY - box.top) / box.height) * HEIGHT,
    };
  }
  let grab = { x: 0, y: 0 };
  svg.addEventListener('pointerdown', (e) => {
    if (!movable) return;
    const point = pointerPosition(e);
    const onTarget = (point.x - centre.x) ** 2 + (point.y - centre.y) ** 2 <= RADIUS ** 2;
    grab = onTarget ? { x: centre.x - point.x, y: centre.y - point.y } : { x: 0, y: 0 };
    svg.setPointerCapture(e.pointerId);
    placeTarget(point.x + grab.x, point.y + grab.y);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!movable || !svg.hasPointerCapture(e.pointerId)) return;
    const point = pointerPosition(e);
    placeTarget(point.x + grab.x, point.y + grab.y);
  });
  target.addEventListener('keydown', (e) => {
    const step = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
    if (!movable || !step) return;
    e.preventDefault();
    placeTarget(centre.x + step[0], centre.y + step[1]);
  });

  placeTarget(centre.x, centre.y);
  target.style.display = 'none';
});

// Post hoc exercise.
// The visitor gives a made-up cure to patients who mostly recover anyway, judges
// it, then sees a comparison group that took nothing. Both groups use the same
// odds, so the cure never does anything. The copy lives in content/toolkit.md.
document.querySelectorAll('[data-fallacy-lab="post-hoc"]').forEach((lab) => {
  const PATIENTS = 20;
  const COLUMNS = 10;
  const CELL = 40;
  const RECOVERY_ODDS = 0.8;
  const GROUP_HEIGHT = 104; // a label plus two rows of faces
  const GROUP_GAP = 14;

  const svg = svgEl('svg', { viewBox: `0 0 400 ${GROUP_HEIGHT}`, role: 'img' });
  const treatedGroup = svgEl('g');
  const controlGroup = svgEl('g', { transform: `translate(0 ${GROUP_HEIGHT + GROUP_GAP})` });
  svg.append(treatedGroup, controlGroup);
  lab.querySelector('[data-lab-patients]').append(svg);

  const score = lab.querySelector('[data-lab-score]');
  const allSick = () => Array(PATIENTS).fill(false);
  const catchCold = () => Array.from({ length: PATIENTS }, () => Math.random() < RECOVERY_ODDS);
  const countBetter = (group) => group.filter(Boolean).length;
  let remedy = '';
  let treated = allSick();

  function face(index, better) {
    const x = (index % COLUMNS) * CELL + CELL / 2;
    const y = 24 + Math.floor(index / COLUMNS) * CELL + CELL / 2;
    return labFace(x, y, index, better);
  }

  function drawGroup(group, label, patients) {
    const title = svgEl('text', { class: 'fallacy-lab-label', x: 4, y: 15 });
    title.textContent = `${label}: ${countBetter(patients)} of ${PATIENTS} better`;
    group.replaceChildren(title, ...patients.map((better, i) => face(i, better)));
  }

  function showStep(name, focus = true) {
    lab.querySelectorAll('[data-lab-step]').forEach((step) => {
      step.hidden = step.dataset.labStep !== name;
    });
    if (focus) lab.querySelector(`[data-lab-step="${name}"] button`).focus({ preventScroll: true });
  }

  function reset() {
    treated = allSick();
    drawGroup(treatedGroup, 'Your patients', treated);
    controlGroup.replaceChildren();
    svg.setAttribute('viewBox', `0 0 400 ${GROUP_HEIGHT}`);
    svg.setAttribute('aria-label', `${PATIENTS} patients with colds, all still sick`);
    score.textContent = '';
    lab.querySelectorAll('[data-lab-reply]').forEach((reply) => { reply.hidden = true; });
  }

  const actions = {
    pick(button) {
      remedy = button.dataset.labRemedy;
      lab.querySelectorAll('[data-lab-remedy-name]').forEach((name) => { name.textContent = remedy; });
      showStep('wait');
    },
    wait() {
      treated = catchCold();
      const better = countBetter(treated);
      drawGroup(treatedGroup, 'Your patients', treated);
      svg.setAttribute('aria-label', `${better} of ${PATIENTS} patients feel better`);
      score.textContent = `${better} of ${PATIENTS} patients feel better`;
      showStep('verdict');
    },
    verdict(button) {
      const control = catchCold();
      const treatedBetter = countBetter(treated);
      const controlBetter = countBetter(control);
      drawGroup(treatedGroup, 'Took your cure', treated);
      drawGroup(controlGroup, 'Took nothing', control);
      svg.setAttribute('viewBox', `0 0 400 ${2 * GROUP_HEIGHT + GROUP_GAP}`);
      svg.setAttribute('aria-label', `Took your cure: ${treatedBetter} of ${PATIENTS} better. Took nothing: ${controlBetter} of ${PATIENTS} better.`);
      score.textContent = '';
      lab.querySelector('[data-lab-treated]').textContent = treatedBetter;
      lab.querySelector('[data-lab-control]').textContent = controlBetter;
      lab.querySelector(`[data-lab-reply="${button.dataset.labVerdict}"]`).hidden = false;
      showStep('result');
    },
    restart() {
      reset();
      showStep('pick');
    },
  };
  lab.addEventListener('click', (e) => {
    const action = e.target.closest('[data-lab-action]');
    if (action) actions[action.dataset.labAction](action);
  });

  reset();
});

// Cherry-picking exercise.
// Forty years of made-up temperatures warm overall but swing from year to year.
// The visitor slides a 10-year window to find a stretch that seems to cool, then
// sees the trend across every year. The copy lives in content/toolkit.md.
document.querySelectorAll('[data-fallacy-lab="cherry-picking"]').forEach((lab) => {
  const YEARS = 40;
  const SPAN = 10;
  const WARMING = 0.05; // °F a year, so about half a degree a decade
  const NOISE = 0.6; // °F standard deviation from year to year
  const WIDTH = 400;
  const HEIGHT = 220;
  const PAD = { left: 34, right: 10, top: 12, bottom: 26 };
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const step = plotW / (YEARS - 1);

  const gaussian = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  // Least-squares slope in °F a year over temps[from, to).
  function slope(temps, from, to) {
    const n = to - from;
    const meanX = (from + to - 1) / 2;
    const meanY = temps.slice(from, to).reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = from; i < to; i += 1) {
      num += (i - meanX) * (temps[i] - meanY);
      den += (i - meanX) ** 2;
    }
    return { slope: num / den, meanX, meanY };
  }
  const windows = (temps) => Array.from({ length: YEARS - SPAN + 1 }, (_, i) => slope(temps, i, i + SPAN).slope);
  // Redraw until the record looks like the copy says: about half a degree a
  // decade overall, with at least one 10-year stretch that clearly cools.
  function record() {
    for (let tries = 0; tries < 500; tries += 1) {
      const temps = Array.from({ length: YEARS }, (_, i) => 72 + WARMING * i + NOISE * gaussian());
      const overall = slope(temps, 0, YEARS).slope * 10;
      if (overall > 0.4 && overall < 0.6 && Math.min(...windows(temps)) * 10 < -0.3) return temps;
    }
    return Array.from({ length: YEARS }, (_, i) => 72 + WARMING * i + NOISE * gaussian());
  }

  const svg = svgEl('svg', { viewBox: `0 0 ${WIDTH} ${HEIGHT}`, role: 'group', 'aria-label': 'A chart of 40 years of made-up temperatures, with a 10-year window you can move' });
  const axes = svgEl('g');
  const band = svgEl('rect', { class: 'fallacy-lab-window', y: PAD.top, height: plotH, tabindex: '0', role: 'slider', 'aria-label': 'The 10-year window. Use the arrow keys to move it.', 'aria-valuemin': 1, 'aria-valuemax': YEARS - SPAN + 1 });
  const line = svgEl('polyline', { class: 'fallacy-lab-series' });
  const dots = svgEl('g');
  const windowTrend = svgEl('line', { class: 'fallacy-lab-trend' });
  const allTrend = svgEl('line', { class: 'fallacy-lab-trend fallacy-lab-trend--all' });
  svg.append(axes, band, line, dots, allTrend, windowTrend);
  lab.querySelector('[data-lab-chart]').append(svg);

  const score = lab.querySelector('[data-lab-score]');
  let temps = [];
  let start = 0;
  let movable = false;
  let low = 0;
  let high = 1;
  const x = (i) => PAD.left + i * step;
  const y = (t) => PAD.top + (1 - (t - low) / (high - low)) * plotH;
  const perDecade = (s) => `${s >= 0 ? '+' : '−'}${Math.abs(s * 10).toFixed(1)}°F a decade`;

  function trendLine(el, from, to) {
    const fit = slope(temps, from, to);
    const at = (i) => fit.meanY + fit.slope * (i - fit.meanX);
    Object.entries({ x1: x(from), y1: y(at(from)), x2: x(to - 1), y2: y(at(to - 1)) })
      .forEach(([key, value]) => el.setAttribute(key, value));
    el.classList.toggle('is-cooling', fit.slope < 0);
    return fit.slope;
  }

  function draw() {
    low = Math.floor(Math.min(...temps)) - 0.5;
    high = Math.ceil(Math.max(...temps)) + 0.5;
    const ticks = [];
    for (let t = Math.ceil(low); t <= high; t += 1) {
      const label = svgEl('text', { class: 'fallacy-lab-axis', x: PAD.left - 6, y: y(t) + 4, 'text-anchor': 'end' });
      label.textContent = `${t}°`;
      ticks.push(svgEl('line', { class: 'fallacy-lab-grid', x1: PAD.left, x2: WIDTH - PAD.right, y1: y(t), y2: y(t) }), label);
    }
    [1, 10, 20, 30, 40].forEach((year) => {
      const label = svgEl('text', { class: 'fallacy-lab-axis', x: x(year - 1), y: HEIGHT - 8, 'text-anchor': 'middle' });
      label.textContent = `Year ${year}`;
      ticks.push(label);
    });
    axes.replaceChildren(...ticks);
    line.setAttribute('points', temps.map((t, i) => `${x(i)},${y(t)}`).join(' '));
    dots.replaceChildren(...temps.map((t, i) => svgEl('circle', { class: 'fallacy-lab-point', cx: x(i), cy: y(t), r: 2.6 })));
    band.setAttribute('width', (SPAN - 1) * step + 12);
  }

  function placeWindow(first) {
    start = Math.min(YEARS - SPAN, Math.max(0, Math.round(first)));
    band.setAttribute('x', x(start) - 6);
    band.setAttribute('aria-valuenow', start + 1);
    band.setAttribute('aria-valuetext', `Years ${start + 1} to ${start + SPAN}`);
    const s = trendLine(windowTrend, start, start + SPAN);
    score.textContent = `Years ${start + 1}–${start + SPAN}: ${perDecade(s)}`;
  }

  function showStep(name, focus = true) {
    lab.querySelectorAll('[data-lab-step]').forEach((el) => { el.hidden = el.dataset.labStep !== name; });
    movable = name === 'pick';
    svg.classList.toggle('is-painting', movable);
    allTrend.style.display = movable ? 'none' : '';
    if (focus) lab.querySelector(`[data-lab-step="${name}"] button`).focus({ preventScroll: true });
  }

  function reset() {
    temps = record();
    draw();
    lab.querySelectorAll('[data-lab-reply]').forEach((reply) => { reply.hidden = true; });
    placeWindow(0);
  }

  const actions = {
    find() {
      const all = windows(temps);
      placeWindow(all.indexOf(Math.min(...all)));
    },
    quote() {
      const mine = slope(temps, start, start + SPAN).slope;
      const overall = trendLine(allTrend, 0, YEARS);
      lab.querySelector('[data-lab-window]').textContent = perDecade(mine);
      lab.querySelector('[data-lab-all]').textContent = perDecade(overall);
      lab.querySelector(`[data-lab-reply="${mine < 0 ? 'down' : 'up'}"]`).hidden = false;
      score.textContent = `All 40 years: ${perDecade(overall)}`;
      showStep('result');
    },
    restart() {
      reset();
      showStep('pick');
    },
  };
  lab.addEventListener('click', (e) => {
    const action = e.target.closest('[data-lab-action]');
    if (action) actions[action.dataset.labAction]();
  });

  // As on the barn, the whole chart takes the drag. Pressing inside the window
  // keeps it under the same spot of the finger; pressing elsewhere centres it there.
  const yearAt = (e) => {
    const box = svg.getBoundingClientRect();
    return (((e.clientX - box.left) / box.width) * WIDTH - PAD.left) / step;
  };
  let grab = 0;
  svg.addEventListener('pointerdown', (e) => {
    if (!movable) return;
    const year = yearAt(e);
    grab = year >= start - 0.5 && year <= start + SPAN - 0.5 ? start - year : -(SPAN - 1) / 2;
    svg.setPointerCapture(e.pointerId);
    placeWindow(year + grab);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!movable || !svg.hasPointerCapture(e.pointerId)) return;
    placeWindow(yearAt(e) + grab);
  });
  band.addEventListener('keydown', (e) => {
    const move = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, Home: -YEARS, End: YEARS }[e.key];
    if (!movable || move === undefined) return;
    e.preventDefault();
    placeWindow(start + move);
  });

  reset();
  showStep('pick', false);
});

// Slippery slope exercise.
// The visitor rates each link of a made-up chain of consequences, then sees the
// odds of the whole chain: the product of the links, shrinking at every step.
// No link can be rated certain, so the chain always ends up less likely than
// its weakest link. The copy lives in content/toolkit.md.
document.querySelectorAll('[data-fallacy-lab="slippery-slope"]').forEach((lab) => {
  const START = 70;
  const links = [...lab.querySelectorAll('[data-lab-links] li')];
  const score = lab.querySelector('[data-lab-score]');
  const percent = (p) => `${Math.round(p * 100)}%`;

  const sliders = links.map((link, i) => {
    const id = `slippery-slope-link-${i + 1}`;
    const text = link.querySelector('[data-lab-link-text]');
    text.id = `${id}-text`;
    const row = document.createElement('span');
    row.className = 'fallacy-lab-rating';
    const input = Object.assign(document.createElement('input'), { type: 'range', id, min: 5, max: 95, step: 5, value: START });
    input.setAttribute('aria-labelledby', text.id);
    const output = document.createElement('output');
    output.htmlFor = id;
    const show = () => {
      output.textContent = `${input.value}%`;
      input.setAttribute('aria-valuetext', `${input.value}% likely`);
    };
    input.addEventListener('input', show);
    show();
    row.append(input, output);
    link.append(row);
    return input;
  });

  // A staircase of the chain's odds after each link, from 100% down.
  const WIDTH = 400;
  const HEIGHT = 170;
  const BASE = HEIGHT - 22;
  const TOP = 20;
  const svg = svgEl('svg', { viewBox: `0 0 ${WIDTH} ${HEIGHT}`, role: 'img' });
  const slope = lab.querySelector('[data-lab-slope]');
  slope.append(svg);

  function drawStairs(odds) {
    const bar = WIDTH / odds.length;
    svg.replaceChildren(...odds.flatMap((p, i) => {
      const top = BASE - p * (BASE - TOP);
      const rect = svgEl('rect', { class: `fallacy-lab-stair${i === odds.length - 1 ? ' is-last' : ''}`, x: i * bar + 4, y: top, width: bar - 8, height: BASE - top });
      rect.style.animationDelay = `${i * 120}ms`;
      const value = svgEl('text', { class: 'fallacy-lab-label', x: i * bar + bar / 2, y: top - 6, 'text-anchor': 'middle' });
      value.textContent = percent(p);
      const name = svgEl('text', { class: 'fallacy-lab-axis', x: i * bar + bar / 2, y: HEIGHT - 6, 'text-anchor': 'middle' });
      name.textContent = i === 0 ? 'Trucks' : `Step ${i}`;
      return [rect, value, name];
    }));
    svg.setAttribute('aria-label', `Chance the chain has got this far: ${odds.map((p, i) => `${i === 0 ? 'food trucks arrive' : `step ${i}`} ${percent(p)}`).join(', ')}`);
  }

  function showStep(name) {
    lab.querySelectorAll('[data-lab-step]').forEach((el) => { el.hidden = el.dataset.labStep !== name; });
    sliders.forEach((input) => { input.disabled = name !== 'rate'; });
    lab.querySelector(`[data-lab-step="${name}"] button`).focus({ preventScroll: true });
  }

  const actions = {
    multiply() {
      const odds = [1];
      sliders.forEach((input) => odds.push(odds[odds.length - 1] * (input.value / 100)));
      const total = odds[odds.length - 1];
      drawStairs(odds);
      slope.hidden = false;
      lab.querySelector('[data-lab-total]').textContent = percent(total) === '0%' ? 'under 1%' : percent(total);
      score.textContent = `The whole chain: ${percent(total) === '0%' ? 'under 1%' : percent(total)}`;
      showStep('result');
    },
    restart() {
      slope.hidden = true;
      score.textContent = '';
      showStep('rate');
    },
  };
  lab.addEventListener('click', (e) => {
    const action = e.target.closest('[data-lab-action]');
    if (action) actions[action.dataset.labAction]();
  });

  slope.hidden = true;
});

// Appeal to ignorance exercise.
// A hundred made-up sighting reports start out unexplained. Three rounds of
// investigation identify most of them; the few left had too little to go on.
// The visitor then decides what the leftovers show. The copy lives in
// content/toolkit.md.
document.querySelectorAll('[data-fallacy-lab="appeal-to-ignorance"]').forEach((lab) => {
  const REPORTS = 100;
  const ROUNDS = 3;
  const COLUMNS = 10;
  const CELL = 40;
  const CAUSES = [
    ['aircraft', 30], ['satellites', 15], ['balloons', 12], ['planets and stars', 12],
    ['drones', 10], ['birds', 8], ['camera glitches', 6],
  ];

  const svg = svgEl('svg', { viewBox: `0 0 ${COLUMNS * CELL} ${(REPORTS / COLUMNS) * CELL}`, role: 'img' });
  lab.querySelector('[data-lab-reports]').append(svg);
  const score = lab.querySelector('[data-lab-score]');
  let reports = [];
  let round = 0;

  // Each report gets a cause, or none, and the round in which it's identified.
  // Between 4 and 9 stay unexplained, and aircraft make up the difference.
  function pile() {
    const unknown = 4 + Math.floor(Math.random() * 6);
    const causes = CAUSES.flatMap(([cause, count]) => Array(count).fill(cause)).slice(0, REPORTS - unknown);
    while (causes.length < REPORTS - unknown) causes.push('aircraft');
    const all = [...causes, ...Array(unknown).fill(null)].map((cause) => ({ cause, round: 1 + Math.floor(Math.random() * ROUNDS) }));
    for (let i = all.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }
  const solved = (report) => report.cause && report.round <= round;

  function draw() {
    svg.replaceChildren(...reports.map((report, i) => {
      const x = (i % COLUMNS) * CELL + CELL / 2;
      const y = Math.floor(i / COLUMNS) * CELL + CELL / 2;
      const tilt = ((i * 7) % 9) - 4;
      const card = svgEl('g', { transform: `translate(${x} ${y}) rotate(${tilt})`, class: `fallacy-lab-report${solved(report) ? ' is-solved' : ''}${solved(report) && report.round === round ? ' is-new' : ''}` });
      if (solved(report) && report.round === round) card.style.animationDelay = `${(i % 25) * 20}ms`;
      card.append(svgEl('rect', { x: -14, y: -14, width: 28, height: 28, rx: 3 }));
      const mark = svgEl('text', { y: 6, 'text-anchor': 'middle' });
      mark.textContent = solved(report) ? '✓' : '?';
      card.append(mark);
      return card;
    }));
    const open = reports.filter((report) => !solved(report)).length;
    svg.setAttribute('aria-label', `${REPORTS} sighting reports: ${REPORTS - open} explained, ${open} unexplained`);
    if (!round) {
      score.textContent = `Unexplained: ${open} of ${REPORTS}`;
      return;
    }
    const tally = CAUSES.map(([cause]) => [cause, reports.filter((report) => report.cause === cause && solved(report)).length])
      .filter(([, count]) => count)
      .map(([cause, count]) => `${cause} ${count}`)
      .join(', ');
    score.textContent = `Unexplained: ${open} of ${REPORTS}. Identified so far: ${tally}.`;
  }

  function showStep(name) {
    lab.querySelectorAll('[data-lab-step]').forEach((el) => { el.hidden = el.dataset.labStep !== name; });
    lab.querySelector(`[data-lab-step="${name}"] button`).focus({ preventScroll: true });
  }

  function reset() {
    reports = pile();
    round = 0;
    lab.querySelector('[data-lab-action="investigate"]').textContent = 'Investigate';
    lab.querySelectorAll('[data-lab-reply]').forEach((reply) => { reply.hidden = true; });
    draw();
  }

  const actions = {
    investigate(button) {
      round += 1;
      draw();
      if (round < ROUNDS) {
        button.textContent = 'Keep investigating';
        return;
      }
      lab.querySelector('[data-lab-left]').textContent = reports.filter((report) => !report.cause).length;
      showStep('verdict');
    },
    verdict(button) {
      lab.querySelector(`[data-lab-reply="${button.dataset.labVerdict}"]`).hidden = false;
      showStep('result');
    },
    restart() {
      reset();
      showStep('investigate');
    },
  };
  lab.addEventListener('click', (e) => {
    const action = e.target.closest('[data-lab-action]');
    if (action) actions[action.dataset.labAction](action);
  });

  reset();
});

// Bandwagon exercise.
// Twenty people say in turn whether a made-up remedy works. Each has one
// private test and hears only what those ahead said aloud. Once the spoken
// tally leads by two, one test can't outweigh it, so people copy: an
// information cascade. The copy lives in content/toolkit.md.
document.querySelectorAll('[data-fallacy-lab="bandwagon"]').forEach((lab) => {
  const PEOPLE = 20;
  const YOU = 4; // zero-based: the visitor is fifth in line
  const COLUMNS = 10;
  const CELL = 40;
  const SECTION = 100;
  const RIGHT_ODDS = 0.7;
  const CASCADE_LEAD = 2;
  const RUNS = 1000;

  const svg = svgEl('svg', { role: 'img' });
  lab.querySelector('[data-lab-line]').append(svg);
  const score = lab.querySelector('[data-lab-score]');
  let tests = [];
  let said = [];

  // True means the test or the person says the remedy works, which is wrong.
  const drawTest = () => Math.random() >= RIGHT_ODDS;
  const yeses = (list) => list.filter(Boolean).length;

  function speak(test, spoken) {
    const lead = yeses(spoken) - (spoken.length - yeses(spoken));
    return Math.abs(lead) >= CASCADE_LEAD ? lead > 0 : test;
  }

  // The first two tests mislead on purpose, the visitor's points the right
  // way, and most of the tests have to say the remedy does nothing.
  function deal() {
    let dealt;
    do {
      dealt = Array.from({ length: PEOPLE }, () => drawTest());
      dealt[0] = true;
      dealt[1] = true;
      dealt[YOU] = false;
    } while (yeses(dealt) > 8);
    return dealt;
  }

  // One fresh line left to chance. Returns true if its majority ends up wrong.
  function majorityWrong(copying) {
    const fresh = Array.from({ length: PEOPLE }, () => drawTest());
    if (!copying) return yeses(fresh) > PEOPLE / 2;
    const spoken = [];
    fresh.forEach((test) => spoken.push(speak(test, spoken)));
    return yeses(spoken) > PEOPLE / 2;
  }

  function section(title, values, top) {
    const heading = svgEl('text', { class: 'fallacy-lab-axis', x: 2, y: top + 13 });
    heading.textContent = title;
    return [heading, ...Array.from({ length: PEOPLE }, (unused, i) => {
      const x = (i % COLUMNS) * CELL + CELL / 2;
      const y = top + 20 + Math.floor(i / COLUMNS) * CELL + CELL / 2;
      const value = values[i];
      const state = value === undefined ? 'is-waiting' : value ? 'is-yes' : 'is-no';
      const card = svgEl('g', { transform: `translate(${x} ${y}) rotate(${((i * 7) % 7) - 3})`, class: `fallacy-lab-vote ${state}${i === YOU ? ' is-you' : ''}` });
      card.append(svgEl('rect', { x: -16, y: -14, width: 32, height: 28, rx: 3 }));
      const mark = svgEl('text', { y: 5, 'text-anchor': 'middle' });
      mark.textContent = value === undefined ? '?' : value ? 'Yes' : 'No';
      card.append(mark);
      return card;
    })];
  }

  function draw(reveal) {
    svg.setAttribute('viewBox', `0 0 ${COLUMNS * CELL} ${reveal ? SECTION * 2 + 8 : SECTION}`);
    svg.replaceChildren(
      ...section('Said out loud (your card has the heavy outline)', said, 0),
      ...(reveal ? section('Private tests', tests, SECTION + 8) : []),
    );
    const yes = yeses(said);
    const no = said.length - yes;
    const testNote = reveal ? ` Private tests: ${yeses(tests)} said it works and ${PEOPLE - yeses(tests)} said it doesn't.` : '';
    svg.setAttribute('aria-label', `Said out loud: ${yes} said it works, ${no} said it doesn't, ${PEOPLE - said.length} haven't spoken.${testNote}`);
    score.textContent = `Said out loud: ${yes} say it works, ${no} say it doesn't`;
  }

  function showStep(name) {
    lab.querySelectorAll('[data-lab-step]').forEach((el) => { el.hidden = el.dataset.labStep !== name; });
    lab.querySelector(`[data-lab-step="${name}"] button`).focus({ preventScroll: true });
  }

  function reset() {
    tests = deal();
    said = [];
    for (let i = 0; i < YOU; i += 1) said.push(speak(tests[i], said));
    lab.querySelectorAll('[data-lab-reply]').forEach((reply) => { reply.hidden = true; });
    draw(false);
  }

  const actions = {
    say(button) {
      said[YOU] = button.dataset.labSay === 'yes';
      for (let i = YOU + 1; i < PEOPLE; i += 1) said[i] = speak(tests[i], said.slice(0, i));
      draw(true);
      lab.querySelector(`[data-lab-reply="${button.dataset.labSay}"]`).hidden = false;
      lab.querySelector('[data-lab-said]').textContent = yeses(said);
      lab.querySelector('[data-lab-tests]').textContent = yeses(tests);
      const wrong = (copying) => Array.from({ length: RUNS }, () => majorityWrong(copying)).filter(Boolean).length;
      lab.querySelector('[data-lab-copying]').textContent = wrong(true);
      lab.querySelector('[data-lab-reporting]').textContent = wrong(false);
      showStep('result');
    },
    restart() {
      reset();
      showStep('say');
    },
  };
  lab.addEventListener('click', (e) => {
    const action = e.target.closest('[data-lab-action]');
    if (action) actions[action.dataset.labAction](action);
  });

  reset();
});

// Special pleading exercise.
// A made-up psychic keeps failing tests. Each excuse the visitor picks rules
// out the kind of test that just failed, until nothing could count against
// her. The copy lives in content/toolkit.md.
document.querySelectorAll('[data-fallacy-lab="special-pleading"]').forEach((lab) => {
  const slips = [...lab.querySelectorAll('[data-lab-slip]')];
  const rounds = [...lab.querySelectorAll('[data-lab-step^="round-"]')];
  const score = lab.querySelector('[data-lab-score]');
  let round = 0;

  function tally() {
    const left = slips.filter((slip) => !slip.classList.contains('is-ruled-out')).length;
    score.textContent = left
      ? `Tests that could still prove her wrong: ${left} of ${slips.length}`
      : `Tests that could still prove her wrong: 0 of ${slips.length}. Nothing can count against her now.`;
  }

  function showStep(name, focus = true) {
    lab.querySelectorAll('[data-lab-step]').forEach((el) => { el.hidden = el.dataset.labStep !== name; });
    if (focus) lab.querySelector(`[data-lab-step="${name}"] button`).focus({ preventScroll: true });
  }

  function reset(focus) {
    round = 0;
    slips.forEach((slip) => {
      slip.classList.remove('is-ruled-out');
      slip.querySelector('.visually-hidden')?.remove();
    });
    lab.querySelectorAll('[data-lab-reply]').forEach((reply) => { reply.hidden = true; });
    tally();
    showStep(rounds[0].dataset.labStep, focus);
  }

  const actions = {
    excuse() {
      rounds[round].dataset.labRulesOut.split(' ').forEach((name) => {
        const slip = lab.querySelector(`[data-lab-slip="${name}"]`);
        slip.classList.add('is-ruled-out');
        const note = document.createElement('span');
        note.className = 'visually-hidden';
        note.textContent = ' (ruled out)';
        slip.append(note);
      });
      tally();
      round += 1;
      showStep(round < rounds.length ? rounds[round].dataset.labStep : 'verdict');
    },
    verdict(button) {
      lab.querySelector(`[data-lab-reply="${button.dataset.labVerdict}"]`).hidden = false;
      showStep('result');
    },
    restart() {
      reset(true);
    },
  };
  lab.addEventListener('click', (e) => {
    const action = e.target.closest('[data-lab-action]');
    if (action) actions[action.dataset.labAction](action);
  });

  reset(false);
});

// Anecdotal evidence exercise.
// A bracelet that does nothing gets glowing reviews, because buyers whose back
// pain eased by itself are far likelier to write in. The visitor guesses how
// many buyers felt better, then sees all 100 and who wrote. The copy lives in
// content/toolkit.md.
document.querySelectorAll('[data-fallacy-lab="anecdotal-evidence"]').forEach((lab) => {
  const BUYERS = 100;
  const COLUMNS = 10;
  const CELL = 40;
  const BETTER_ODDS = 1 / 3;
  const WRITES_IF_BETTER = 0.3;
  const WRITES_IF_NOT = 0.02;
  const SHOWN = 6;
  const NAMES = ['Maria', 'Dev', 'Linda', 'Tom', 'Aisha', 'Greg', 'Rosa', 'Sam', 'Paul', 'Mei', 'Joan', 'Luis', 'Pat', 'Nadia'];
  const PRAISE = [
    'Two weeks in and my back feels like new. Wish I’d found this years ago!',
    'I was skeptical, but it really works. I can garden again.',
    'Finally slept through the night without back pain.',
    'Bought one for my husband too. Life-changing.',
    'My chiropractor asked what I’d changed!',
    'Pain gone within a month. Five stars.',
    'Best purchase I’ve made all year.',
    'I can pick up my grandkids again. Thank you!',
  ];
  const GRUMBLE = ['Didn’t notice any difference.', 'Nice looking, but my back still hurts.'];

  const reviews = lab.querySelector('[data-lab-reviews]');
  const people = lab.querySelector('[data-lab-people]');
  const guess = lab.querySelector('#anecdote-guess');
  const guessOut = lab.querySelector('[data-lab-guess]');
  const score = lab.querySelector('[data-lab-score]');
  const svg = svgEl('svg', { viewBox: `0 0 ${COLUMNS * CELL} ${(BUYERS / COLUMNS) * CELL}`, role: 'img' });
  people.append(svg);
  let buyers = [];

  const shuffle = (list) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Redraw until there are enough glowing reviews to fill the wall.
  function sell() {
    let all;
    do {
      all = Array.from({ length: BUYERS }, () => {
        const better = Math.random() < BETTER_ODDS;
        return { better, wrote: Math.random() < (better ? WRITES_IF_BETTER : WRITES_IF_NOT) };
      });
    } while (all.filter((b) => b.better && b.wrote).length < 4);
    return all;
  }

  function wall() {
    const names = shuffle(NAMES);
    const praise = shuffle(PRAISE);
    const grumble = shuffle(GRUMBLE);
    const happy = buyers.filter((b) => b.wrote && b.better).length;
    const unhappy = buyers.filter((b) => b.wrote && !b.better).length;
    const cards = [
      ...Array.from({ length: Math.min(happy, SHOWN) }, (_, i) => ({ stars: 5, text: praise[i % praise.length] })),
      ...Array.from({ length: Math.min(unhappy, GRUMBLE.length) }, (_, i) => ({ stars: 2, text: grumble[i] })),
    ];
    reviews.replaceChildren(...shuffle(cards).map((card, i) => {
      const item = document.createElement('li');
      const stars = document.createElement('span');
      stars.className = 'fallacy-lab-stars';
      stars.textContent = '★'.repeat(card.stars) + '☆'.repeat(5 - card.stars);
      stars.setAttribute('aria-label', `${card.stars} of 5 stars`);
      const text = document.createElement('span');
      text.textContent = `“${card.text}”`;
      const who = document.createElement('span');
      who.className = 'fallacy-lab-reviewer';
      who.textContent = `— ${names[i % names.length]}`;
      item.append(stars, text, who);
      return item;
    }));
  }

  function crowd() {
    svg.replaceChildren(...buyers.flatMap((buyer, i) => {
      const x = (i % COLUMNS) * CELL + CELL / 2;
      const y = Math.floor(i / COLUMNS) * CELL + CELL / 2 + 2;
      const parts = [labFace(x, y, i, buyer.better)];
      if (buyer.wrote) {
        parts.push(svgEl('path', { class: 'fallacy-lab-bubble', d: `M${x + 7} ${y - 19} h13 a3 3 0 0 1 3 3 v6 a3 3 0 0 1 -3 3 h-7 l-4 4 v-4 h-2 a3 3 0 0 1 -3 -3 v-6 a3 3 0 0 1 3 -3 z` }));
      }
      return parts;
    }));
  }

  function showStep(name) {
    lab.querySelectorAll('[data-lab-step]').forEach((el) => { el.hidden = el.dataset.labStep !== name; });
    lab.querySelector(`[data-lab-step="${name}"] button`).focus({ preventScroll: true });
  }

  function reset() {
    buyers = sell();
    wall();
    people.hidden = true;
    score.textContent = '';
  }

  guess.addEventListener('input', () => { guessOut.textContent = guess.value; });

  const actions = {
    reveal() {
      const better = buyers.filter((b) => b.better).length;
      const wrote = buyers.filter((b) => b.wrote).length;
      const happyWrote = buyers.filter((b) => b.wrote && b.better).length;
      crowd();
      svg.setAttribute('aria-label', `100 buyers: ${better} felt better and ${BUYERS - better} didn't. ${wrote} wrote a review, ${happyWrote} of them from people who felt better.`);
      people.hidden = false;
      lab.querySelector('[data-lab-guessed]').textContent = guess.value;
      lab.querySelector('[data-lab-better]').textContent = better;
      lab.querySelector('[data-lab-wrote]').textContent = wrote;
      score.textContent = `${happyWrote} of ${wrote} reviews came from people who felt better`;
      showStep('result');
    },
    restart() {
      reset();
      showStep('guess');
    },
  };
  lab.addEventListener('click', (e) => {
    const action = e.target.closest('[data-lab-action]');
    if (action) actions[action.dataset.labAction]();
  });

  reset();
});

// ===== Toolkit activities =====
// Each entry's Try it and Watch buttons open one panel at a time. The buttons
// stay hidden without JavaScript, where a <noscript> link replaces them.
document.querySelectorAll('[data-toolkit-activities]').forEach((activities) => {
  const row = activities.querySelector('.toolkit-activity-buttons');
  const buttons = [...row.querySelectorAll('button')];

  function setOpen(button, open) {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const closing = !open && !panel.hidden;
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    // A hidden iframe keeps running, so narration would carry on out of sight.
    // Reloading the frame stops it.
    const frame = panel.querySelector('iframe');
    if (closing && frame) frame.src = frame.src;
  }

  row.addEventListener('click', (e) => {
    const clicked = e.target.closest('button');
    if (!clicked) return;
    const opening = clicked.getAttribute('aria-expanded') !== 'true';
    buttons.forEach((button) => setOpen(button, button === clicked && opening));
  });

  row.hidden = false;
});

// ===== Toolkit contents scrollspy + mobile jump bar =====
// Marks the part and entry currently being read in the toolkit's contents:
// the sticky rail on wide screens, and on smaller screens a jump bar that
// sticks under the header once the contents card has scrolled away, names
// the current part, and opens the contents as a dropdown. The "current"
// heading is the last one that has scrolled past a line a little below the
// sticky header.
(function () {
  const nav = document.querySelector('.toolkit-contents');
  if (!nav) return;
  const bar = document.getElementById('toolkit-jumpbar');
  const toggle = bar && bar.querySelector('.toolkit-jumpbar-toggle');
  const panel = bar && document.getElementById('toolkit-jump-panel');
  const currentLabel = bar && bar.querySelector('.toolkit-jumpbar-current');
  const siteHeader = document.querySelector('header');

  // Each heading id → its link in the rail, and in the jump panel.
  const linkSets = [nav, panel].filter(Boolean).map((root) => new Map(
    [...root.querySelectorAll('a[href^="#"]')].map((a) => [decodeURIComponent(a.hash.slice(1)), a])
  ));
  const railLinks = linkSets[0];
  const headings = [...document.querySelectorAll('.article-prose :is(h2, h3)[id]')].filter((h) => railLinks.has(h.id));
  if (!headings.length) return;

  if (bar) bar.hidden = false; // shown/hidden from here on by .is-shown

  function headerHeight() {
    return siteHeader ? siteHeader.getBoundingClientRect().height : 0;
  }

  let current = [];
  function update() {
    const line = headerHeight() + 80;
    let active = null;
    for (const h of headings) {
      if (h.getBoundingClientRect().top - line <= 0) active = h;
      else break;
    }
    const groupHeading = active && (active.tagName === 'H2' ? active : active.closest('.toolkit-group')?.querySelector('h2'));
    const ids = [groupHeading, active && active.tagName === 'H3' ? active : null].filter(Boolean).map((h) => h.id);
    const next = linkSets.flatMap((links) => ids.map((id) => links.get(id)).filter(Boolean));

    if (bar) {
      bar.style.top = headerHeight() + 'px';
      // Show once the contents card is out of view; hide again near the top.
      const pastContents = nav.getBoundingClientRect().bottom < headerHeight();
      bar.classList.toggle('is-shown', pastContents);
      if (!pastContents) closePanel(false);
      if (currentLabel) currentLabel.textContent = groupHeading ? groupHeading.textContent : '';
    }

    if (next.length === current.length && next.every((a, i) => a === current[i])) return;
    current.forEach((a) => { a.classList.remove('is-current'); a.removeAttribute('aria-current'); });
    next.forEach((a) => { a.classList.add('is-current'); a.setAttribute('aria-current', 'location'); });
    current = next;
    // Keep the highlighted entry visible inside the rail when it scrolls.
    const entry = ids.length && railLinks.get(ids[ids.length - 1]);
    if (entry && nav.scrollHeight > nav.clientHeight) {
      const top = entry.getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop;
      if (top < nav.scrollTop || top > nav.scrollTop + nav.clientHeight - 40) {
        nav.scrollTop = top - nav.clientHeight / 3;
      }
    }
  }

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    // Open scrolled to where the reader is.
    const marks = panel.querySelectorAll('a.is-current');
    const here = marks[marks.length - 1];
    if (here) {
      panel.scrollTop += here.getBoundingClientRect().top - panel.getBoundingClientRect().top - panel.clientHeight / 3;
    }
  }
  function closePanel(returnFocus) {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }

  if (bar && toggle && panel) {
    toggle.addEventListener('click', () => (panel.hidden ? openPanel() : closePanel(false)));
    // Picking a section jumps there and folds the panel away.
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) closePanel(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(true); });
    document.addEventListener('click', (e) => { if (!bar.contains(e.target)) closePanel(false); });
  }

  let queued = false;
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}());

// ===== Back to top =====
// "Back to top" links (end of posts and the toolkit, and the toolkit's
// mobile jump panel) scroll to the very top, then move keyboard focus to the
// page's main heading so the next Tab continues from there, not from the
// link left behind at the bottom.
(function () {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-back-to-top]');
    if (!link) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    const heading = document.querySelector('main h1');
    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  });
}());

// ===== Spot the Fallacy quiz (/toolkit/quiz) =====
(function () {
  const game = document.getElementById('quiz-game');
  const dataEl = document.getElementById('quiz-data');
  if (!game || !dataEl) return;

  const { options, cases } = JSON.parse(dataEl.textContent);
  const fallback = document.getElementById('quiz-fallback');
  const status = document.getElementById('quiz-status');
  const optionById = new Map(options.map((option) => [option.id, option]));

  const SOUND = 'sound';
  // src/lib/quiz.js checks the content can fill a round of this shape.
  const SOUND_PER_ROUND = 2;
  const FALLACIES_PER_ROUND = 8;
  const ROUND_SIZE = SOUND_PER_ROUND + FALLACIES_PER_ROUND;
  const BEST_KEY = 'glass-quiz-best';
  const TURN_MS = 170;

  const RANKS = [
    { min: 10, title: 'Fully calibrated', note: 'A perfect file. Now try catching one in your own thinking.' },
    { min: 8, title: 'Sharp-eyed skeptic', note: 'Very little got past you.' },
    { min: 5, title: 'Good instincts', note: 'You can tell when something sounds off. Naming it takes practice.' },
    { min: 0, title: 'Case still open', note: 'These are hard, and the near-misses are close on purpose. Every skeptic starts here.' },
  ];

  let round = [];
  let index = 0;
  let score = 0;
  let missed = [];

  function shuffle(list) {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Two sound cases, then one case each from eight different fallacies.
  function dealRound() {
    const shuffled = shuffle(cases);
    const sound = shuffled.filter((c) => c.answer === SOUND).slice(0, SOUND_PER_ROUND);
    const usedFallacies = new Set();
    const fallacies = shuffled.filter((c) => {
      if (c.answer === SOUND || usedFallacies.has(c.answer)) return false;
      usedFallacies.add(c.answer);
      return true;
    }).slice(0, FALLACIES_PER_ROUND);
    return shuffle([...sound, ...fallacies]);
  }

  // "Holds up" is always last, so its position gives nothing away.
  function choicesFor(quizCase) {
    const fallacies = [...quizCase.distractors];
    if (quizCase.answer !== SOUND) fallacies.push(quizCase.answer);
    return [...shuffle(fallacies), SOUND];
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function readBest() {
    try {
      const best = Number(localStorage.getItem(BEST_KEY));
      return Number.isInteger(best) && best > 0 ? best : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBest(best) {
    try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) { /* storage unavailable */ }
  }

  function newCard() {
    const card = el('section', 'quiz-card');
    // A slightly different tilt per card, like a stack of real ones.
    card.style.setProperty('--card-tilt', `${(Math.random() * 1.6 - 0.8).toFixed(2)}deg`);
    card.style.setProperty('--tape-tilt', `${(Math.random() * 6 - 3).toFixed(1)}deg`);
    const tape = el('span', 'quiz-tape');
    tape.setAttribute('aria-hidden', 'true');
    card.appendChild(tape);
    return card;
  }

  function cardHeader(card) {
    const header = el('div', 'quiz-card-header');
    header.append(
      el('p', 'quiz-count', `Case ${index + 1} of ${ROUND_SIZE}`),
      el('p', 'quiz-tally', `${score} correct`)
    );
    card.appendChild(header);
  }

  function showCard(card, focusTarget) {
    game.replaceChildren(card);
    if (focusTarget) {
      if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({ preventScroll: true });
    }
    card.scrollIntoView({ block: 'nearest' });
  }

  // Turns the card over, swapping its face at the halfway point. With reduced
  // motion the swap just happens.
  function turnTo(card, focusTarget) {
    const current = game.firstElementChild;
    if (!current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showCard(card, focusTarget);
      return;
    }
    current.classList.add('quiz-card--turn-out');
    window.setTimeout(() => {
      card.classList.add('quiz-card--turn-in');
      showCard(card, focusTarget);
    }, TURN_MS);
  }

  function renderQuestion(moveFocus) {
    const quizCase = round[index];
    const card = newCard();
    cardHeader(card);

    const scenario = el('p', 'quiz-scenario', quizCase.scenario);
    card.appendChild(scenario);

    const form = el('form', 'quiz-form');
    const fieldset = el('fieldset');
    fieldset.appendChild(el('legend', '', "What's going on here?"));
    const submit = el('button', 'quiz-btn', 'Check my answer');
    submit.type = 'submit';
    submit.disabled = true;

    choicesFor(quizCase).forEach((id) => {
      const label = el('label', 'quiz-option');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'quiz-choice';
      input.value = id;
      // Labels are escaped HTML from the toolkit's rendered headings.
      const text = el('span');
      text.innerHTML = optionById.get(id).label;
      label.append(input, text);
      fieldset.appendChild(label);
    });

    // Submitted by button, not on change: arrow keys change a radio group's
    // selection, so answering on change would lock in the first keypress.
    fieldset.addEventListener('change', () => { submit.disabled = false; });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const choice = form.querySelector('input:checked');
      if (choice) renderAnswer(quizCase, choice.value);
    });
    form.append(fieldset, submit);
    card.appendChild(form);

    if (moveFocus) turnTo(card, scenario);
    else showCard(card);
  }

  function renderAnswer(quizCase, choice) {
    const correct = choice === quizCase.answer;
    if (correct) score += 1;
    else missed.push(quizCase.answer);

    const answer = optionById.get(quizCase.answer);
    const card = newCard();
    card.classList.add('quiz-card--back');
    cardHeader(card);

    const verdict = el('h2', `quiz-verdict quiz-verdict--${correct ? 'right' : 'wrong'}`);
    const mark = el('span', 'quiz-verdict-mark', correct ? '✓' : '✗');
    mark.setAttribute('aria-hidden', 'true');
    verdict.append(mark, correct ? ' Correct' : ' Not quite');
    card.appendChild(verdict);

    const answerLine = el('p', 'quiz-answer');
    answerLine.innerHTML = answer.label;
    card.append(answerLine, el('p', 'quiz-why', quizCase.why));

    if (!correct) {
      const wrong = el('div', 'quiz-not-why');
      const heading = el('p', 'quiz-not-why-label');
      heading.innerHTML = `Why not &ldquo;${optionById.get(choice).label}&rdquo;?`;
      wrong.append(heading, el('p', '', quizCase.notWhy[choice]));
      card.appendChild(wrong);
    }

    const actions = el('div', 'quiz-actions');
    const last = index === round.length - 1;
    const next = el('button', 'quiz-btn', last ? 'See my score' : 'Next case');
    next.type = 'button';
    next.addEventListener('click', () => {
      if (last) {
        renderResults();
      } else {
        index += 1;
        renderQuestion(true);
      }
    });
    actions.append(next, toolkitLink(answer, 'Read more in the toolkit'));
    card.appendChild(actions);

    turnTo(card, verdict);
  }

  // Opens in a new tab so following the link doesn't lose the round.
  function toolkitLink(option, text) {
    const link = el('a', 'quiz-link', text);
    link.href = option.href;
    link.target = '_blank';
    link.rel = 'noopener';
    link.appendChild(el('span', 'visually-hidden', ' (opens in a new tab)'));
    return link;
  }

  function renderResults() {
    const rank = RANKS.find((r) => score >= r.min);
    const previousBest = readBest();
    const isNewBest = score > previousBest;
    if (isNewBest) saveBest(score);

    const card = newCard();
    card.classList.add('quiz-card--results');

    const heading = el('h2', 'quiz-results-title', 'Case closed');
    const stamp = el('p', 'quiz-stamp');
    stamp.append(el('span', 'quiz-stamp-score', `${score} / ${ROUND_SIZE}`), el('span', 'quiz-stamp-rank', rank.title));
    card.append(heading, stamp, el('p', 'quiz-results-note', rank.note));

    if (isNewBest && previousBest > 0) {
      card.appendChild(el('p', 'quiz-best', `New personal best! Your old best was ${previousBest} / ${ROUND_SIZE}.`));
    } else if (!isNewBest && previousBest > 0) {
      card.appendChild(el('p', 'quiz-best', `Your best so far: ${previousBest} / ${ROUND_SIZE}.`));
    }

    if (missed.length) {
      card.appendChild(el('h3', 'quiz-brush-up-title', 'Brush up on'));
      const list = el('ul', 'quiz-brush-up');
      [...new Set(missed)].forEach((id) => {
        const option = optionById.get(id);
        const item = el('li');
        const link = toolkitLink(option, '');
        link.insertAdjacentHTML('afterbegin', option.label);
        item.appendChild(link);
        list.appendChild(item);
      });
      card.appendChild(list);
    }

    const actions = el('div', 'quiz-actions');
    const again = el('button', 'quiz-btn', 'Play again');
    again.type = 'button';
    again.addEventListener('click', () => {
      status.textContent = '';
      startRound(true);
    });
    const share = el('button', 'quiz-btn quiz-btn--quiet', 'Copy my score');
    share.type = 'button';
    share.addEventListener('click', async () => {
      const text = `I scored ${score}/${ROUND_SIZE} on the GLASS Spot the Fallacy quiz. ${location.origin}/toolkit/quiz`;
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = 'Score copied.';
      } catch (e) {
        status.textContent = text;
      }
    });
    actions.append(again, share);
    card.appendChild(actions);

    turnTo(card, heading);
  }

  function startRound(moveFocus) {
    round = dealRound();
    index = 0;
    score = 0;
    missed = [];
    renderQuestion(moveFocus);
  }

  fallback.remove();
  game.hidden = false;
  startRound(false);
}());
