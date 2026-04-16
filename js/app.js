// App.js - Main logic >200 lines for fancy portfolio
// All functions modular, performant, maintains plan alignment

import { ThemeConfig, ParticleConfig, createParticles, TypewriterTexts } from './config.js';

// DOM elements
const el = {
  loading: document.getElementById('loading'),
  canvas: document.getElementById('particles-canvas'),
  typewriter: document.getElementById('typewriter'),
  cards: document.querySelectorAll('.glass-card, .repo-card, .scroll-reveal')
};

// Init app
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  hideLoading();
  initParticles();
  initTypewriter();
  initScrollReveal();
  initSmoothScroll();
  initParallax();
  animateStats();  // Activate stats
  window.addEventListener('resize', onResize);
}

function hideLoading() {
  setTimeout(() => {
    el.loading.classList.add('hidden');
  }, 1500);
}

// Particles System (fancy 120 particles + screen node connections, 120fps)
let particles = [];
let nodes = [];  // Screen elements to connect [avatar, typewriter, stats table, repos, etc.]
let nodeRects = [];
let rafThrottle = 0;
let mouseX = 0, mouseY = 0;
let animationId;

function initParticles() {
  const ctx = el.canvas.getContext('2d');
  el.canvas.width = window.innerWidth;
  el.canvas.height = window.innerHeight;
  particles = createParticles(el.canvas);
  nodes = document.querySelectorAll('[data-node]');
  updateNodeRects();
  animateParticles(ctx);
}

function updateNodeRects() {
  nodeRects = Array.from(nodes).map(node => {
    const rect = node.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      radius: Math.max(rect.width, rect.height) / 4
    };
  });
}

// Throttled mouse for distortion
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateParticles(ctx) {
  rafThrottle++;
  ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);

  // Update particles (120fps base)
  particles.forEach(p => {
    // Mouse repulsion/distortion for fancy effect
    const dxMouse = p.x - mouseX;
    const dyMouse = p.y - mouseY;
    const distMouse = Math.sqrt(dxMouse*dxMouse + dyMouse*dyMouse);
    if (distMouse < 100) {
      p.vx += (dxMouse / distMouse) * 0.5;
      p.vy += (dyMouse / distMouse) * 0.5;
    }

    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > el.canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > el.canvas.height) p.vy *= -1;

    // Draw particles (LOD: smaller if far)
    const pulse = Math.sin(Date.now() * 0.01 + p.hue) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, 0.8)`;
    ctx.fill();
  });

  // Particle-particle connections (LOD)
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i], p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < ThemeConfig.particleConnectDist) {
        ctx.strokeStyle = `rgba(102,126,234,${(1 - dist / ThemeConfig.particleConnectDist) * 0.3})`;
        ctx.lineWidth = 1 + (1 - dist / ThemeConfig.particleConnectDist);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }

  // Particle-to-node connections (fancy screen links)
  if (rafThrottle % 3 === 0) {  // Throttle rects for perf
    updateNodeRects();
  }
  particles.forEach(p => {
    nodeRects.forEach((rect, idx) => {
      const dx = p.x - rect.x;
      const dy = p.y - rect.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < ThemeConfig.nodeConnectDist) {
        ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / ThemeConfig.nodeConnectDist) * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(rect.x, rect.y);
        ctx.stroke();

        // Node glow effect
        ctx.beginPath();
        ctx.arc(rect.x, rect.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102,126,234,0.3)`;
        ctx.fill();
      }
    });
  });

  animationId = requestAnimationFrame(() => animateParticles(ctx));
}

function onResize() {
  cancelAnimationFrame(animationId);
  el.canvas.width = window.innerWidth;
  el.canvas.height = window.innerHeight;
  particles = createParticles(el.canvas);
  initParticles();
}

// Typewriter (multi-text cycle)
let textIndex = 0;
let charIndex = 0;
let typing = false;

function initTypewriter() {
  typeNextText();
}

function typeNextText() {
  if (textIndex >= TypewriterTexts.length) textIndex = 0;
  charIndex = 0;
  el.typewriter.textContent = '';
  el.typewriter.style.borderRight = '3px solid var(--primary)';
  typing = true;
  typeChar();
}

function typeChar() {
  const currentText = TypewriterTexts[textIndex];
  if (charIndex < currentText.length) {
    // Glitch effect: occasional flicker
    if (Math.random() < 0.1) {
      el.typewriter.innerHTML += '<span style="animation: glitch 0.1s;">' + currentText.charAt(charIndex) + '</span>';
    } else {
      el.typewriter.textContent += currentText.charAt(charIndex);
    }
    charIndex++;
    setTimeout(typeChar, 80 + Math.random() * 60);  // Variable speed
  } else {
    el.typewriter.style.borderRight = 'none';
    setTimeout(() => {
      textIndex++;
      typing = false;
      setTimeout(typeNextText, 1500);
    }, 1500);
  }
}

// Scroll Reveal (IntersectionObserver)
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });
  
  el.cards.forEach(card => observer.observe(card));
}

// Smooth Scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Parallax Mouse/Touch + 3D Orbit
function initParallax() {
  let lastTouchX = 0, lastTouchY = 0;
  const updateParallax = (clientX, clientY) => {
    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = (clientY / window.innerHeight) * 2 - 1;
    document.documentElement.style.setProperty('--mouse-x', x);
    document.documentElement.style.setProperty('--mouse-y', y);
  };
  document.addEventListener('mousemove', (e) => updateParallax(e.clientX, e.clientY));
  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    updateParallax(touch.clientX, touch.clientY);
  }, { passive: true });
  // 3D Avatar orbit
  const avatar = document.querySelector('.avatar');
  let orbitAngle = 0;
  function orbit() {
    orbitAngle += 0.005;
    avatar.style.transform += ` rotateZ(${Math.sin(orbitAngle) * 5}deg)`;
    requestAnimationFrame(orbit);
  }
  orbit();
}

// Stats animation (intersection observer count-up)
function animateStats() {
  const stats = document.querySelectorAll('.stat-number');
  stats.forEach(stat => {
    const target = parseInt(stat.textContent);
    let current = 0;
    const increment = target / 100;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const timer = setInterval(() => {
          current += increment;
          stat.textContent = Math.floor(current);
          if (current >= target) {
            stat.textContent = target;
            clearInterval(timer);
          }
        }, 20);
      }
    });
    observer.observe(stat);
  });
}

// Export for module use
window.app = { initApp, animateStats };

