const flash = document.getElementById('flash');
requestAnimationFrame(() => requestAnimationFrame(() => {
  flash.style.transition = 'opacity 1.4s ease-out';
  flash.style.opacity = 0;
}));


const clockH = document.getElementById('clock-h');
const clockM = document.getElementById('clock-m');
const pcTime = document.getElementById('pc-time');
const pcDate = document.getElementById('pc-date');

function tickClock() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  clockH.textContent = hh;
  clockM.textContent = mm;
  pcTime.textContent = `${hh}:${mm}`;
  pcDate.textContent = d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
tickClock();
setInterval(tickClock, 1000);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const backLink = document.querySelector('.back-btn');
let leaving = false;

backLink.addEventListener('click', (e) => {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  if (leaving) return;
  leaving = true;

  flash.style.transition = reduceMotion ? 'opacity .3s ease-in' : 'opacity 1s ease-in';
  flash.style.opacity = 1;
  if (!reduceMotion) {
    document.getElementById('room').animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }],
      { duration: 1000, easing: 'ease-in', fill: 'forwards' }
    );
  }
  setTimeout(() => { location.href = backLink.href; }, reduceMotion ? 320 : 1050);
});

window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  leaving = false;
  flash.style.transition = 'opacity 1s ease-out';
  flash.style.opacity = 0;
});

const inside = document.getElementById('page2');
const lampSpot = document.querySelector('.hotspot[aria-label="Lampu meja"]');
function toggleNight() {
  const on = inside.classList.toggle('night');
  lampSpot.setAttribute('aria-pressed', String(on));
}
lampSpot.setAttribute('aria-pressed', 'false');
lampSpot.addEventListener('click', toggleNight);
lampSpot.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleNight(); }
});


const SVG_NS = 'http://www.w3.org/2000/svg';
const catSpot = document.querySelector('.hotspot[aria-label="Kucing"]');
const catGroup = document.querySelector('.cat');
const catAwake = catGroup.querySelector('.cat-awake');
const catTail = catGroup.querySelector('.cat-tail');
const catHead = catGroup.querySelector('.cat-head');
const catEars = catGroup.querySelector('.cat-ears');
const catSleepEars = catGroup.querySelector('.cat-sleep-ears');
const Z_X = 676, Z_Y = 806;
const fx = document.createElementNS(SVG_NS, 'g');
fx.setAttribute('pointer-events', 'none');
catSpot.parentNode.appendChild(fx);

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rot = (...deg) => deg.map((d) => ({ transform: `rotate(${d}deg)` }));

function zzz(n) {
  if (reduceMotion) return;
  for (let i = 0; i < n; i++) {
    const z = document.createElementNS(SVG_NS, 'text');
    z.setAttribute('font-size', 18 + i * 4);
    z.setAttribute('font-weight', 800);
    z.setAttribute('font-family', 'system-ui, sans-serif');
    z.setAttribute('fill', '#dfe6ff');
    z.setAttribute('stroke', '#1b2845');
    z.setAttribute('stroke-width', .8);
    z.setAttribute('paint-order', 'stroke');
    z.setAttribute('opacity', 0);
    z.textContent = i % 2 ? 'Z' : 'z';
    fx.appendChild(z);
    const a = `translate(${Z_X}px, ${Z_Y}px) scale(.7)`;
    const b = `translate(${Z_X + 14 + i * 12}px, ${Z_Y - 50 - i * 16}px) scale(1.1)`;
    z.animate([{ opacity: 0, transform: a }, { opacity: 1, transform: a, offset: .15 }, { opacity: 0, transform: b }],
      { duration: 1900, delay: i * 260, easing: 'ease-out', fill: 'both' }).onfinish = () => z.remove();
  }
}

