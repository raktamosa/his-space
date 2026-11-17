const SVG_NS = 'http://www.w3.org/2000/svg';
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const key in attrs) node.setAttribute(key, attrs[key]);
  return node;
}

const fenceLayer = document.getElementById('fence');

const FENCE_INSET = 15;
const yLeft  = (x) => 325 + (175 / 337) * (x - 68)  - FENCE_INSET;
const yRight = (x) => 500 - (172 / 345) * (x - 405) - FENCE_INSET;

const GATE_L = 169;                       
const GATE_R = 247;                       
const CORNER = 405;                       
const GAP = (CORNER - GATE_R) / 12;       

function buildFence(xa, xb, yAt, count, skipFirst = false) {
  const x1 = xa, y1 = yAt(xa), x2 = xb, y2 = yAt(xb);
  const rails = el('g', { stroke: '#dcdad2', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  rails.appendChild(el('line', { x1, y1: y1 - 8,  x2, y2: y2 - 8 }));
  rails.appendChild(el('line', { x1, y1: y1 - 16, x2, y2: y2 - 16 }));
  fenceLayer.appendChild(rails);

  for (let i = skipFirst ? 1 : 0; i <= count; i++) {
    const t = i / count;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    fenceLayer.appendChild(el('path', {
      d: `M${x - 2.6},${y} V${y - 19} L${x},${y - 23} L${x + 2.6},${y - 19} V${y} Z`,
      fill: '#eeece5',
      stroke: '#a9b3ad',
      'stroke-width': 0.6
    }));
  }
}

function buildPillar(x, y) {
  const g = el('g');
  g.appendChild(el('rect', { x: x - 6, y: y - 42, width: 12, height: 42, fill: '#e6e4dc' }));
  g.appendChild(el('rect', { x: x + 1, y: y - 42, width: 5,  height: 42, fill: '#cfcdc4' }));
  g.appendChild(el('rect', { x: x - 8, y: y - 46, width: 16, height: 5,  fill: '#f2f0e9' }));
  fenceLayer.appendChild(g);
}

buildFence(GATE_L - 5 * GAP, GATE_L, yLeft, 5);            
buildFence(GATE_R, CORNER, yLeft, 12);                     
buildFence(CORNER, CORNER + 11 * GAP, yRight, 11, true);   
buildPillar(GATE_L, yLeft(GATE_L));                        
buildPillar(GATE_R, yLeft(GATE_R));                        

let calmTimer;

function setWind(value) {
  root.style.setProperty('--wind', value);
}

function randomGust() {
  setWind((0.8 + Math.random() * 0.9).toFixed(2));          
  calmTimer = setTimeout(randomGust, 3500 + Math.random() * 3500);
}

function bigGust() {
  clearTimeout(calmTimer);
  setWind(2.6);
  for (let i = 0; i < 7; i++) setTimeout(spawnLeaf, i * 160);
  calmTimer = setTimeout(randomGust, 3200);
}


const leafLayer = document.getElementById('leaves');
const leafColors = ['#d9a050', '#c98b43', '#e0b062', '#b8c47a'];

function spawnLeaf() {
  if (reduceMotion || busy) return;

  const leaf = el('ellipse', {
    rx: 4.5,
    ry: 2.6,
    fill: leafColors[Math.floor(Math.random() * leafColors.length)]
  });
  leafLayer.appendChild(leaf);

  const startX = -40;
  const startY = 110 + Math.random() * 320;
  const endX = 860;
  const endY = startY + (Math.random() * 140 - 40);
  const midY = startY - 30 - Math.random() * 60;
  const spin = 360 + Math.random() * 540;

  const anim = leaf.animate([
    { transform: `translate(${startX}px, ${startY}px) rotate(0deg)`,                        opacity: 0 },
    { transform: `translate(${startX + 120}px, ${startY - 10}px) rotate(${spin * 0.2}deg)`, opacity: 1, offset: 0.1 },
    { transform: `translate(${(startX + endX) / 2}px, ${midY}px) rotate(${spin * 0.6}deg)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${endX}px, ${endY}px) rotate(${spin}deg)`,                      opacity: 0 }
  ], {
    duration: 6500 + Math.random() * 3500,
    easing: 'ease-in-out'
  });

  anim.onfinish = () => leaf.remove();
}


if (!reduceMotion) {
  randomGust();
  setInterval(spawnLeaf, 2200);
  setTimeout(spawnLeaf, 400);
}

document.addEventListener('click', () => { if (!busy) bigGust(); });


const windSfx = document.getElementById('wind-sfx');
const WIND_VOL = 0.45;
let windFade = null;

function fadeWind(to, ms) {
  if (!windSfx) return;
  clearInterval(windFade);
  const from = windSfx.volume;
  const t0 = performance.now();
  windFade = setInterval(() => {
    const u = Math.min(1, (performance.now() - t0) / ms);
    windSfx.volume = from + (to - from) * u;
    if (u >= 1) {
      clearInterval(windFade);
      if (to === 0) windSfx.pause();
    }
  }, 50);
}

function startWind() {
  if (!windSfx) return Promise.resolve();
  windSfx.volume = 0;
  const p = windSfx.play();
  fadeWind(WIND_VOL, 2500);
  return p || Promise.resolve();
}

const sceneSvg = document.getElementById('scene');
const camera   = document.getElementById('camera');
const door     = document.getElementById('door');
const flash    = document.getElementById('flash');
const hint     = document.getElementById('hint');

const DOOR   = { x: 386, y: 258 };   
const CENTER = { x: 400, y: 306 };   
const ZOOM   = 16;
const DIALOG_ZOOM = 9;
const P_DIALOG = Math.log(DIALOG_ZOOM) / Math.log(ZOOM);

let busy = false;
let camAnim = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

function zoomRange(duration, pFrom, pTo) {
  const k = (sceneSvg.clientWidth || sceneSvg.getBoundingClientRect().width) / 800;
  const frames = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const p = pFrom + (pTo - pFrom) * easeInOut(u);
    const s = Math.pow(ZOOM, p);
    const px = DOOR.x + (CENTER.x - DOOR.x) * p;
    const py = DOOR.y + (CENTER.y - DOOR.y) * p;
    frames.push({
      offset: u,
      transform: `translate3d(${(px - s * DOOR.x) * k}px, ${(py - s * DOOR.y) * k}px, 0) scale(${s})`
    });
  }
  const prev = camAnim;
  camAnim = sceneSvg.animate(frames, { duration, easing: 'linear', fill: 'forwards' });
  if (prev) prev.cancel();
  return camAnim.finished;
}

function zoomToDoor(duration, reverse = false) {
  return reverse ? zoomRange(duration, 1, 0) : zoomRange(duration, 0, 1);
}

const DLG_SOUND = 'pop';

const dlgBlip = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, noise = null, n = 0;
  const wake = () => {
    if (!AC) return;
    if (!ctx) {
      ctx = new AC();
      noise = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, wake, { passive: true }));

  const env = (g, t, peak, attack, end) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + end);
  };

  const styles = {
    pop(t, base) {
      const f = base * 1.5 * (0.94 + Math.random() * 0.12);
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f * 0.7, t);
      o.frequency.exponentialRampToValueAtTime(f * 1.15, t + 0.03);
      env(g, t, 0.1, 0.004, 0.08);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + 0.1);
    },
    tap(t, base) {
      const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = noise;
      bp.type = 'bandpass';
      bp.frequency.value = 700 + Math.random() * 300;
      bp.Q.value = 3;
      env(g, t, 0.35, 0.002, 0.04);
      src.connect(bp).connect(g).connect(ctx.destination);
      src.start(t); src.stop(t + 0.05);
      const o = ctx.createOscillator(), g2 = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(base * 0.8, t);
      env(g2, t, 0.06, 0.003, 0.05);
      o.connect(g2).connect(ctx.destination);
      o.start(t); o.stop(t + 0.06);
    },
    chime(t, base) {
      const f = base * 2 * (n % 2 ? 1 : 1.25);
      [[1, 0.06], [3, 0.012]].forEach(([m, v]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f * m;
        env(g, t, v, 0.004, 0.12);
        o.connect(g).connect(ctx.destination);
        o.start(t); o.stop(t + 0.14);
      });
    }
  };

  return function (ch, base) {
    if (!ch || /[\s.,!?]/.test(ch)) return;
    if ((n++ % 3) !== 0) return;
    wake();
    if (!ctx || ctx.state !== 'running') return;
    (styles[DLG_SOUND] || styles.pop)(ctx.currentTime, base);
  };
})();

