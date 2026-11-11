const pages = [...document.querySelectorAll('.page')];

const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const musicControls = document.getElementById('musicControls');
const musicVolume = document.getElementById('musicVolume');
const musicStatus = document.getElementById('musicStatus');
const letterCard = document.querySelector('.letter-card');
let fadeFrame = 0;

function updateMusicButton(isPlaying, message){
  musicToggle.textContent = isPlaying ? '♫ Pause music' : '♫ Play music';
  musicToggle.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicControls.hidden = false;
  musicStatus.textContent = message;
}

function showMusicUnavailable(){
  musicControls.hidden = false;
  musicToggle.disabled = true;
  musicVolume.disabled = true;
  musicToggle.textContent = '♫ Music unavailable';
  musicToggle.setAttribute('aria-label', 'Background music unavailable');
  musicStatus.textContent = 'Background music could not be loaded.';
}

function fadeInMusic(){
  cancelAnimationFrame(fadeFrame);
  const targetVolume = Number(musicVolume.value);
  const startTime = performance.now();
  const duration = 1800;
  backgroundMusic.volume = 0;

  function fadeStep(now){
    const progress = Math.min((now - startTime) / duration, 1);
    backgroundMusic.volume = targetVolume * progress;
    if(progress < 1){
      fadeFrame = requestAnimationFrame(fadeStep);
    }
  }

  fadeFrame = requestAnimationFrame(fadeStep);
}

async function playMusic(){
  try{
    backgroundMusic.volume = 0;
    await backgroundMusic.play();
    updateMusicButton(true, 'Background music is playing.');
    fadeInMusic();
  } catch(error){
    if(backgroundMusic.error){
      showMusicUnavailable();
    } else {
      updateMusicButton(false, 'Music could not start. Tap Play music to try again.');
      console.error('Background music could not start:', error);
    }
  }
}

backgroundMusic.addEventListener('error', () => {
  showMusicUnavailable();
  console.error('Background music file could not be loaded.');
});

musicToggle.addEventListener('click', () => {
  if(backgroundMusic.paused){
    playMusic();
  } else {
    cancelAnimationFrame(fadeFrame);
    backgroundMusic.pause();
    updateMusicButton(false, 'Background music paused.');
  }
});

musicVolume.addEventListener('input', () => {
  const volume = Number(musicVolume.value);
  if(!backgroundMusic.paused){
    cancelAnimationFrame(fadeFrame);
  }
  backgroundMusic.volume = volume;
  musicVolume.setAttribute('aria-valuetext', `${Math.round(volume * 100)}%`);
});

musicVolume.setAttribute('aria-valuetext', `${Math.round(Number(musicVolume.value) * 100)}%`);

function revealLetter(){
  letterCard.classList.remove('is-revealing');
  requestAnimationFrame(() => letterCard.classList.add('is-revealing'));
}

function showPage(id){
  pages.forEach(page => page.classList.toggle('active', page.id === id));
  if(id === 'letter'){
    revealLetter();
  }
  window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('[data-go]').forEach(button => {
  button.addEventListener('click', () => {
    const activePage = document.querySelector('.page.active');
    if(button.dataset.go === 'question' && activePage && activePage.id === 'intro'){
      playMusic();
    }
    showPage(button.dataset.go);
  });
});

const noBtn = document.getElementById('noBtn');
const noHint = document.getElementById('noHint');
let noLocked = false;
noBtn.addEventListener('click', () => {
  if(noLocked) return;
  noLocked = true;
  noBtn.classList.add('locked');
  noBtn.disabled = true;
  noBtn.textContent = 'Locked 🔒';
  noHint.textContent = 'Ay, bawal na! YES na lang ang choice mo. ♡';
});
document.getElementById('yesBtn').addEventListener('click', () => showPage('surname'));

document.getElementById('codeForm').addEventListener('submit', event => {
  event.preventDefault();
  const value = document.getElementById('surnameCode').value.trim().toUpperCase();
  const hint = document.getElementById('codeHint');
  if(value === 'GUEVARRA'){
    hint.textContent = 'Correct! A little surprise is waiting... ♡';
    setTimeout(() => showPage('passed'), 550);
  } else {
    hint.textContent = 'Not quite, darling. Try again. ♡';
    document.getElementById('surnameCode').value = '';
    document.getElementById('surnameCode').focus();
  }
});
document.getElementById('backToTop').addEventListener('click', () => showPage('intro'));

// Ambient live sparkle field: gentle drifting lights, not a static background.
const canvas = document.getElementById('sparkles');
const ctx = canvas.getContext('2d');
let particles = [];
function resize(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  particles = Array.from({length: Math.min(65, Math.floor(innerWidth/12))}, () => ({
    x:Math.random()*innerWidth, y:Math.random()*innerHeight,
    r:Math.random()*1.5+.35, speed:Math.random()*.28+.08,
    phase:Math.random()*Math.PI*2, tint:Math.random()>.5?'168,213,162':'184,160,232'
  }));
}
let tick = 0;
function animate(){
  ctx.clearRect(0,0,innerWidth,innerHeight); tick += .012;
  for(const p of particles){
    p.y -= p.speed; p.x += Math.sin(tick+p.phase)*.16;
    if(p.y < -5){p.y=innerHeight+5;p.x=Math.random()*innerWidth;}
    const alpha = .18 + (Math.sin(tick*2+p.phase)+1)*.2;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(${p.tint},${alpha})`;ctx.fill();
  }
  requestAnimationFrame(animate);
}
window.addEventListener('resize',resize);
resize(); animate();
