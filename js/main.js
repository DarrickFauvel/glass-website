// GLASS website — main.js

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

  // Close when a nav link or the logo is clicked
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
  document.querySelector('.header-logo').addEventListener('click', closeMenu);

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
  const navLinks = document.querySelectorAll('#primary-nav a[href^="#"]');
  const sectionIds = Array.from(navLinks).map((a) => a.getAttribute('href').slice(1));
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  function setActive(id) {
    navLinks.forEach((a) => {
      a.classList.toggle('nav-active', a.getAttribute('href') === '#' + id);
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

    if (typeof hcaptcha !== 'undefined' && !hcaptcha.getResponse()) {
      status.textContent = 'Please complete the CAPTCHA.';
      status.className = 'form-status form-status--error';
      status.hidden = false;
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
        if (typeof hcaptcha !== 'undefined') hcaptcha.reset();
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

// ===== Header Sheen =====
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sheenEl = document.querySelector('.header-sheen');
  const headerEl = document.querySelector('header');
  if (!sheenEl || !headerEl) return;

  function syncHeight() {
    sheenEl.style.height = headerEl.getBoundingClientRect().height + 'px';
  }
  syncHeight();
  window.addEventListener('resize', syncHeight, { passive: true });

  function triggerSheen() {
    sheenEl.classList.remove('sheen');
    void sheenEl.offsetWidth;
    sheenEl.classList.add('sheen');
    setTimeout(() => sheenEl.classList.remove('sheen'), 800);
  }

  setTimeout(triggerSheen, 2000);
  headerEl.addEventListener('mouseenter', triggerSheen);
}());

// ===== Card Border Spotlight =====
(function () {
  document.querySelectorAll('.join-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '-50%');
    });
  });
}());