const dialog   = document.getElementById('dialog');
const dlgTyped = document.getElementById('dlg-typed');
const dlgRest  = document.getElementById('dlg-rest');
const DLG_LINES = ['aku ambilin cemilan dulu, kamu masuk duluan aja ya, awas kucing aku suka tidur di pintu'];
let dlgTimer = null;

function showDialog(lines) {
  return new Promise((resolve) => {
    let i = 0, pos = 0, full = false;
    const paint = () => {
      dlgTyped.textContent = lines[i].slice(0, pos);
      dlgRest.textContent = lines[i].slice(pos);
    };
    const finishLine = () => {
      clearInterval(dlgTimer);
      dlgTimer = null;
      pos = lines[i].length;
      paint();
      full = true;
      dialog.classList.add('done');
    };
    const startLine = () => {
      full = false;
      pos = 0;
      paint();
      dialog.classList.remove('done');
      dialog.setAttribute('aria-label', 'udeputi: ' + lines[i]);
      if (reduceMotion) { finishLine(); return; }
      dlgTimer = setInterval(() => {
        pos++;
        paint();
        dlgBlip(lines[i][pos - 1], 330);
        if (pos >= lines[i].length) finishLine();
      }, 34);
    };
    const close = () => {
      dialog.removeEventListener('click', advance);
      document.removeEventListener('keydown', onKey);
      dialog.classList.remove('show');
      setTimeout(() => { dialog.hidden = true; }, 380);
      resolve();
    };
    function advance(e) {
      if (e) e.stopPropagation();
      if (!full) { finishLine(); return; }
      if (i < lines.length - 1) { i++; startLine(); return; }
      close();
    }
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
    };
    dialog.addEventListener('click', advance);
    document.addEventListener('keydown', onKey);
    dialog.hidden = false;
    void dialog.offsetWidth;
    dialog.classList.add('show');
    startLine();
  });
}