const moves = {
  tail: () => catTail.animate(rot(0, -30, 24, -26, 20, -12, 0), { duration: 1200, easing: 'ease-in-out' }),
  tilt: () => catHead.animate(rot(0, -11, -11, 8, 0), { duration: 1100, easing: 'ease-in-out' }),
  ears: () => catEars.animate(rot(0, -9, 7, -7, 0), { duration: 450 }),
  hop: () => catAwake.animate([
    { transform: 'translateY(0) scale(1,1)' },
    { transform: 'translateY(2px) scale(1.05,.93)', offset: .2 },
    { transform: 'translateY(-16px) scale(.96,1.06)', offset: .5 },
    { transform: 'translateY(0) scale(1.05,.93)', offset: .8 },
    { transform: 'translateY(0) scale(1,1)' }], { duration: 650, easing: 'ease-out' }),
};
let lastMove = '', tipT;
function petCat() {
  if (inside.classList.contains('night')) {
    zzz(3);
    if (!reduceMotion) catSleepEars.animate(rot(0, -10, 6, 0), { duration: 500 });
    catSpot.classList.add('no-tip');
    clearTimeout(tipT);
    tipT = setTimeout(() => catSpot.classList.remove('no-tip'), 2200);
    return;
  }
  if (reduceMotion) return;
  const name = pick(Object.keys(moves).filter((k) => k !== lastMove));
  lastMove = name;
  moves[name]();
}
catSpot.addEventListener('click', petCat);
catGroup.addEventListener('click', petCat);
catSpot.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); petCat(); }
});


const SCENES = {
  sunset: (id) => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6fb8"/><stop offset=".55" stop-color="#f29e7c"/><stop offset="1" stop-color="#fbd38a"/></linearGradient></defs><rect width="400" height="300" fill="url(#${id})"/><circle cx="270" cy="188" r="42" fill="#fff1c4" opacity=".95"/><path d="M0 232 Q90 190 180 226 T400 214 V300 H0Z" fill="#3a4a7a"/><path d="M0 264 Q110 234 220 260 T400 250 V300 H0Z" fill="#232f55"/></svg>`,
  mountain: (id) => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101a38"/><stop offset="1" stop-color="#3e6399"/></linearGradient></defs><rect width="400" height="300" fill="url(#${id})"/><circle cx="300" cy="70" r="24" fill="#f4f1dc"/><g fill="#fff" opacity=".8"><circle cx="60" cy="50" r="1.6"/><circle cx="120" cy="90" r="1.4"/><circle cx="180" cy="40" r="1.8"/><circle cx="230" cy="100" r="1.3"/><circle cx="350" cy="130" r="1.5"/><circle cx="30" cy="120" r="1.3"/></g><path d="M-10 250 L110 110 L190 210 L270 130 L410 250Z" fill="#26386a"/><path d="M110 110 L90 138 L110 130 L128 140Z M270 130 L252 154 L270 148 L286 156Z" fill="#e8eefb"/><rect y="250" width="400" height="50" fill="#162347"/></svg>`,
  beach: (id) => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc3f0"/><stop offset="1" stop-color="#e6f2fb"/></linearGradient></defs><rect width="400" height="300" fill="url(#${id})"/><circle cx="90" cy="70" r="30" fill="#fff3b8"/><rect y="150" width="400" height="80" fill="#3e8fc7"/><path d="M0 170 Q50 160 100 170 T200 170 T300 170 T400 170" fill="none" stroke="#bfe0f6" stroke-width="3"/><path d="M0 195 Q50 185 100 195 T200 195 T300 195 T400 195" fill="none" stroke="#9fd0ee" stroke-width="3"/><path d="M0 230 Q120 215 240 232 T400 225 V300 H0Z" fill="#f2dfb4"/></svg>`,
};
let sceneN = 0;
const sceneSVG = (key) => (SCENES[key] || SCENES.sunset)('sc' + (++sceneN));
const SCENE_KEYS = ['sunset', 'mountain', 'beach'];


