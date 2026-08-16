(function () {
  const container = document.getElementById("particles-bg");
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.style.pointerEvents = "none";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const COLORS = ["#3b82f6", "#06b6d4", "#93c5fd"];
  const LINK_DISTANCE = 140;
  const LINK_COLOR = "59, 130, 246";
  let particles = [];
  let width, height;

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    width = Math.max(rect.width, window.innerWidth);
    height = Math.max(rect.height, document.documentElement.scrollHeight, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const count = Math.min(Math.round((width * height) / 18000), 400);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.2 + Math.random() * 1.8,
      color: hexToRgb(COLORS[Math.floor(Math.random() * COLORS.length)]),
      alpha: 0.35 + Math.random() * 0.45,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          ctx.strokeStyle = `rgba(${LINK_COLOR}, ${0.15 * (1 - dist / LINK_DISTANCE)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  let resizeTimer = null;
  function scheduleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }

  window.addEventListener("resize", scheduleResize);
  if (window.ResizeObserver) {
    new ResizeObserver(scheduleResize).observe(document.body);
  }
  window.addEventListener("load", scheduleResize);

  resize();
  requestAnimationFrame(step);
})();