const doorFront = document.getElementById('doorfront');
const fdDoor = document.getElementById('fd-door');
let entering = false;

async function openDoor(e) {
  if (busy || introOpen) return;
  busy = true;
  if (e) e.stopPropagation();
  hint.classList.add('gone');
  clearTimeout(calmTimer);
  setWind(1.6);
  fadeWind(0, 1200);

  sceneSvg.classList.add('is-open');

  if (reduceMotion) {
    await sleep(300);
    flash.style.transition = 'opacity .25s ease-in';
    flash.style.opacity = 1;
    await sleep(280);
    doorFront.classList.add('show');
    flash.style.transition = 'opacity .3s ease-out';
    flash.style.opacity = 0;
    await sleep(350);
  } else {
    await sleep(500);
    sceneSvg.classList.add('zooming', 'at-door');
    const zoom = zoomRange(1600, 0, P_DIALOG);
    await sleep(700);
    flash.style.transition = 'opacity .9s ease-in';
    flash.style.opacity = 1;
    await zoom;
    await sleep(100);

    doorFront.classList.add('show');
    void doorFront.offsetWidth;
    flash.style.transition = 'opacity .9s ease-out';
    flash.style.opacity = 0;
    await sleep(900);
  }

  await showDialog(DLG_LINES);
  await sleep(400);
  doorFront.classList.add('ready');
  try { fdDoor.focus({ preventScroll: true }); } catch (err) {}
}