const thumbsEl = document.getElementById('thumbs');
const thumbEls = [...thumbsEl.querySelectorAll('.thumb')];
const PHOTOS = thumbEls.map((t, i) => {
  const img = t.querySelector('img');
  const nm = t.querySelector('.nm');
  const p = {
    title: t.dataset.title || (nm ? nm.textContent.trim() : 'Foto ' + (i + 1)),
    src: img ? img.getAttribute('src') : '',
    scene: SCENE_KEYS[i % SCENE_KEYS.length],
    broken: false,
  };
  const fallback = () => { p.broken = true; t.querySelector('.pic').innerHTML = sceneSVG(p.scene); };
  if (!img) fallback();
  else {
    img.addEventListener('error', fallback);
    if (img.complete && img.naturalWidth === 0) fallback();
  }
  return p;
});
function makePic(p) {
  const box = document.createElement('div');
  box.className = 'pic';
  if (p.broken || !p.src) { box.innerHTML = sceneSVG(p.scene); return box; }
  const img = new Image();
  img.alt = p.title;
  img.draggable = false;
  img.onerror = () => { box.innerHTML = sceneSVG(p.scene); };
  img.src = p.src;
  box.appendChild(img);
  return box;
}

const pc = document.getElementById('pc');
const pcScreen = document.getElementById('pc-screen');
const desk = document.getElementById('desk');
const startMenu = document.getElementById('start-menu');
const tbStart = document.getElementById('tb-start');
const wins = {
  files: document.getElementById('win-files'),
  notes: document.getElementById('win-notes'),
  viewer: document.getElementById('win-viewer'),
};
const tbBtns = [...document.querySelectorAll('.tb-btn[data-app]')];
const deskIcons = [...document.querySelectorAll('.desk-icon')];
const monitorSpot = document.querySelector('.hotspot[aria-label="Layar komputer"]');
const monitorScreen = document.querySelector('.monitor-glow').parentNode;
const isSmall = () => window.matchMedia('(max-width: 640px)').matches;
const isCoarse = () => window.matchMedia('(pointer: coarse)').matches;
let activeApp = null, zTop = 10, viewerIdx = 0, pcOpen = false;

const winVisible = (a) => !wins[a].hidden && !wins[a].classList.contains('min');
function topVisible() {
  return Object.keys(wins).filter(winVisible)
    .sort((x, y) => (+wins[y].style.zIndex || 0) - (+wins[x].style.zIndex || 0))[0] || null;
}
function updateTb() {
  tbBtns.forEach((b) => {
    const a = b.dataset.app;
    if (a === 'viewer') b.hidden = wins.viewer.hidden;
    b.classList.toggle('running', !wins[a].hidden);
    b.classList.toggle('active', a === activeApp && winVisible(a));
  });
  for (const a in wins) wins[a].classList.toggle('active', a === activeApp && winVisible(a));
}
function focusWin(a) { activeApp = a; wins[a].style.zIndex = ++zTop; updateTb(); }
function closeStart() { startMenu.hidden = true; tbStart.setAttribute('aria-expanded', 'false'); }
function openWin(a) {
  const w = wins[a];
  if (w.hidden) {
    w.hidden = false;
    w.classList.remove('min', 'pop');
    void w.offsetWidth;
    w.classList.add('pop');
  } else w.classList.remove('min');
  focusWin(a);
  closeStart();
}
function closeWin(a) { wins[a].hidden = true; wins[a].classList.remove('min'); if (activeApp === a) activeApp = topVisible(); updateTb(); }
function minWin(a) { wins[a].classList.add('min'); if (activeApp === a) activeApp = topVisible(); updateTb(); }

