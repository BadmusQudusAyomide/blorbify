/* ============================================================
   CELEBRATION — lightweight canvas confetti burst, no dependency.
   Call only from event handlers (never a useEffect): main.jsx wraps
   the app in StrictMode, which double-invokes effects in dev and
   would double-fire an effect-driven call.
   ============================================================ */

let activeSession = null;

function resolveColor(varName, fallback) {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

function stopActiveSession() {
  if (!activeSession) return;
  cancelAnimationFrame(activeSession.rafId);
  clearTimeout(activeSession.timeoutId);
  window.removeEventListener('resize', activeSession.onResize);
  activeSession.canvas.remove();
  activeSession = null;
}

export function launchConfetti({ particleCount = 140, originY = 0.25 } = {}) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  stopActiveSession();

  const colors = [
    resolveColor('--signal', '#AFFF00'),
    resolveColor('--signal-dim', '#8FDD00'),
    resolveColor('--gold', '#FFD166'),
    resolveColor('--paper', '#F6F8F1'),
    resolveColor('--ink', '#192328'),
  ];

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const sizeCanvas = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  sizeCanvas();

  const onResize = () => sizeCanvas();
  window.addEventListener('resize', onResize);

  const width = () => window.innerWidth;
  const height = () => window.innerHeight;

  const cannons = [width() * 0.2, width() * 0.8];
  const gravity = 0.32;
  const lifespan = 2200;
  const startedAt = performance.now();

  const particles = Array.from({ length: particleCount }, (_, i) => {
    const cannonX = cannons[i % cannons.length];
    const direction = cannonX < width() / 2 ? 1 : -1;
    const angleFromVertical = (20 + Math.random() * 35) * (Math.PI / 180);
    const speed = 9 + Math.random() * 8;
    return {
      x: cannonX,
      y: height() * originY,
      vx: Math.sin(angleFromVertical) * speed * direction,
      vy: -Math.cos(angleFromVertical) * speed,
      size: 6 + Math.random() * 4,
      isCircle: Math.random() > 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
    };
  });

  const tick = (now) => {
    const elapsed = now - startedAt;
    ctx.clearRect(0, 0, width(), height());

    let anyAlive = false;
    const fadeStart = lifespan - 500;
    const alpha = elapsed > fadeStart ? Math.max(0, 1 - (elapsed - fadeStart) / 500) : 1;

    particles.forEach((p) => {
      p.vy += gravity;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      if (p.y < height() + 40) anyAlive = true;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.isCircle) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    });

    if (anyAlive && elapsed < lifespan) {
      activeSession.rafId = requestAnimationFrame(tick);
    } else {
      stopActiveSession();
    }
  };

  activeSession = {
    canvas,
    onResize,
    rafId: requestAnimationFrame(tick),
    timeoutId: setTimeout(stopActiveSession, 2600),
  };
}
