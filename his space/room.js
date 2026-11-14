
const flash = document.getElementById('flash');
requestAnimationFrame(() => requestAnimationFrame(() => {
  flash.style.transition = 'opacity 1.4s ease-out';
  flash.style.opacity = 0;
}));


const handH = document.getElementById('hand-h');
const handM = document.getElementById('hand-m');
const handS = document.getElementById('hand-s');

function tickClock() {
  const d = new Date();
  const sec = d.getSeconds();
  const min = d.getMinutes() + sec / 60;
  const hr  = (d.getHours() % 12) + min / 60;
  handS.setAttribute('transform', `rotate(${sec * 6})`);
  handM.setAttribute('transform', `rotate(${min * 6})`);
  handH.setAttribute('transform', `rotate(${hr * 30})`);
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