for (const a in wins) {
  const w = wins[a];
  w.addEventListener('pointerdown', () => focusWin(a));
  w.querySelector('[data-act="close"]').addEventListener('click', () => closeWin(a));
  w.querySelector('[data-act="min"]').addEventListener('click', () => minWin(a));
  const bar = w.querySelector('.win-bar');
  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.win-ctl') || isSmall()) return;
    const dr = desk.getBoundingClientRect(), wr = w.getBoundingClientRect();
    const ox = e.clientX - wr.left, oy = e.clientY - wr.top;
    bar.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const x = Math.min(Math.max(ev.clientX - dr.left - ox, 80 - w.offsetWidth), dr.width - 80);
      const y = Math.min(Math.max(ev.clientY - dr.top - oy, 0), dr.height - 34);
      w.style.left = x + 'px';
      w.style.top = y + 'px';
    };
    const up = () => {
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  });
}

deskIcons.forEach((ic) => {
  ic.addEventListener('click', (e) => {
    if (e.detail === 0 || isCoarse()) { openWin(ic.dataset.app); return; }
    deskIcons.forEach((o) => o.classList.toggle('sel', o === ic));
  });
  ic.addEventListener('dblclick', () => openWin(ic.dataset.app));
});
pcScreen.addEventListener('click', (e) => {
  if (!e.target.closest('.desk-icon')) deskIcons.forEach((o) => o.classList.remove('sel'));
  if (!e.target.closest('.start-menu, .tb-start')) closeStart();
});

tbBtns.forEach((b) => b.addEventListener('click', () => {
  const a = b.dataset.app;
  if (wins[a].hidden || wins[a].classList.contains('min')) openWin(a);
  else if (activeApp === a) minWin(a);
  else focusWin(a);
}));
tbStart.addEventListener('click', () => {
  const show = startMenu.hidden;
  startMenu.hidden = !show;
  tbStart.setAttribute('aria-expanded', String(show));
});
startMenu.querySelectorAll('.sm-item').forEach((b) => b.addEventListener('click', () => openWin(b.dataset.app)));


const stageEl = document.getElementById('viewer-stage');
thumbEls.forEach((t, i) => t.addEventListener('click', () => showPhoto(i, true)));
document.getElementById('files-status').textContent = `${PHOTOS.length} item`;
function showPhoto(i, open) {
  const n = PHOTOS.length;
  viewerIdx = (i + n) % n;
  const p = PHOTOS[viewerIdx];
  stageEl.replaceChildren(makePic(p));
  document.getElementById('viewer-cap').textContent = `${p.title} · ${viewerIdx + 1} / ${n}`;
  document.getElementById('viewer-title').textContent = `${p.title} – Foto`;
  thumbsEl.querySelectorAll('.thumb').forEach((t) => t.classList.toggle('sel', +t.dataset.i === viewerIdx));
  if (open) openWin('viewer');
}
document.getElementById('viewer-prev').addEventListener('click', () => showPhoto(viewerIdx - 1));
document.getElementById('viewer-next').addEventListener('click', () => showPhoto(viewerIdx + 1));
showPhoto(0);


function openPC() {
  if (pcOpen) return;
  pcOpen = true;
  pc.hidden = false;
  document.getElementById('page2').inert = true;
  requestAnimationFrame(() => requestAnimationFrame(() => pc.classList.add('open')));
  (pcLocked ? lockInput : pcScreen).focus({ preventScroll: true });
}
function closePC() {
  if (!pcOpen) return;
  pcOpen = false;
  closeStart();
  pc.classList.remove('open');
  document.getElementById('page2').inert = false;
  setTimeout(() => { if (!pcOpen) pc.hidden = true; }, reduceMotion ? 0 : 380);
  monitorSpot.focus({ preventScroll: true });
}
monitorSpot.addEventListener('click', openPC);
monitorSpot.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPC(); }
});
monitorScreen.style.cursor = 'pointer';
monitorScreen.addEventListener('click', openPC);
document.getElementById('pc-close').addEventListener('click', closePC);
document.getElementById('sm-power').addEventListener('click', closePC);
document.getElementById('tb-power').addEventListener('click', closePC);
pc.addEventListener('click', (e) => { if (e.target === pc) closePC(); });
document.addEventListener('keydown', (e) => {
  if (!pcOpen) return;
  if (e.key === 'Escape') { if (!startMenu.hidden) closeStart(); else closePC(); }
  else if (activeApp === 'viewer' && winVisible('viewer') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    showPhoto(viewerIdx + (e.key === 'ArrowRight' ? 1 : -1));
  }
});
updateTb();


