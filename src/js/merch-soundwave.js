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

    // t is in milliseconds from requestAnimationFrame.
    // speed * t gives the phase offset. At speed=0.0003, one full cycle = ~21 seconds.
    // yOffset spreads waves across the full height instead of all clustering at 0.5
    const waves = [
        // Spread across the canvas vertically — each wave at a different y position
        { color: '0,102,255',   alpha: 0.35, lineWidth: 3,   amplitude: 0.06, frequency: 1.0,  speed: 0.00020, phase: 0,   yOffset: 0.10 },
        { color: '0,136,255',   alpha: 0.28, lineWidth: 2.5, amplitude: 0.05, frequency: 0.75, speed: 0.00015, phase: 2.1, yOffset: 0.22 },
        { color: '0,170,255',   alpha: 0.45, lineWidth: 2.5, amplitude: 0.06, frequency: 1.8,  speed: 0.00025, phase: 0.8, yOffset: 0.34 },
        { color: '0,102,255',   alpha: 0.40, lineWidth: 2,   amplitude: 0.05, frequency: 1.4,  speed: 0.00018, phase: 3.5, yOffset: 0.46 },
        { color: '30,144,255',  alpha: 0.55, lineWidth: 2,   amplitude: 0.06, frequency: 2.2,  speed: 0.00030, phase: 1.4, yOffset: 0.50 },
        { color: '0,170,255',   alpha: 0.45, lineWidth: 1.5, amplitude: 0.05, frequency: 3.5,  speed: 0.00035, phase: 0.3, yOffset: 0.54 },
        { color: '0,102,255',   alpha: 0.40, lineWidth: 1.5, amplitude: 0.05, frequency: 4.0,  speed: 0.00040, phase: 2.7, yOffset: 0.66 },
        { color: '0,136,255',   alpha: 0.35, lineWidth: 1.2, amplitude: 0.04, frequency: 5.0,  speed: 0.00045, phase: 4.1, yOffset: 0.78 },
        { color: '0,170,255',   alpha: 0.60, lineWidth: 1.2, amplitude: 0.04, frequency: 6.5,  speed: 0.00050, phase: 1.0, yOffset: 0.88 },
        { color: '30,144,255',  alpha: 0.55, lineWidth: 1,   amplitude: 0.03, frequency: 8.0,  speed: 0.00055, phase: 5.2, yOffset: 0.96 },
    ];



    // ── Resize ────────────────────────────────────────────────────────────────
    function resize() {
        const section = canvas.parentElement;
        W = canvas.width  = section.offsetWidth  || window.innerWidth;
        H = canvas.height = section.offsetHeight || 500;
    }

    // ── Draw one wave (in rotated space) ──────────────────────────────────────
    function drawWave(w, t) {
        const cy  = H * (w.yOffset !== undefined ? w.yOffset : 0.5);
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
            const y   = cy + Math.sin(nx * Math.PI * 2 * w.frequency + w.phase + t * w.speed) * amp * env;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    function drawGlowWave(w, t) {
        const cy  = H * (w.yOffset !== undefined ? w.yOffset : 0.5);
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
            const y   = cy + Math.sin(nx * Math.PI * 2 * w.frequency + w.phase + t * w.speed) * amp * env;
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
