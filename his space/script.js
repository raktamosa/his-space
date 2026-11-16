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


const sceneSvg = document.getElementById('scene');
const camera   = document.getElementById('camera');
const door     = document.getElementById('door');
const flash    = document.getElementById('flash');
const hint     = document.getElementById('hint');

const DOOR   = { x: 386, y: 258 };   
const CENTER = { x: 400, y: 306 };   
const ZOOM   = 16;

let busy = false;
let camAnim = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

function zoomToDoor(duration, reverse = false) {
  const frames = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const p = reverse ? 1 - easeInOut(u) : easeInOut(u);
    const s = Math.pow(ZOOM, p);
    const px = DOOR.x + (CENTER.x - DOOR.x) * p;
    const py = DOOR.y + (CENTER.y - DOOR.y) * p;
    frames.push({
      offset: u,
      transform: `translate(${px - s * DOOR.x}px, ${py - s * DOOR.y}px) scale(${s})`
    });
  }
  camAnim = camera.animate(frames, { duration, easing: 'linear', fill: 'forwards' });
  return camAnim.finished;
}

async function openDoor(e) {
  if (busy) return;
  busy = true;
  if (e) e.stopPropagation();
  hint.classList.add('gone');
  clearTimeout(calmTimer);
  setWind(1.6);

  sceneSvg.classList.add('is-open');             

  if (reduceMotion) {
    await sleep(300);
  } else {
    await sleep(500);                            
    sceneSvg.classList.add('zooming');
    const zoom = zoomToDoor(2800);               
    await sleep(1700);

    flash.style.transition = 'opacity 1s ease-in';
    flash.style.opacity = 1;                    
    await zoom;
    await sleep(100);
  }

  window.location.href = 'index2.html';        
}

window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  if (camAnim) camAnim.cancel();
  sceneSvg.classList.remove('is-open', 'zooming');
  flash.style.transition = 'none';
  flash.style.opacity = 0;
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