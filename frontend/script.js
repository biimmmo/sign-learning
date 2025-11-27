// script.js: handles UI, GSAP animations, dark mode, quiz interactions, and optional backend calls.

const API_BASE = window.API_BASE = "http://localhost:4000";
// If you deploy a backend, set window.API_BASE via a small inline script or replace null with your URL.
const hero = document.querySelector('.hero-title');
if (hero) {
  gsap.from(hero, { y: 20, opacity: 0, duration: 0.6 });
}
const cards = document.querySelectorAll('.card');
if (cards.length > 0) {
  gsap.utils.toArray(cards).forEach((card, i) => {
    gsap.from(card, { y: 30, opacity: 0, delay: 0.1 * i });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initIndexPage();
  initLessonPage();
  initGSAP();
  document.getElementById?.('refreshData')?.addEventListener('click', () => location.reload());
});

function initDarkMode(){
  const btns = document.querySelectorAll('#darkToggle');
  const saved = localStorage.getItem('theme');
  if(saved === 'dark') document.documentElement.setAttribute('data-theme','dark');
  btns.forEach(b => b.addEventListener('click', toggleTheme));
}

function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme');
  if(cur === 'dark'){
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme','light');
    this && (this.textContent = 'Dark');
  } else {
    document.documentElement.setAttribute('data-theme','dark');
    localStorage.setItem('theme','dark');
    this && (this.textContent = 'Light');
  }
}

// Load index cards from a local array (keeps static)
const LESSONS = [
  { slug:'alphabet', title:'Alphabet Dasar', desc:'Huruf A–E', img:'images/alphabet.png', file:'lesson1.html' },
  { slug:'numbers', title:'Angka Dasar', desc:'Angka 1–5', img:'images/numbers.png', file:'lesson2.html' },
  { slug:'greetings', title:'Sapaan Dasar', desc:'Hello / Thank You / Sorry', img:'images/greetings.png', file:'lesson3.html' }
];

function initIndexPage(){
  const cards = document.getElementById('cards');
  if(!cards) return;
  LESSONS.forEach((l, i) => {
    const el = document.createElement('a');
    el.className = 'card';
    el.href = l.file;
    el.innerHTML = `<img src="${l.img}" alt="${l.title}"><h3>${l.title}</h3><p>${l.desc}</p>`;
    cards.appendChild(el);
  });
}

// Lesson page: attach quiz listeners & optionally POST progress to backend
function initLessonPage(){
  const opts = document.querySelectorAll('.options .opt');
  if(!opts || opts.length === 0) return;
  opts.forEach(btn => btn.addEventListener('click', async (e) => {
    const correct = btn.getAttribute('data-correct') === 'true';
    const result = document.getElementById('result');
    if(correct){
      result.textContent = '✔ Benar!';
      result.style.color = 'green';
    } else {
      result.textContent = '✘ Salah.';
      result.style.color = 'red';
    }

    // Save progress locally
    try {
      const lessonTitle = document.querySelector('.brand')?.textContent || location.pathname;
      const key = `progress:${lessonTitle}`;
      const payload = { lesson: lessonTitle, correct: !!correct, timestamp: Date.now() };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch(e){ console.warn('local progress error', e); }

    // Optional: POST to backend if API_BASE defined
    if(API_BASE){
      try {
        await fetch(API_BASE + '/api/progress', {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({
            user_id: 'demo-user', // demo only
            lesson_slug: location.pathname.split('/').pop() || location.pathname,
            completed: true,
            score: correct ? 100 : 0
          })
        });
      } catch(err){
        console.warn('Failed to send progress to backend', err);
      }
    }
  }));
}


// GSAP animations (works both on index and lesson pages)
function initGSAP(){
  if(typeof gsap === 'undefined') return;
    const hero = document.querySelector('.hero-title');
  if (hero) {
    gsap.from(hero, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    });
  }
  gsap.utils.toArray('.card').forEach((card, i) => {
    gsap.from(card, { y: 30, opacity:0, duration:0.6, delay: 0.12 * i, ease:'power2.out' });
  });

  // Scroll reveal for lesson intro images (if present)
  if (gsap && gsap.registerPlugin) {
    try { gsap.registerPlugin(ScrollTrigger); } catch(e){}
    gsap.utils.toArray('.lesson-intro').forEach(el => {
      gsap.from(el.querySelectorAll('.lesson-img, h2, p'), {
        y: 20, opacity:0, duration:0.6, stagger:0.12,
        scrollTrigger: { trigger: el, start: 'top 80%' }
      });
    });
  }
}
