/**
 * Merch Section — Diagonal Sound Wave Background + Red Particles
 * Slow-moving diagonal waveforms with glowing red sparks/particles.
 */
(function () {
    'use strict';

    let canvas, ctx, W, H, raf;

    // ── Wave definitions — SLOW speeds, diagonal angle ───────────────────────
    // Waves travel diagonally: we rotate the canvas context by ANGLE degrees
    const ANGLE = -18 * (Math.PI / 180); // ~18° diagonal tilt

    const waves = [
        // Deep background — very wide, ultra slow
        { color: '255,255,255', alpha: 0.06, lineWidth: 2.5, amplitude: 0.30, frequency: 1.0,  speed: 0.000005, phase: 0 },
        { color: '200,220,255', alpha: 0.05, lineWidth: 2,   amplitude: 0.24, frequency: 0.75, speed: 0.000004, phase: 2.1 },

        // Mid layer
        { color: '255,255,255', alpha: 0.13, lineWidth: 2,   amplitude: 0.20, frequency: 1.8,  speed: 0.000008, phase: 0.8 },
        { color: '220,235,255', alpha: 0.11, lineWidth: 1.5, amplitude: 0.16, frequency: 1.4,  speed: 0.000006, phase: 3.5 },
        { color: '255,255,255', alpha: 0.09, lineWidth: 1.5, amplitude: 0.13, frequency: 2.2,  speed: 0.000010, phase: 1.4 },

        // Detail lines
        { color: '255,255,255', alpha: 0.17, lineWidth: 1,   amplitude: 0.09, frequency: 3.5,  speed: 0.000012, phase: 0.3 },
        { color: '200,215,255', alpha: 0.14, lineWidth: 1,   amplitude: 0.08, frequency: 4.0,  speed: 0.000014, phase: 2.7 },
        { color: '255,255,255', alpha: 0.12, lineWidth: 0.8, amplitude: 0.06, frequency: 5.0,  speed: 0.000016, phase: 4.1 },

        // Accent bright lines
        { color: '255,255,255', alpha: 0.22, lineWidth: 0.8, amplitude: 0.05, frequency: 6.5,  speed: 0.000018, phase: 1.0 },
        { color: '230,240,255', alpha: 0.19, lineWidth: 0.8, amplitude: 0.04, frequency: 8.0,  speed: 0.000020, phase: 5.2 },
    ];

    // ── Particle system ───────────────────────────────────────────────────────
    const MAX_PARTICLES = 80;
    const particles = [];

    function spawnParticle() {
        // Spawn along a random wave position
        const waveIdx = Math.floor(Math.random() * waves.length);
        const w = waves[waveIdx];
        const nx = Math.random();
        const env = Math.sin(nx * Math.PI);
        const amp = H * w.amplitude;
        const cy  = H * 0.5;

        // Compute wave y at this x (using current time approximation)
        const t = performance.now();
        const x = nx * W;
        const y = cy + Math.sin(nx * Math.PI * 2 * w.frequency + w.phase + t * w.speed * 1e6) * amp * env;

        // Convert from rotated canvas space back to screen space
        const cosA = Math.cos(-ANGLE), sinA = Math.sin(-ANGLE);
        const cx2 = W / 2, cy2 = H / 2;
        const rx = cosA * (x - cx2) - sinA * (y - cy2) + cx2;
        const ry = sinA * (x - cx2) + cosA * (y - cy2) + cy2;

        particles.push({
            x: rx,
            y: ry,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -Math.random() * 1.2 - 0.4,  // drift upward
            life: 1.0,
            decay: Math.random() * 0.008 + 0.004,
            size: Math.random() * 2.5 + 0.8,
            // Red-orange-white palette
            hue: Math.random() < 0.6 ? 0 : (Math.random() < 0.5 ? 15 : 35),
            sat: 90 + Math.random() * 10,
            lit: 55 + Math.random() * 30,
        });
    }

    function updateParticles() {
        // Spawn a few per frame
        const spawnCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < spawnCount; i++) {
            if (particles.length < MAX_PARTICLES) spawnParticle();
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x    += p.vx;
            p.y    += p.vy;
            p.vy   -= 0.015; // slight upward acceleration (float up)
            p.life -= p.decay;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function drawParticles() {
        for (const p of particles) {
            const alpha = p.life * p.life; // ease out
            ctx.save();
            // Outer glow
            ctx.shadowBlur  = 8;
            ctx.shadowColor = `hsla(${p.hue},${p.sat}%,${p.lit}%,${alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue},${p.sat}%,${p.lit}%,${alpha})`;
            ctx.fill();
            ctx.restore();
        }
    }

    // ── Resize ────────────────────────────────────────────────────────────────
    function resize() {
        const section = canvas.parentElement;
        W = canvas.width  = section.offsetWidth  || window.innerWidth;
        H = canvas.height = section.offsetHeight || 500;
    }

    // ── Draw one wave (in rotated space) ──────────────────────────────────────
    function drawWave(w, t) {
        const cy  = H * 0.5;
        const amp = H * w.amplitude;

        ctx.beginPath();
        ctx.lineWidth = w.lineWidth;

        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0,    `rgba(${w.color},0)`);
        grad.addColorStop(0.10, `rgba(${w.color},${w.alpha})`);
        grad.addColorStop(0.5,  `rgba(${w.color},${Math.min(1, w.alpha * 1.6)})`);
        grad.addColorStop(0.90, `rgba(${w.color},${w.alpha})`);
        grad.addColorStop(1,    `rgba(${w.color},0)`);
        ctx.strokeStyle = grad;

        const step = 2;
        for (let x = 0; x <= W; x += step) {
            const nx  = x / W;
            const env = Math.sin(nx * Math.PI);
            const y   = cy + Math.sin(nx * Math.PI * 2 * w.frequency + w.phase + t * w.speed * 1e6) * amp * env;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    function drawGlowWave(w, t) {
        const cy  = H * 0.5;
        const amp = H * w.amplitude;

        ctx.save();
        ctx.filter    = `blur(${Math.max(3, w.lineWidth * 5)}px)`;
        ctx.lineWidth = w.lineWidth * 3.5;

        const ga   = w.alpha * 0.5;
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0,    `rgba(${w.color},0)`);
        grad.addColorStop(0.10, `rgba(${w.color},${ga})`);
        grad.addColorStop(0.5,  `rgba(${w.color},${Math.min(1, ga * 1.6)})`);
        grad.addColorStop(0.90, `rgba(${w.color},${ga})`);
        grad.addColorStop(1,    `rgba(${w.color},0)`);
        ctx.strokeStyle = grad;

        ctx.beginPath();
        const step = 4;
        for (let x = 0; x <= W; x += step) {
            const nx  = x / W;
            const env = Math.sin(nx * Math.PI);
            const y   = cy + Math.sin(nx * Math.PI * 2 * w.frequency + w.phase + t * w.speed * 1e6) * amp * env;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    // ── Animation loop ────────────────────────────────────────────────────────
    function animate(t) {
        ctx.clearRect(0, 0, W, H);

        // Draw waves in rotated space
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(ANGLE);
        ctx.translate(-W / 2, -H / 2);

        for (const w of waves) drawGlowWave(w, t);
        for (const w of waves) drawWave(w, t);

        ctx.restore();

        // Particles in screen space (on top of waves)
        updateParticles();
        drawParticles();

        raf = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (!raf) raf = requestAnimationFrame(animate);
    }

    function stopAnimation() {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    // ── Setup ─────────────────────────────────────────────────────────────────
    function setup() {
        canvas = document.getElementById('merch-soundwave');
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        const ro = new ResizeObserver(() => resize());
        ro.observe(canvas.parentElement);

        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => e.isIntersecting ? startAnimation() : stopAnimation());
        }, { threshold: 0.05 });
        io.observe(canvas.parentElement);

        document.addEventListener('pageLoaded', () => {
            resize();
            startAnimation();
        });

        resize();
        if (canvas.parentElement.offsetHeight > 0) startAnimation();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();
