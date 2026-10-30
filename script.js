// Expedition catalog filters.
const filters = [...document.querySelectorAll('.filter-button')];
const expeditionCards = [...document.querySelectorAll('.expedition-card')];
const expeditionCount = document.querySelector('.catalog-count');
const expeditionEmpty = document.querySelector('.no-results');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    let visible = 0;
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    expeditionCards.forEach((card) => {
      const show = selected === 'all' || card.dataset.difficulty === selected;
      card.hidden = !show;
      if (show) visible += 1;
    });
    expeditionCount.textContent = `${String(visible).padStart(2, '0')} ${visible === 1 ? 'journey' : 'journeys'}`;
    expeditionEmpty.hidden = visible !== 0;
  });
});

// Responsive navigation and expedition-to-inquiry selection.
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
const closeMenu = () => {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
};

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('is-open', !expanded);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
window.addEventListener('resize', () => {
  if (window.matchMedia('(min-width: 1321px)').matches) closeMenu();
});

const expeditionSelect = document.querySelector('[name="expedition"]');
document.querySelectorAll('[data-expedition]').forEach((link) => {
  link.addEventListener('click', () => {
    expeditionSelect.value = link.dataset.expedition;
  });
});

const inquiryForm = document.querySelector('#inquiry-form');
const inquiryMessage = document.querySelector('#form-message');
inquiryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  inquiryMessage.textContent = '';
  const nameField = inquiryForm.elements.name;
  nameField.setCustomValidity(nameField.value.trim() ? '' : 'Please enter your name.');
  if (!inquiryForm.reportValidity()) return;
  inquiryMessage.textContent = `Thanks, ${nameField.value.trim()}. Your inquiry is ready. This demo does not send it to a server.`;
  inquiryForm.reset();
});

// Theme choices are saved locally and fall back to Atlas's forest palette.
const themeButtons = [...document.querySelectorAll('[data-theme-choice]')];
const savedTheme = localStorage.getItem('atlas-theme');
function setTheme(theme) {
  const selectedTheme = theme === 'night' ? 'night' : 'forest';
  document.body.dataset.theme = selectedTheme;
  themeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === selectedTheme)));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', selectedTheme === 'night' ? '#101714' : '#0b211c');
  localStorage.setItem('atlas-theme', selectedTheme);
}
themeButtons.forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.themeChoice)));
setTheme(savedTheme);

