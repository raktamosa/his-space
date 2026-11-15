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
  catAbort();
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
  if (catBusy && catMode === 'drink') return;
  drinkMilk();
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
let activeApp = null, zTop = 10, viewerIdx = 0, pcOpen = false, pcPushed = false;

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
  if (!pcPushed) { history.pushState({ ov: 'pc' }, ''); pcPushed = true; }
}
function closePC(fromPop) {
  if (!pcOpen) return;
  pcOpen = false;
  if (pcPushed) { pcPushed = false; if (fromPop !== true) history.back(); }
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
let stickyOpen = false, stickyPushed = false;
function openSticky() {
  if (stickyOpen || pcOpen) return;
  stickyOpen = true;
  stickyOv.hidden = false;
  inside.inert = true;
  requestAnimationFrame(() => requestAnimationFrame(() => stickyOv.classList.add('open')));
  stickyNote.focus({ preventScroll: true });
  if (!stickyPushed) { history.pushState({ ov: 'sticky' }, ''); stickyPushed = true; }
}
function closeSticky(fromPop) {
  if (!stickyOpen) return;
  stickyOpen = false;
  if (stickyPushed) { stickyPushed = false; if (fromPop !== true) history.back(); }
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


const artOv = document.getElementById('art');
const artCard = document.getElementById('art-card');
const artBody = document.getElementById('art-body');
let artOpen = false, artPushed = false, artSpot = null;
function openArt(n, spot) {
  if (artOpen || stickyOpen || pcOpen) return;
  const tpl = document.querySelector(`template[data-art="${n}"]`);
  if (!tpl) return;
  artBody.replaceChildren(tpl.content.cloneNode(true));
  artSpot = spot || null;
  artCard.dataset.art = n;                              // warna bingkai ikut bingkai di dinding
  artOpen = true;
  artOv.hidden = false;
  inside.inert = true;
  requestAnimationFrame(() => requestAnimationFrame(() => artOv.classList.add('open')));
  artCard.focus({ preventScroll: true });
  if (!artPushed) { history.pushState({ ov: 'art' }, ''); artPushed = true; }
}
function closeArt(fromPop) {
  if (!artOpen) return;
  artOpen = false;
  if (artPushed) { artPushed = false; if (fromPop !== true) history.back(); }
  artOv.classList.remove('open');
  inside.inert = false;
  setTimeout(() => { if (!artOpen) { artOv.hidden = true; artBody.replaceChildren(); } }, reduceMotion ? 0 : 280);
  if (artSpot) artSpot.focus({ preventScroll: true });
}
document.querySelectorAll('.hotspot[data-art]').forEach((h) => {
  const n = h.dataset.art;
  h.addEventListener('click', () => openArt(n, h));
  h.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openArt(n, h); }
  });
});
document.querySelectorAll('.art-frame').forEach((f) => {
  f.addEventListener('click', () => openArt(f.dataset.art, document.querySelector(`.hotspot[data-art="${f.dataset.art}"]`)));
});
document.getElementById('art-close').addEventListener('click', () => closeArt());
artOv.addEventListener('click', (e) => { if (e.target === artOv) closeArt(); });
document.addEventListener('keydown', (e) => { if (artOpen && e.key === 'Escape') closeArt(); });


const PC_PASSWORD = '467558';   
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

const LOCK_AVATAR = 'picture/jeno 1.jfif';
const lockAvatar = document.querySelector('.lock-avatar');
const lockAvatarImg = document.getElementById('lock-avatar-img');
lockAvatarImg.addEventListener('load', () => { lockAvatarImg.hidden = false; lockAvatar.classList.add('has-photo'); });
lockAvatarImg.addEventListener('error', () => { lockAvatarImg.hidden = true; lockAvatar.classList.remove('has-photo'); });
lockAvatarImg.src = LOCK_AVATAR;

document.getElementById('lock-logout').addEventListener('click', () => closePC());

