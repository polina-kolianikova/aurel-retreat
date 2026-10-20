const $ = (selector) => document.querySelector(selector);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const opening = $('.opening');
const aperture = $('.aperture');
const heroImage = $('.hero-image');
let frameRequested = false;
let light = 'noon';
const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (n) => n * n * (3 - 2 * n);
const lights = { morning: 'sepia(.18) saturate(.65) brightness(1.05)', noon: 'saturate(.75)', dusk: 'sepia(.28) saturate(.9) brightness(.76) hue-rotate(-8deg)' };

function renderOpening() {
  frameRequested = false;
  if (reduced.matches) return;
  const viewport = window.innerHeight;
  const progress = clamp(-opening.getBoundingClientRect().top / Math.max(1, opening.offsetHeight - viewport));
  const p = smooth(clamp(progress / .82));
  const mobile = window.innerWidth <= 600;
  const startX = mobile ? 49 : 27;
  const startY = mobile ? 31 : 42;
  const aperturePath = `ellipse(${startX + (100 - startX) * p}% ${startY + (110 - startY) * p}% at ${63 + (50 - 63) * p}% ${55 + (50 - 55) * p}%)`;
  aperture.style.clipPath = aperturePath;
  $('.hero-copy-mask').style.clipPath = aperturePath;
  $('.wordmark').style.transform = `translateY(${-progress * 130}px)`;
  $('.wordmark').style.opacity = 1 - clamp(progress * 2.8);
  heroImage.style.transform = `scale(${1.05 + progress * .07}) translateY(${progress * 2}%)`;
  $('.image-shade').style.opacity = String(.5 + p * .5);
  const white = smooth(clamp((progress - .13) / .22));
  const r = Math.round(50 + (247 - 50) * white), g = Math.round(43 + (242 - 43) * white), b = Math.round(37 + (232 - 37) * white);
  const color = `rgb(${r},${g},${b})`;
  ['.hero-aside', '.hero-bottom'].forEach((selector) => { $(selector).style.color = color; });
  document.querySelectorAll('.hero-copy').forEach((copy) => { copy.style.transform = `translateY(${-progress * 38}px)`; });
  $('.aperture-note').style.opacity = 1 - clamp(progress * 5);
}
function requestRender() { if (!frameRequested) { frameRequested = true; requestAnimationFrame(renderOpening); } }
window.addEventListener('scroll', requestRender, { passive: true });
window.addEventListener('resize', requestRender);
reduced.addEventListener('change', () => {
  aperture.style.clipPath = ''; $('.hero-copy-mask').style.clipPath = ''; heroImage.style.transform = '';
  $('.wordmark').style.transform = ''; $('.wordmark').style.opacity = '';
  $('.image-shade').style.opacity = ''; $('.aperture-note').style.opacity = '';
  document.querySelectorAll('.hero-copy').forEach((copy) => { copy.style.transform = ''; });
  ['.hero-aside', '.hero-bottom'].forEach((s) => { $(s).style.color = ''; });
  renderOpening();
});
document.querySelectorAll('[data-light]').forEach((button) => button.addEventListener('click', () => {
  light = button.dataset.light;
  document.querySelectorAll('[data-light]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  heroImage.style.filter = lights[light];
}));

if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js-ready');
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
  document.querySelectorAll('[data-reveal]').forEach((item) => observer.observe(item));
}