// Experiences are local to this browser. Sample stories appear until a visitor saves a note.
const EXPERIENCE_STORAGE_KEY = 'atlas-experiences-v1';
const sampleExperiences = [
  {
    destination: 'Khumbu Valley', author: 'Mira Chen', rating: 5, difficulty: 'Hard',
    reflection: 'At dawn, the trail turned gold and the whole valley seemed to pause with us. I still think about that quiet when the city gets loud.',
    feelings: ['Amazed', 'Accomplished'],
    photos: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=82',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    destination: 'Lofoten Islands', author: 'Elias Berg', rating: 4, difficulty: 'Moderate',
    reflection: 'A long walk above the sea, wind in every layer, and a late dinner with new friends. The light stayed with us long after sunset.',
    feelings: ['Peaceful', 'Excited'],
    photos: [
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1000&q=82',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    destination: 'Patagonia', author: 'Nia Williams', rating: 5, difficulty: 'Hard',
    reflection: 'The weather changed three times before lunch. We slowed down, watched clouds lift from the towers, and found our own rhythm.',
    feelings: ['Challenged', 'Amazed'],
    photos: [
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1000&q=82',
      'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

const isDisplayablePhoto = (src) => typeof src === 'string' && /^(https:\/\/|data:image\/(?:jpeg|png|webp|gif|avif);base64,)/i.test(src);

const experienceGrid = document.querySelector('#experience-grid');
const experienceEmpty = document.querySelector('#experience-empty');
const experienceForm = document.querySelector('#experience-form');
const experienceFileInput = document.querySelector('#experience-photos');
const photoPreviews = document.querySelector('#photo-previews');
const photoCount = document.querySelector('#photo-count');
const experienceMessage = document.querySelector('#experience-message');
const experienceGlobalMessage = document.querySelector('#experience-global-message');
const storyDialog = document.querySelector('#story-dialog');
const storyDialogContent = document.querySelector('#story-dialog-content');
let selectedPhotos = [];
let savedExperiences = [];

function readSavedExperiences() {
  try {
    const saved = JSON.parse(localStorage.getItem(EXPERIENCE_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved
      .filter((story) => story && typeof story.destination === 'string' && typeof story.reflection === 'string' && Array.isArray(story.photos))
      .map((story) => ({ ...story, photos: story.photos.filter(isDisplayablePhoto).slice(0, 3) })) : [];
  } catch {
    return [];
  }
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function openStory(story) {
  storyDialogContent.replaceChildren();
  const content = makeElement('div', 'story-dialog-content');
  const kicker = makeElement('p', 'eyebrow', `${story.author || 'Atlas traveler'} · ${story.difficulty || 'Field note'}`);
  const title = makeElement('h2', '', story.destination);
  title.id = 'story-dialog-title';
  const gallery = makeElement('div', 'story-dialog-gallery');
  (story.photos || []).slice(0, 3).forEach((src, index) => {
    if (!isDisplayablePhoto(src)) return;
    const image = document.createElement('img');
    image.src = src;
    image.alt = `${story.destination} story photograph ${index + 1}`;
    gallery.append(image);
  });
  const reflection = makeElement('p', '', story.reflection);
  const feelings = makeElement('p', '', (story.feelings || []).join(' · '));
  const rating = makeElement('p', 'experience-rating', `★ ${story.rating} / 5`);
  content.append(kicker, title);
  if (gallery.childElementCount) content.append(gallery);
  content.append(reflection);
  if (feelings.textContent) content.append(feelings);
  content.append(rating);
  storyDialogContent.append(content);
  storyDialog.showModal();
}

function renderExperiences() {
  const stories = savedExperiences.length ? savedExperiences : sampleExperiences;
  experienceGrid.replaceChildren();
  experienceEmpty.hidden = stories.length !== 0;
  stories.forEach((story) => {
    const card = makeElement('article', 'experience-card');
    const openButton = makeElement('button', 'experience-open');
    openButton.type = 'button';
    openButton.setAttribute('aria-label', `Read ${story.destination}, shared by ${story.author}`);
    const cover = makeElement('div', 'experience-cover');
    const image = document.createElement('img');
    const photos = story.photos.filter(isDisplayablePhoto).slice(0, 3);
    if (photos.length) {
      const image = document.createElement('img');
      image.src = photos[0];
      image.alt = `${story.destination} landscape`;
      image.loading = 'lazy';
      cover.append(image);
    } else {
      cover.classList.add('experience-cover-empty');
      cover.append(makeElement('span', 'experience-image-placeholder', 'ATLAS · FIELD NOTE'));
    }
    const photoCount = makeElement('span', 'experience-photo-count', `${photos.length} ${photos.length === 1 ? 'PHOTO' : 'PHOTOS'} · OPEN STORY ↗`);
    cover.append(photoCount);
    const body = makeElement('div', 'experience-card-body');
    const meta = makeElement('div', 'experience-card-meta');
    meta.append(makeElement('span', '', story.author), makeElement('span', '', story.difficulty || 'Field note'));
    const title = makeElement('h3', '', story.destination);
    const reflection = makeElement('p', 'experience-reflection', story.reflection);
    const footer = makeElement('div', 'experience-card-footer');
    footer.append(makeElement('span', '', `${(story.feelings || []).slice(0, 2).join(' · ') || 'A moment on the trail'}`));
    footer.append(makeElement('span', 'experience-rating', `★ ${story.rating} / 5`));
    body.append(meta, title, reflection, footer);
    openButton.append(cover, body);
    openButton.addEventListener('click', () => openStory(story));
    card.append(openButton);
    experienceGrid.append(card);
  });
}

function renderPhotoPreviews() {
  photoPreviews.replaceChildren();
  photoCount.textContent = `${selectedPhotos.length} of 3 ${selectedPhotos.length === 1 ? 'photo' : 'photos'} selected`;
  selectedPhotos.forEach((photo, index) => {
    const preview = makeElement('div', 'photo-preview');
    const image = document.createElement('img');
    image.src = photo.previewUrl;
    image.alt = `Selected photo ${index + 1}`;
    const remove = makeElement('button', '', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove selected photo ${index + 1}`);
    remove.addEventListener('click', () => {
      URL.revokeObjectURL(photo.previewUrl);
      selectedPhotos.splice(index, 1);
      renderPhotoPreviews();
    });
    preview.append(image, remove);
    photoPreviews.append(preview);
  });
}

document.querySelector('#open-experience-form').addEventListener('click', () => {
  experienceGlobalMessage.textContent = '';
  experienceForm.hidden = false;
  experienceForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  experienceForm.elements.destination.focus({ preventScroll: true });
});
document.querySelector('#close-experience-form').addEventListener('click', () => {
  experienceForm.hidden = true;
  experienceGlobalMessage.textContent = 'Field note form closed.';
});

experienceFileInput.addEventListener('change', () => {
  experienceMessage.textContent = '';
  const additions = [...experienceFileInput.files];
  if (selectedPhotos.length + additions.length > 3) {
    experienceMessage.textContent = 'Choose no more than three photos total. Remove a photo before adding another.';
    experienceFileInput.value = '';
    return;
  }
  const tooLarge = additions.some((file) => file.size > 800 * 1024);
  if (tooLarge) {
    experienceMessage.textContent = 'Each image must be 800 KB or smaller to fit local browser storage.';
    experienceFileInput.value = '';
    return;
  }
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  const nonImages = additions.some((file) => !supportedTypes.includes(file.type));
  if (nonImages) {
    experienceMessage.textContent = 'Please choose image files only.';
    experienceFileInput.value = '';
    return;
  }
  selectedPhotos.push(...additions.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })));
  experienceFileInput.value = '';
  renderPhotoPreviews();
});

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(new Error('A selected image could not be read.')));
    reader.readAsDataURL(file);
  });
}

experienceForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  experienceMessage.textContent = '';
  ['destination', 'author', 'reflection'].forEach((name) => {
    const field = experienceForm.elements[name];
    field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
  });
  if (!experienceForm.reportValidity()) return;
  if (selectedPhotos.length > 3) {
    experienceMessage.textContent = 'Remove photos until three or fewer remain.';
    return;
  }
  experienceMessage.textContent = 'Saving this field note in this browser…';
  try {
    const story = {
      id: Date.now(),
      destination: experienceForm.elements.destination.value.trim(),
      author: experienceForm.elements.author.value.trim(),
      reflection: experienceForm.elements.reflection.value.trim(),
      feelings: [...experienceForm.querySelectorAll('input[name="feeling"]:checked')].map((input) => input.value),
      difficulty: experienceForm.elements.difficulty.value,
      rating: Number(experienceForm.elements.rating.value),
      photos: await Promise.all(selectedPhotos.map(({ file }) => fileToDataUrl(file))),
    };
    const nextStories = [...savedExperiences, story];
    localStorage.setItem(EXPERIENCE_STORAGE_KEY, JSON.stringify(nextStories));
    savedExperiences = nextStories;
    selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    selectedPhotos = [];
    experienceForm.reset();
    renderPhotoPreviews();
    renderExperiences();
    experienceForm.hidden = true;
    experienceMessage.textContent = '';
    experienceGlobalMessage.textContent = 'Field note saved in this browser only. It has not been shared publicly.';
  } catch {
    experienceMessage.textContent = 'This browser could not save the field note. Try fewer or smaller photos, or clear some browser storage.';
  }
});

savedExperiences = readSavedExperiences();
renderExperiences();

// Destination discovery and local group-proposal prototype.
const destinationCards = [...document.querySelectorAll('.destination-card')];
const destinationDifficulty = document.querySelector('#destination-difficulty');
const destinationActivity = document.querySelector('#destination-activity');
const destinationCount = document.querySelector('#destination-count');
const destinationEmpty = document.querySelector('#destination-empty');

function filterDestinations() {
  let visible = 0;
  destinationCards.forEach((card) => {
    const difficultyMatches = destinationDifficulty.value === 'all' || card.dataset.difficulty === destinationDifficulty.value;
    const activities = card.dataset.activities.split(',').map((activity) => activity.trim());
    const activityMatches = destinationActivity.value === 'all' || activities.includes(destinationActivity.value);
    card.hidden = !(difficultyMatches && activityMatches);
    if (!card.hidden) visible += 1;
  });
  destinationCount.textContent = `${visible} ${visible === 1 ? 'destination' : 'destinations'}`;
  destinationEmpty.hidden = visible > 0;
}
destinationDifficulty.addEventListener('change', filterDestinations);
destinationActivity.addEventListener('change', filterDestinations);

const destinationDialog = document.querySelector('#destination-dialog');
const destinationDialogContent = document.querySelector('#destination-dialog-content');
document.querySelector('#close-destination-dialog').addEventListener('click', () => destinationDialog.close());
destinationCards.forEach((card) => {
  card.querySelector('.destination-view').addEventListener('click', () => {
    const title = card.querySelector('h4').textContent;
    const place = card.querySelector('.eyebrow').textContent;
    const image = document.createElement('img');
    image.src = card.querySelector('img').src;
    image.alt = card.querySelector('img').alt;
    const kicker = makeElement('p', 'eyebrow', place);
    const heading = makeElement('h2', '', title);
    heading.id = 'destination-dialog-title';
    const facts = makeElement('p', '', [...card.querySelectorAll('.destination-facts span')].map((item) => item.textContent).join(' · '));
    const detail = makeElement('p', '', 'A field-ready destination chosen for its remarkable terrain, thoughtful access, and changing conditions. Plan with local guidance and check seasonal conditions before travel.');
    destinationDialogContent.replaceChildren(image, kicker, heading, facts, detail);
    destinationDialog.showModal();
  });
});

const groupGrid = document.querySelector('#group-grid');
const groupDestination = document.querySelector('#group-destination');
const groupDifficulty = document.querySelector('#group-difficulty');
const groupCount = document.querySelector('#group-count');
const groupEmpty = document.querySelector('#group-empty');

function filterGroups() {
  const groups = [...groupGrid.querySelectorAll('.group-card')];
  let visible = 0;
  groups.forEach((card) => {
    const destinationMatches = groupDestination.value === 'all' || card.dataset.place === groupDestination.value;
    const difficultyMatches = groupDifficulty.value === 'all' || card.dataset.difficulty === groupDifficulty.value;
    card.hidden = !(destinationMatches && difficultyMatches);
    if (!card.hidden) visible += 1;
  });
  groupCount.textContent = `${visible} ${visible === 1 ? 'group' : 'groups'} · illustrative`;
  groupEmpty.hidden = visible > 0;
}
groupDestination.addEventListener('change', filterGroups);
groupDifficulty.addEventListener('change', filterGroups);

document.querySelectorAll('.find-people').forEach((button) => {
  button.addEventListener('click', () => {
    groupDestination.value = button.dataset.place;
    filterGroups();
    document.querySelector('#group-expeditions').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

function addJoinInteraction(card) {
  card.querySelector('.join-group').addEventListener('click', () => {
    card.querySelector('.group-message').textContent = 'Prototype only: no request was sent to an organizer.';
  });
}
groupGrid.querySelectorAll('.group-card').forEach(addJoinInteraction);

const proposalForm = document.querySelector('#proposal-form');
const proposalMessage = document.querySelector('#proposal-message');
proposalForm.addEventListener('submit', (event) => {
  event.preventDefault();
  proposalMessage.textContent = '';
  ['title', 'host', 'destination', 'meeting'].forEach((name) => {
    const field = proposalForm.elements[name];
    field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
  });
  const capacityField = proposalForm.elements.capacity;
  const capacity = Number(capacityField.value);
  capacityField.setCustomValidity(Number.isInteger(capacity) && capacity >= 2 && capacity <= 12 ? '' : 'Choose a whole group capacity from 2 to 12.');
  if (!proposalForm.reportValidity()) return;
  const destination = proposalForm.elements.destination.value.trim();
  const difficulty = proposalForm.elements.difficulty.value;
  const card = makeElement('article', 'group-card');
  card.dataset.place = destination;
  card.dataset.difficulty = difficulty;
  const top = makeElement('div', 'group-topline');
  top.append(makeElement('span', 'group-status', 'Session proposal'), makeElement('span', `difficulty difficulty-${difficulty.toLowerCase()}`, difficulty));
  const title = makeElement('h4', '', proposalForm.elements.title.value.trim());
  const host = makeElement('p', 'group-host', `Proposed by ${proposalForm.elements.host.value.trim()}`);
  const details = document.createElement('dl');
  const meeting = proposalForm.elements.meeting.value.trim();
  const date = proposalForm.elements.date.value;
  [[ 'Date', date ], [ 'Meet nearby', meeting ], [ 'Group', `${capacity} places · ${capacity} remaining` ]].forEach(([label, value]) => {
    const row = document.createElement('div');
    row.append(makeElement('dt', '', label), makeElement('dd', '', value));
    details.append(row);
  });
  const join = makeElement('button', 'button button-dark join-group');
  join.type = 'button';
  join.append(document.createTextNode('Request to join '));
  const arrow = makeElement('span', '', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  join.append(arrow);
  const message = makeElement('p', 'group-message');
  message.setAttribute('role', 'status');
  card.append(top, title, host, details, join, message);
  groupGrid.prepend(card);
  addJoinInteraction(card);
  groupDestination.value = 'all';
  groupDifficulty.value = 'all';
  proposalForm.reset();
  filterGroups();
  proposalMessage.textContent = 'Proposal preview added for this page session only. No group was created online.';
});

filterDestinations();
filterGroups();

// Cache the static site shell after the first secure visit for offline browsing.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      // Offline support is best-effort; all other page features remain available.
    });
  });
}
