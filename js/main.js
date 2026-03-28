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