async function enterRoom(e) {
  if (e) e.stopPropagation();
  if (entering || !doorFront.classList.contains('ready')) return;
  entering = true;
  doorFront.classList.remove('ready');
  doorFront.classList.add('open');

  if (reduceMotion) {
    flash.style.transition = 'opacity .3s ease-in';
    flash.style.opacity = 1;
    await sleep(350);
  } else {
    await sleep(650);
    flash.style.transition = 'opacity 1s ease-in';
    flash.style.opacity = 1;
    await sleep(1100);
  }

  window.location.href = 'index2.html';
}

fdDoor.addEventListener('click', enterRoom);
fdDoor.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    enterRoom(e);
  }
});

window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  if (camAnim) camAnim.cancel();
  sceneSvg.classList.remove('is-open', 'zooming', 'at-door');
  clearInterval(dlgTimer);
  dialog.classList.remove('show', 'done');
  dialog.hidden = true;
  doorFront.classList.remove('show', 'open', 'ready');
  entering = false;
  flash.style.transition = 'none';
  flash.style.opacity = 0;
  startWind().catch(() => {});
  hint.classList.remove('gone');
  setWind(1);
  busy = false;
  randomGust();
});

door.addEventListener('click', openDoor);
door.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openDoor(e);
  }
});

async function arriveFromRoom() {
  busy = true;
  hint.classList.add('gone');
  clearTimeout(calmTimer);
  setWind(1.2);

  sceneSvg.classList.add('is-open', 'no-anim');   
  flash.style.transition = 'none';
  flash.style.opacity = 1;
  root.classList.remove('arriving');
  try { history.replaceState(null, '', location.pathname); } catch (e) {}
  void sceneSvg.getBoundingClientRect();       

  if (reduceMotion) {
    flash.style.transition = 'opacity .4s ease-out';
    flash.style.opacity = 0;
    await sleep(300);
    sceneSvg.classList.remove('no-anim', 'is-open');
  } else {
    sceneSvg.classList.add('zooming');
    const zoom = zoomToDoor(2800, true);           
    await sleep(150);
    flash.style.transition = 'opacity 1.8s ease-out';
    flash.style.opacity = 0;                    
    await sleep(750);
    sceneSvg.classList.remove('no-anim', 'is-open'); 
    await zoom;
    if (camAnim) camAnim.cancel();
    sceneSvg.classList.remove('zooming');
  }

  hint.classList.remove('gone');
  busy = false;
  randomGust();
}

if (/[?&]exit=1/.test(location.search)) arriveFromRoom();

let introOpen = false;
const INTRO_LINES = ['wih, udah ga sabar ya main ke rumah aku? ketuk pintunya pelan pelan ya'];

async function playIntro() {
  introOpen = true;
  hint.classList.add('gone');
  await sleep(900);
  await showDialog(INTRO_LINES);
  introOpen = false;
  hint.classList.remove('gone');
}

const welcome = document.getElementById('welcome');
const welcomeStart = document.getElementById('welcome-start');

function startFromWelcome(e) {
  if (e) e.stopPropagation();
  welcome.classList.add('hide');
  startWind().catch(() => {});
  setTimeout(() => { welcome.hidden = true; }, 480);
  playIntro();
}

if (/[?&]exit=1/.test(location.search)) {
  welcome.hidden = true;
  startWind().catch(() => {
    window.addEventListener('pointerdown', () => startWind().catch(() => {}), { once: true });
  });
} else {
  introOpen = true;
  hint.classList.add('gone');
  welcomeStart.addEventListener('click', startFromWelcome, { once: true });
  try { welcomeStart.focus({ preventScroll: true }); } catch (err) {}
}