/**
 * Merch Section — Sound Wave Background Animation
 * Multi-layer animated waveforms with glow, rendered on canvas.
 */
(function () {
    'use strict';

    const canvas = document.getElementById('merch-soundwave');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, raf;

    // ── Wave definitions ──────────────────────────────────────────────────────
    // Each wave: { color, alpha, lineWidth, amplitude, frequency, speed, yOffset, phase }
    const waves = [
        // Deep background — wide, slow, very faint
        { color: '0,102,255',  alpha: 0.06, lineWidth: 2,   amplitude: 0.28, frequency: 1.2,  speed: 0.0004, yOffset: 0.50, phase: 0 },
        { color: '0,170,255',  alpha: 0.05, lineWidth: 1.5, amplitude: 0.22, frequency: 0.9,  speed: 0.0003, yOffset: 0.50, phase: 2.1 },

        // Mid layer — medium energy
        { color: '0,102,255',  alpha: 0.14, lineWidth: 1.5, amplitude: 0.18, frequency: 2.2,  speed: 0.0007, yOffset: 0.50, phase: 0.8 },
        { color: '0,170,255',  alpha: 0.12, lineWidth: 1.5, amplitude: 0.15, frequency: 1.8,  speed: 0.0006, yOffset: 0.50, phase: 3.5 },
        { color: '80,160,255', alpha: 0.10, lineWidth: 1,   amplitude: 0.12, frequency: 2.8,  speed: 0.0009, yOffset: 0.50, phase: 1.4 },

        // High-frequency detail lines
        { color: '0,200,255',  alpha: 0.18, lineWidth: 1,   amplitude: 0.08, frequency: 4.5,  speed: 0.0012, yOffset: 0.50, phase: 0.3 },
        { color: '0,102,255',  alpha: 0.15, lineWidth: 1,   amplitude: 0.07, frequency: 5.2,  speed: 0.0014, yOffset: 0.50, phase: 2.7 },
        { color: '100,180,255',alpha: 0.12, lineWidth: 0.8, amplitude: 0.06, frequency: 6.8,  speed: 0.0016, yOffset: 0.50, phase: 4.1 },

        // Accent — bright thin lines that pop
        { color: '180,220,255',alpha: 0.22, lineWidth: 0.8, amplitude: 0.05, frequency: 8.0,  speed: 0.0018, yOffset: 0.50, phase: 1.0 },
        { color: '0,220,255',  alpha: 0.20, lineWidth: 0.8, amplitude: 0.04, frequency: 10.0, speed: 0.0022, yOffset: 0.50, phase: 5.2 },
    ];

    // ── Resize ────────────────────────────────────────────────────────────────
    function resize() {
        const section = canvas.parentElement;
        W = canvas.width  = section.offsetWidth;
        H = canvas.height = section.offsetHeight;
    }

    // ── Draw one wave ─────────────────────────────────────────────────────────
    function drawWave(w, t) {
        const cy = H * w.yOffset;
        const amp = H * w.amplitude;

        ctx.beginPath();
        ctx.lineWidth = w.lineWidth;

        // Build gradient along the wave for a "glow fade at edges" look
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0,    `rgba(${w.color},0)`);
        grad.addColorStop(0.15, `rgba(${w.color},${w.alpha})`);
        grad.addColorStop(0.5,  `rgba(${w.color},${w.alpha * 1.4})`);
        grad.addColorStop(0.85, `rgba(${w.color},${w.alpha})`);
        grad.addColorStop(1,    `rgba(${w.color},0)`);
        ctx.strokeStyle = grad;

        // Draw the sine wave
        const step = 2; // px per sample — smooth enough, fast enough
        for (let x = 0; x <= W; x += step) {
            const nx = x / W; // 0..1
            // Envelope: fade amplitude near edges
            const env = Math.sin(nx * Math.PI);
            const y = cy + Math.sin(nx * Math.PI * 2 * w.frequency + w.phase + t * w.speed * 1e6) * amp * env;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // ── Glow pass (blur + re-draw at lower alpha) ─────────────────────────────
    function drawGlowWave(w, t) {
        const cy = H * w.yOffset;
        const amp = H * w.amplitude;

        ctx.save();
        ctx.filter = `blur(${Math.max(2, w.lineWidth * 3)}px)`;
        ctx.beginPath();
        ctx.lineWidth = w.lineWidth * 2.5;

        const grad = ctx.createLinearGradient(0, 0, W, 0);
        const ga = w.alpha * 0.5;
        grad.addColorStop(0,    `rgba(${w.color},0)`);
        grad.addColorStop(0.15, `rgba(${w.color},${ga})`);
        grad.addColorStop(0.5,  `rgba(${w.color},${ga * 1.4})`);
        grad.addColorStop(0.85, `rgba(${w.color},${ga})`);
        grad.addColorStop(1,    `rgba(${w.color},0)`);
        ctx.strokeStyle = grad;

        const step = 4;
        for (let x = 0; x <= W; x += step) {
            const nx = x / W;
            const env = Math.sin(nx * Math.PI);
            const y = cy + Math.sin(nx * Math.PI * 2 * w.frequency + w.phase + t * w.speed * 1e6) * amp * env;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    // ── Animation loop ────────────────────────────────────────────────────────
    function animate(t) {
        ctx.clearRect(0, 0, W, H);

        // Glow pass first (blurred, behind)
        for (const w of waves) {
            drawGlowWave(w, t);
        }
        // Sharp pass on top
        for (const w of waves) {
            drawWave(w, t);
        }

        raf = requestAnimationFrame(animate);
    }

    // ── Intersection Observer — only animate when visible ─────────────────────
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!raf) raf = requestAnimationFrame(animate);
            } else {
                if (raf) { cancelAnimationFrame(raf); raf = null; }
            }
        });
    }, { threshold: 0.05 });

    // ── Init ──────────────────────────────────────────────────────────────────
    function init() {
        resize();
        observer.observe(canvas.parentElement);
        window.addEventListener('resize', () => {
            resize();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