window.addEventListener('popstate', () => {
  if (artOpen) closeArt(true);
  else if (stickyOpen) closeSticky(true);
  else if (pcOpen) closePC(true);
});

const catPaw = catGroup.querySelector('.cat-paw');
const catEyes = catGroup.querySelector('.cat-eyes');
const bowlFx = document.querySelector('.bowl-fx');
const WALK = { dx: 46, dy: 22 };                       
const BOWL = { x: 720, y: 841 };                      
let catBusy = false, catMode = '', catToken = 0, catAnims = [], idleT;

function play(el, frames, opts) {
  const a = el.animate(frames, Object.assign({ fill: 'forwards' }, opts));
  catAnims.push(a);
  return a.finished.then(() => true, () => false);     
}
function catStart(mode) {
  catAbort();
  catBusy = true; catMode = mode;
  catSpot.classList.add('busy');
  return catToken;
}
function catAbort() {                                  
  catToken++;
  catAnims.forEach((a) => { try { a.cancel(); } catch (e) {} });
  catAnims = [];
  fx.querySelectorAll('.cat-fx').forEach((n) => n.remove());
  bowlFx.querySelectorAll('.cat-fx').forEach((n) => n.remove());
  catBusy = false; catMode = '';
  catSpot.classList.remove('busy');
}
function walkFrames(x0, y0, x1, y1, steps, hop) {
  const f = [], n = steps * 4;
  for (let i = 0; i <= n; i++) {
    const p = i / n, h = Math.abs(Math.sin(p * steps * Math.PI)) * hop;
    f.push({ transform: `translate(${x0 + (x1 - x0) * p}px, ${y0 + (y1 - y0) * p - h}px)` });
  }
  return f;
}
function fxEl(name, attrs) {
  const n = document.createElementNS(SVG_NS, name);
  n.setAttribute('class', 'cat-fx');
  n.setAttribute('pointer-events', 'none');
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  fx.appendChild(n);
  return n;
}
function ripple() {
  const e = fxEl('ellipse', { cx: BOWL.x, cy: BOWL.y, rx: 8, ry: 4.2, fill: 'none', stroke: '#d8d0bb', 'stroke-width': 1.2 });
  bowlFx.appendChild(e);                               // ripple di permukaan susu (di belakang kepala)
  e.style.transformBox = 'fill-box'; e.style.transformOrigin = 'center';
  e.animate([{ transform: 'scale(.4)', opacity: .95 }, { transform: 'scale(1.35)', opacity: 0 }],
    { duration: 900, easing: 'ease-out' }).onfinish = () => e.remove();
}
function bubbles(n) {
  for (let i = 0; i < n; i++) setTimeout(() => {
    if (!catBusy) return;
    const r = 2.4 + Math.random() * 3.4;
    const c = fxEl('circle', {
      cx: 636 + Math.random() * 46, cy: 768 + Math.random() * 30, r,
      fill: '#fff', 'fill-opacity': .55, stroke: '#9fc3ee', 'stroke-width': 1,
    });
    c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center';
    c.animate([
      { transform: 'translate(0,0) scale(.6)', opacity: 0 },
      { opacity: .95, offset: .2 },
      { transform: `translate(${Math.random() * 30 - 15}px, ${-(40 + Math.random() * 30)}px) scale(1.1)`, opacity: 0 },
    ], { duration: 1500 + Math.random() * 600, easing: 'ease-out' }).onfinish = () => c.remove();
  }, i * 230);
}