// ===== Button Ripple =====
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.hero-btn, .join-card-btn, .form-submit').forEach((btn) => {
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
      const url = window.location.href;
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

  const SCALE     = 1.55;
  const LENS_R    = 45;
  const ATTRACT_R = 200;

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
        belief: 'Many believe Bigfoot is an undiscovered great ape roaming remote North American forests, supported by alleged footprints and blurry footage like the Patterson–Gimlin film.',
        question: 'If a large primate exists in North America, why has no confirmed physical evidence — bones, tissue, or definitive DNA — ever been recovered despite millions of acres under constant surveillance by hunters and cameras?',
      },
      {
        text: 'chemtrails?',
        belief: 'Some believe the white trails left by aircraft are chemical or biological agents deliberately sprayed by governments for population control, weather manipulation, or mass sedation.',
        question: 'Contrails are well-understood water vapor condensation. How would a program requiring the silence of hundreds of thousands of pilots, engineers, and ground crews across competing nations remain secret?',
      },
      {
        text: 'GMOs?',
        belief: 'Some believe genetically modified organisms pose unique dangers to human health, biodiversity, and ecosystems, and that safety data is suppressed by corporations.',
        question: 'Over 2,000 peer-reviewed studies and scientific consensus from WHO, NAS, and the EU find no evidence of GMO-specific health risks. What specific biological mechanism would make a gene-edited crop inherently harmful?',
      },
      {
        text: 'psychics?',
        belief: 'Many believe certain individuals possess extrasensory abilities — reading minds, predicting futures, or communicating with the deceased — often demonstrated in readings.',
        question: 'The JREF offered $1 million for demonstrated psychic ability under controlled conditions for over a decade. No one claimed it. Why do psychic powers vanish when double-blind testing eliminates cold reading and confirmation bias?',
      },
      {
        text: 'ufo?',
        belief: 'Many believe unidentified aerial phenomena are evidence of extraterrestrial spacecraft visiting Earth, sometimes citing government cover-ups of recovered craft and bodies.',
        question: '"We don\'t know what this is" is a legitimate scientific position — but what specific evidence distinguishes an unexplained atmospheric phenomenon from an alien spacecraft?',
      },
      {
        text: 'astrology?',
        belief: 'Millions believe the positions of celestial bodies at birth shape personality, compatibility, and destiny through the twelve zodiac signs.',
        question: 'Controlled studies find no correlation between birth date and personality traits. If astrology is valid, why do identical twins — born minutes apart under the same sky — often lead strikingly different lives?',
      },
      {
        text: 'spirits?',
        belief: 'Many cultures believe spirits of the deceased can interact with the living, haunt locations, or communicate through mediums and séances.',
        question: 'In controlled studies, mediums perform at chance level when verifiable specifics are required. What physical mechanism allows a non-corporeal entity to move objects, affect EMF readings, or produce sound?',
      },
      {
        text: 'aliens?',
        belief: 'Some believe extraterrestrial beings have visited Earth, made contact with governments, and that evidence is actively suppressed at the highest levels.',
        question: 'The universe almost certainly harbors other life — but what testable, reproducible evidence supports the claim that intelligent aliens have specifically visited Earth rather than any of the billions of other planets?',
      },
      {
        text: 'ghosts?',
        belief: 'Many believe ghosts are spirits of the deceased that linger in the physical world, detectable by temperature drops, EVP recordings, or visual apparitions.',
        question: 'EMF detectors measure electromagnetic fields from electrical appliances — they were never designed for spirit detection. What peer-reviewed evidence links EMF fluctuations to anything other than wiring and electronics?',
      },
      {
        text: 'flat earth?',
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
        </div>
        <div class="secrets-modal-tape" aria-hidden="true"></div>
      </div>`;
    document.body.appendChild(sModal);

    const sClose    = sModal.querySelector('.secrets-modal-close');
    const sBackdrop = sModal.querySelector('.secrets-modal-backdrop');
    const sTitle    = sModal.querySelector('#secrets-modal-title');
    const sBelief   = sModal.querySelector('#secrets-belief');
    const sQuestion = sModal.querySelector('#secrets-question');

    openSecretModal = function (clue) {
      sTitle.textContent    = clue.text;
      sBelief.textContent   = clue.belief;
      sQuestion.textContent = clue.question;
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
  }

  // Build magnifier layer from cloned hero content

  const mag = document.createElement('div');
  mag.className = 'hero-mag';
  mag.setAttribute('aria-hidden', 'true');
  const heroRect = hero.getBoundingClientRect();
  ['hero-bg-grid', 'hero-content', 'hero-secrets'].forEach(cls => {
    const el = hero.querySelector('.' + cls);
    if (!el) return;
    const clone = el.cloneNode(true);
    if (cls === 'hero-content') {
      // flex-positioned — pin to exact pixel location so it aligns with the original
      const r = el.getBoundingClientRect();
      clone.style.cssText = `position:absolute;left:${r.left - heroRect.left}px;top:${r.top - heroRect.top}px;width:${r.width}px;margin:0`;
    }
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
  hero.insertBefore(overlay, eyepiece);


  let targetX = REST.x, targetY = REST.y;
  let lensX   = REST.x, lensY   = REST.y;
  let rafId = null, following = false, attracting = false;
  let touchStartClientX = 0, touchStartClientY = 0;

  // Hide lens and overlay until intro sweep fires
  mag.style.opacity        = '0';
  mag.style.transition     = 'opacity 0.6s';
  overlay.style.opacity    = '0';
  overlay.style.transition = 'opacity 0.6s';

  // Intro sweep: appear at lower-left, glide to resting position
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lensX = REST.x;
    lensY = REST.y;
    mag.style.opacity     = '1';
    overlay.style.opacity = '1';
    applyLens(REST.x, REST.y);
  } else {
    setTimeout(() => {
      if (following || attracting) return;
      lensX = hero.offsetWidth  * 0.12;
      lensY = hero.offsetHeight * 0.78;
      applyLens(lensX, lensY);
      mag.style.opacity     = '1';
      overlay.style.opacity = '1';

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
  }

  function followTick() {
    lensX = lerp(lensX, targetX, 0.1);
    lensY = lerp(lensY, targetY, 0.1);
    applyLens(lensX, lensY);
    rafId = requestAnimationFrame(followTick);
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
    }
  }

  hero.addEventListener('mousemove', (e) => {
    const hr   = hero.getBoundingClientRect();
    const mx   = e.clientX - hr.left;
    const my   = e.clientY - hr.top;
    const dist = Math.hypot(mx - lensX, my - lensY);

    if (following) {
      targetX = mx;
      targetY = my;
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

    if (dist <= ATTRACT_R) {
      targetX = mx;
      targetY = my;
      if (!attracting) {
        attracting = true;
        cancelAnimationFrame(rafId);
        // Ensure lens is visible if intro hasn't fired yet
        if (mag.style.opacity !== '1') {
          mag.style.opacity     = '1';
          overlay.style.opacity = '1';
          applyLens(lensX, lensY);
        }
        rafId = requestAnimationFrame(attractTick);
      }
    } else if (attracting) {
      // Mouse drifted outside attraction zone — glide back to rest
      attracting = false;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(restoreTick);
    }
  });

  hero.addEventListener('mouseleave', () => {
    if (lensLocked) return;
    following  = false;
    attracting = false;
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
    touchStartClientX = touch.clientX;
    touchStartClientY = touch.clientY;
    attracting = false;
    following  = true;
    cancelAnimationFrame(rafId);
    rafId = null;

    // Ensure lens is visible if intro hasn't fired yet
    if (mag.style.opacity !== '1') {
      mag.style.opacity     = '1';
      overlay.style.opacity = '1';
    }
    lensX = tx;
    lensY = ty;
    applyLens(lensX, lensY);
  }, { passive: false });

  hero.addEventListener('touchmove', (e) => {
    if (!following) return;
    e.preventDefault();
    const hr    = hero.getBoundingClientRect();
    const touch = e.touches[0];
    lensX = touch.clientX - hr.left;
    lensY = touch.clientY - hr.top;
    applyLens(lensX, lensY);
  }, { passive: false });

  function onTouchEnd(e) {
    if (!following || lensLocked) return;
    following = false;
    cancelAnimationFrame(rafId);
    rafId = null;

    // Detect tap (minimal movement) and fire secret modal if one was hit
    const t = e.changedTouches[0];
    if (Math.hypot(t.clientX - touchStartClientX, t.clientY - touchStartClientY) < 10) {
      const el = document.elementFromPoint(t.clientX, t.clientY);
      if (el && el.classList.contains('hero-secret') && el.dataset.clue) {
        const clue = clues.find(c => c.text === el.dataset.clue);
        if (clue) openSecretModal(clue);
      }
    }
  }
  hero.addEventListener('touchend',    onTouchEnd);
  hero.addEventListener('touchcancel', onTouchEnd);

  window.addEventListener('resize', () => { orig = getOrigCenter(); }, { passive: true });
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

// ===== Upcoming 2nd-Wednesday meetup dates =====
(function () {
  function secondWednesday(year, month) {
    // month is 0-indexed
    const d = new Date(year, month, 1);
    const dayOfWeek = d.getDay();
    const firstWed = 1 + ((3 - dayOfWeek + 7) % 7);
    return new Date(year, month, firstWed + 7);
  }

  const list = document.getElementById('upcoming-dates');
  if (!list) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let shown = 0;
  let year = today.getFullYear();
  let month = today.getMonth();

  while (shown < 6) {
    const date = secondWednesday(year, month);
    if (date >= today) {
      const li = document.createElement('li');
      li.textContent = formatter.format(date);
      list.appendChild(li);
      shown++;
    }
    month++;
    if (month > 11) { month = 0; year++; }
  }
}());
