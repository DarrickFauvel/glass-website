// GLASS website — main.js

// ===== Scroll Reveal =====
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