async function drinkMilk() {
  const t = catStart('drink');
  const go = async (p) => (await p) && t === catToken;
  const DIP = 'translate(11px, 25px) rotate(16deg)';
  const LAP = 'translate(11px, 30px) rotate(22deg)';

  if (!await go(play(catAwake, walkFrames(0, 0, WALK.dx, WALK.dy, 4, 4), { duration: 1700, easing: 'ease-in-out' }))) return;
  if (!await go(play(catHead, [{ transform: 'none' }, { transform: DIP }], { duration: 500, easing: 'ease-in-out' }))) return;

  const lapTimer = setInterval(() => { if (t === catToken) ripple(); }, 430);
  const done = await go(play(catHead, [{ transform: DIP }, { transform: LAP }, { transform: DIP }],
    { duration: 430, iterations: 6, easing: 'ease-in-out' }));
  clearInterval(lapTimer);
  if (!done) return;

  if (!await go(play(catHead, [{ transform: DIP }, { transform: 'none' }], { duration: 450, easing: 'ease-out' }))) return;
  play(catEars, rot(0, -9, 7, -7, 0), { duration: 450 });
  await Promise.resolve();
  if (!await go(play(catHead, rot(0, 6, -5, 4, 0), { duration: 600 }))) return;       // jilat bibir / puas
  if (!await go(play(catAwake, walkFrames(WALK.dx, WALK.dy, 0, 0, 3, 7), { duration: 1300, easing: 'ease-in-out' }))) return;
  play(catTail, rot(0, -30, 24, -26, 20, -12, 0), { duration: 1200, easing: 'ease-in-out' });
  if (!await go(Promise.resolve(true).then(() => new Promise((r) => setTimeout(() => r(true), 900))))) return;
  catAbort();
}

async function groom(kind) {
  const t = catStart('groom');
  const go = async (p) => (await p) && t === catToken;
  play(catEyes, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.12)' }], { duration: 220 });

  if (kind === 'face') {
    const UP = 'translate(-6px, -21px)', MID = 'translate(-1px, -15px)';
    if (!await go(play(catPaw, [{ transform: 'none' }, { transform: UP }], { duration: 400, easing: 'ease-out' }))) return;
    play(catHead, [{ transform: 'none' }, { transform: 'rotate(5deg) translate(1px, 3px)' }], { duration: 300 });
    bubbles(6);
    if (!await go(play(catPaw, [{ transform: UP }, { transform: MID }, { transform: UP }], { duration: 420, iterations: 5 }))) return;
    play(catHead, [{ transform: 'rotate(5deg) translate(1px, 3px)' }, { transform: 'none' }], { duration: 300 });
    if (!await go(play(catPaw, [{ transform: UP }, { transform: 'none' }], { duration: 380, easing: 'ease-in' }))) return;
  } else {
    const A = 'translate(4px, 14px) rotate(20deg)', B = 'translate(4px, 17px) rotate(25deg)';
    if (!await go(play(catHead, [{ transform: 'none' }, { transform: A }], { duration: 500, easing: 'ease-in-out' }))) return;
    bubbles(5);
    if (!await go(play(catHead, [{ transform: A }, { transform: B }, { transform: A }], { duration: 380, iterations: 6, easing: 'ease-in-out' }))) return;
    if (!await go(play(catHead, [{ transform: A }, { transform: 'none' }], { duration: 450, easing: 'ease-out' }))) return;
  }
  play(catEyes, [{ transform: 'scaleY(.12)' }, { transform: 'scaleY(1)' }], { duration: 200 });
  if (!await go(play(catHead, rot(0, -4, 4, 0), { duration: 450 }))) return;        // geleng kecil: "udah bersih"
  catAbort();
}

function idleTick() {
  clearTimeout(idleT);
  idleT = setTimeout(() => {
    const free = !catBusy && !document.hidden && !reduceMotion && !pcOpen && !stickyOpen && !artOpen && !inside.classList.contains('night');
    if (free) {
      const r = Math.random();
      if (r < .6) groom(Math.random() < .5 ? 'face' : 'chest');
      else (Math.random() < .5 ? moves.tail : moves.ears)();
    }
    idleTick();
  }, 2500 + Math.random() * 3500);
}
if (!reduceMotion) { idleTick(); setTimeout(() => { if (!catBusy && !inside.classList.contains('night')) groom('face'); }, 2500); }