const rooms = [
  { name: 'the sun room', image: 'suite.jpg', alt: 'An airy living space with warm wood, soft seating and natural light', detail: '42 M² / TWO GUESTS / SLOW MORNINGS', title: 'For the light<br><em>you wake up in.</em>', description: 'A warm, open living space. Linen, timber and a quiet spot by the window. Leave the curtains open and let the morning find you.' },
  { name: 'the pool house', image: 'villa.jpg', alt: 'A sunlit white villa opening onto its turquoise pool', detail: '68 M² / TWO GUESTS / POOLSIDE DAYS', title: 'A little dip.<br><em>A little longer.</em>', description: 'Room to drift between inside and out. A shaded terrace, cool stone underfoot and the pool just a few steps from a very good book.' },
  { name: 'the coastal loft', image: 'coast.jpg', alt: 'A colourful Mediterranean coastal village overlooking a blue inlet', detail: '55 M² / TWO GUESTS / COASTAL OUTLOOK', title: 'Keep the sea<br><em>in sight.</em>', description: 'An imagined hideaway above the coast. Salt in the air, room for two, and a view that makes doing nothing feel like an excellent plan.' }
];
let activeRoom = 0;
function selectRoom(index, moveFocus = false) {
  activeRoom = index;
  const room = rooms[index];
  document.querySelectorAll('[data-room]').forEach((button, i) => { button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1; if (moveFocus && i === index) button.focus(); });
  $('#room-image').src = `assets/images/${room.image}`;
  $('#room-image').alt = room.alt;
  $('#room-number').textContent = String(index + 1).padStart(2, '0');
  $('#room-detail').textContent = room.detail;
  $('#room-title').innerHTML = room.title;
  $('#room-description').textContent = room.description;
  $('#room-panel').setAttribute('aria-labelledby', `room-tab-${index}`);
  $('#stay-room').value = String(index);
  updateItinerary();
}
document.querySelectorAll('[data-room]').forEach((button) => {
  button.addEventListener('click', () => selectRoom(Number(button.dataset.room)));
  button.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (activeRoom + 1) % rooms.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (activeRoom + rooms.length - 1) % rooms.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = rooms.length - 1;
    if (next !== undefined) { event.preventDefault(); selectRoom(next, true); }
  });
});

const experiences = { coast: { title: 'follow the coast', text: 'a morning walk to the water. stop whenever the view asks you to.' }, table: { title: 'come to the long table', text: 'an unhurried seasonal dinner, with a little space for good conversation.' }, quiet: { title: 'keep the morning open', text: 'coffee, a page of your book, and absolutely nothing to be on time for.' } };
let itineraryText = '';
function updateItinerary() {
  const form = new FormData($('#stay-form'));
  const room = rooms[Number(form.get('room'))];
  const nights = Number(form.get('nights'));
  const guests = Number(form.get('guests'));
  const chosen = form.getAll('experience');
  const lines = chosen.map((value, index) => `<div class="itinerary-row"><span>DAY ${Math.min(index + 1, nights)}</span><p>${experiences[value].title}<br>${experiences[value].text}</p></div>`).join('');
  $('#itinerary').innerHTML = `<h3>${room.name}</h3><p class="summary-meta">${nights} nights / ${guests === 1 ? 'a little time for yourself' : 'a little time for two'}<br>${nights + 1} days with nowhere else to be.</p>${lines || '<div class="itinerary-row"><span>ANY DAY</span><p>leave the day open.<br>sometimes that’s the best plan.</p></div>'}`;
  itineraryText = `AUREL\nA COASTAL STATE OF MIND\n\nYOUR LITTLE ESCAPE\n${room.name}\n${nights} nights, ${guests} ${guests === 1 ? 'guest' : 'guests'}\n\n${chosen.map((value, index) => `Day ${Math.min(index + 1, nights)}: ${experiences[value].title}\n${experiences[value].text}`).join('\n\n') || 'Leave the days open. There is no rush.'}\n\nAUREL is an independent hospitality concept.\nThis is a personal illustrative itinerary, not a reservation.\nNo booking or payment has been made.\n`;
}
$('#stay-form').addEventListener('change', updateItinerary);
$('#stay-form').addEventListener('submit', (event) => { event.preventDefault(); updateItinerary(); $('#download-plan').focus({ preventScroll: true }); });
$('#download-plan').addEventListener('click', () => {
  updateItinerary();
  const url = URL.createObjectURL(new Blob([itineraryText], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'my-aurel-escape.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
updateItinerary(); renderOpening();