const stickySpot = document.querySelector('.hotspot[aria-label="Catatan tempel"]');
const stickyPaper = document.querySelector('.hotspot[aria-label="Catatan tempel"]').closest('svg')
  .querySelector('g[transform="matrix(1,-0.553,0,1,505.0,298.7)"]');
const stickyOv = document.getElementById('sticky');
const stickyNote = document.getElementById('sticky-note');
let stickyOpen = false;
function openSticky() {
  if (stickyOpen || pcOpen) return;
  stickyOpen = true;
  stickyOv.hidden = false;
  inside.inert = true;
  requestAnimationFrame(() => requestAnimationFrame(() => stickyOv.classList.add('open')));
  stickyNote.focus({ preventScroll: true });
}
function closeSticky() {
  if (!stickyOpen) return;
  stickyOpen = false;
  stickyOv.classList.remove('open');
  inside.inert = false;
  setTimeout(() => { if (!stickyOpen) stickyOv.hidden = true; }, reduceMotion ? 0 : 280);
  stickySpot.focus({ preventScroll: true });
}
stickySpot.addEventListener('click', openSticky);
stickySpot.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSticky(); }
});
if (stickyPaper) { stickyPaper.style.cursor = 'pointer'; stickyPaper.addEventListener('click', openSticky); }
document.getElementById('sticky-close').addEventListener('click', closeSticky);
stickyOv.addEventListener('click', (e) => { if (e.target === stickyOv) closeSticky(); });
document.addEventListener('keydown', (e) => { if (stickyOpen && e.key === 'Escape') closeSticky(); });


/* ===== Lock screen PC ===== */
const PC_PASSWORD = '467558';   // samakan dengan tulisan di sticky note (id="sticky-text")
const lockEl = document.getElementById('lock');
const lockForm = document.getElementById('lock-form');
const lockInput = document.getElementById('lock-input');
const lockMsg = document.getElementById('lock-msg');
let pcLocked = true;

function tickLock() {
  const d = new Date();
  document.getElementById('lock-time').textContent =
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  document.getElementById('lock-date').textContent =
    d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
}
tickLock();
setInterval(tickLock, 1000);

lockForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (lockInput.value === PC_PASSWORD) {
    pcLocked = false;
    lockMsg.textContent = '';
    lockEl.classList.add('unlocking');
    setTimeout(() => { lockEl.hidden = true; pcScreen.focus({ preventScroll: true }); }, reduceMotion ? 0 : 450);
  } else {
    lockMsg.textContent = 'Kata sandi salah. Coba lagi.';
    lockInput.value = '';
    lockForm.classList.remove('shake');
    void lockForm.offsetWidth;
    lockForm.classList.add('shake');
    lockInput.focus();
  }
});
lockInput.addEventListener('input', () => { lockMsg.textContent = ''; });

/* foto user di lock screen: ganti path-nya di sini (kalau gagal dimuat, balik ke ikon siluet) */
const LOCK_AVATAR = 'picture/jeno 1.jfif';
const lockAvatar = document.querySelector('.lock-avatar');
const lockAvatarImg = document.getElementById('lock-avatar-img');
lockAvatarImg.addEventListener('load', () => { lockAvatarImg.hidden = false; lockAvatar.classList.add('has-photo'); });
lockAvatarImg.addEventListener('error', () => { lockAvatarImg.hidden = true; lockAvatar.classList.remove('has-photo'); });
lockAvatarImg.src = LOCK_AVATAR;