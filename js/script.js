// NASA API key
const API_KEY = 'XoveKKD2G6KV4eITTWdbfGM0VNyVrHiNGzTLgD1b';

// ── Random Space Fact (LevelUp) ──────────────────────────────────────────────
const spaceFacts = [
  "A day on Venus is longer than a year on Venus — it takes 243 Earth days to rotate once but only 225 days to orbit the Sun.",
  "Neutron stars are so dense that a teaspoon of their material would weigh about 10 million tons on Earth.",
  "The Milky Way galaxy contains an estimated 100–400 billion stars.",
  "Sound cannot travel through the vacuum of space — space is completely silent.",
  "One million Earths could fit inside the Sun.",
  "The footprints left by Apollo astronauts on the Moon will likely remain for millions of years (no wind to erode them).",
  "Saturn's rings are made mostly of ice and rock, and they are only about 30 feet (10 meters) thick in some places.",
  "There are more stars in the universe than grains of sand on all of Earth's beaches.",
  "The largest known star, UY Scuti, is about 1,700 times wider than the Sun.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "Jupiter's Great Red Spot is a storm that has been raging for at least 400 years.",
  "The Olympus Mons volcano on Mars is nearly three times the height of Mount Everest.",
];

document.getElementById('factText').textContent =
  spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

// ── Date inputs setup ────────────────────────────────────────────────────────
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
setupDateInputs(startInput, endInput);

// ── Gallery fetch ────────────────────────────────────────────────────────────
const gallery = document.getElementById('gallery');
const fetchBtn = document.getElementById('fetchBtn');

fetchBtn.addEventListener('click', fetchImages);

async function fetchImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    showError('Please select both a start and end date.');
    return;
  }
  if (startDate > endDate) {
    showError('Start date must be before or equal to the end date.');
    return;
  }

  // Loading state
  gallery.innerHTML = '<div class="loading">&#x1F504; Loading space photos&hellip;</div>';

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : [data];

    if (items.length === 0) {
      showError('No images found for the selected date range.');
      return;
    }

    renderGallery(items);
  } catch (err) {
    showError(`Failed to load images. ${err.message}`);
  }
}

// ── Render gallery ────────────────────────────────────────────────────────────
function renderGallery(items) {
  gallery.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View details for ${item.title}`);

    const isVideo = item.media_type === 'video';

    // Thumbnail area
    const mediaEl = isVideo
      ? createVideoThumbnail(item)
      : createImageThumbnail(item);

    const info = document.createElement('div');
    info.className = 'card-info';
    info.innerHTML = `<h3>${item.title}</h3><p class="card-date">${formatDate(item.date)}</p>`;

    card.appendChild(mediaEl);
    card.appendChild(info);

    // Open modal on click or Enter key
    card.addEventListener('click', () => openModal(item));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openModal(item);
    });

    gallery.appendChild(card);
  });
}

function createImageThumbnail(item) {
  const img = document.createElement('img');
  img.src = item.url;
  img.alt = item.title;
  img.loading = 'lazy';
  return img;
}

function createVideoThumbnail(item) {
  // Extract YouTube video ID for thumbnail
  const wrapper = document.createElement('div');
  wrapper.className = 'video-thumb';

  const ytMatch = item.url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&"]+)/);
  if (ytMatch) {
    const thumb = document.createElement('img');
    thumb.src = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    thumb.alt = item.title;
    thumb.loading = 'lazy';
    wrapper.appendChild(thumb);
  } else {
    wrapper.textContent = '▶ Video';
  }

  const badge = document.createElement('span');
  badge.className = 'video-badge';
  badge.textContent = '▶ VIDEO';
  wrapper.appendChild(badge);

  return wrapper;
}

// ── Modal ────────────────────────────────────────────────────────────────────
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

function openModal(item) {
  modalMedia.innerHTML = '';

  if (item.media_type === 'video') {
    // Embed YouTube video or show link
    const ytMatch = item.url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&"]+)/);
    if (ytMatch) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${ytMatch[1]}`;
      iframe.title = item.title;
      iframe.allowFullscreen = true;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      modalMedia.appendChild(iframe);
    } else {
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'video-link';
      link.textContent = 'Watch Video';
      modalMedia.appendChild(link);
    }
  } else {
    const img = document.createElement('img');
    img.src = item.hdurl || item.url;
    img.alt = item.title;
    modalMedia.appendChild(img);
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = formatDate(item.date);
  modalExplanation.textContent = item.explanation;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function showError(msg) {
  gallery.innerHTML = `<div class="error-msg">&#9888; ${msg}</div>`;
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}
