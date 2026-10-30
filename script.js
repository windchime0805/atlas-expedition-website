const filters = [...document.querySelectorAll('.filter-button')];
const cards = [...document.querySelectorAll('.expedition-card')];
const count = document.querySelector('.catalog-count');
const noResults = document.querySelector('.no-results');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    let visible = 0;
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    cards.forEach((card) => {
      const show = selected === 'all' || card.dataset.difficulty === selected;
      card.hidden = !show;
      if (show) visible += 1;
    });
    count.textContent = `${String(visible).padStart(2, '0')} ${visible === 1 ? 'journey' : 'journeys'}`;
    noResults.hidden = visible !== 0;
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('is-open', !expanded);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const form = document.querySelector('#inquiry-form');
const formMessage = document.querySelector('#form-message');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  formMessage.textContent = '';
  if (!form.reportValidity()) return;
  const name = form.elements.name.value.trim();
  formMessage.textContent = `Thanks, ${name}. Your inquiry is ready — this demo does not send it to a server.`;
  form.reset();
});
