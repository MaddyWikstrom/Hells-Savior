// Advanced Animations JavaScript for Hells Savior Website
class AnimationController {
    constructor() {
        this.isPageLoaded = false;
        this.animationQueue = [];
        this.activeAnimations = new Set();
        
        this.init();
    }
    
    init() {
        // Wait for page to be fully loaded
        document.addEventListener('pageLoaded', () => {
            this.isPageLoaded = true;
            this.initializeAnimations();
        });
        
        // Fallback initialization
        setTimeout(() => {
            if (!this.isPageLoaded) {
                this.initializeAnimations();
            }
        }, 3000);
    }
    
    initializeAnimations() {
        this.setupTextAnimations();
        this.setupParticleSystem();
        this.setupFireEffects();
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupMouseTracker();
    }
    
    // Text animations
    setupTextAnimations() {
        // Typewriter effect for hero subtitle
        this.addTypewriterEffect('.hero-subtitle', 2000);
        
        // Glitch effect for section titles
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            this.addGlitchEffect(title);
        });
        
        // Neon flicker for navigation logo
        const navLogo = document.querySelector('.nav-logo h1');
        if (navLogo) {
            this.addNeonFlicker(navLogo);
        }
    }
    
    addTypewriterEffect(selector, delay = 0) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid #0066ff';
        element.style.animation = 'blink-caret 0.75s step-end infinite';
        
        setTimeout(() => {
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 80 + Math.random() * 40);
                } else {
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                        element.style.animation = 'none';
                    }, 1000);
                }
            };
            typeWriter();
        }, delay);
    }
    
    addGlitchEffect(element) {
        if (!element) return;
        
        const originalText = element.textContent;
        element.setAttribute('data-text', originalText);
        element.classList.add('glitch');
        
        // Random glitch triggers
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every interval
                element.style.animation = 'glitch 0.3s ease-in-out';
                setTimeout(() => {
                    element.style.animation = '';
                }, 300);
            }
        }, 2000);
    }
    
    addNeonFlicker(element) {
        if (!element) return;
        
        element.classList.add('neon');
        
        // Random flicker
        setInterval(() => {
            if (Math.random() < 0.15) {
                element.style.animation = 'neonFlicker 0.1s ease-in-out 3';
                setTimeout(() => {
                    element.style.animation = 'neonFlicker 1.5s infinite alternate';
                }, 300);
            }
        }, 3000);
    }
    
    // Particle system
    setupParticleSystem() {
        this.createFloatingParticles();
        this.createInteractiveParticles();
    }
    
    createFloatingParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'floating-particles';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        
        document.body.appendChild(particleContainer);
        
        // Create particles
        for (let i = 0; i < 20; i++) {
            this.createParticle(particleContainer);
        }
    }
    
    createParticle(container) {
        const particle = document.createElement('div');
        const isRed = Math.random() < 0.5;
        const size = 1 + Math.random() * 3;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${isRed ? '#ff0000' : '#0066ff'};
            border-radius: 50%;
            opacity: ${0.3 + Math.random() * 0.4};
            left: ${Math.random() * 100}%;
            animation: floatUp ${8 + Math.random() * 4}s linear infinite;
            animation-delay: ${Math.random() * 8}s;
            box-shadow: 0 0 ${size * 2}px ${isRed ? '#ff0000' : '#0066ff'};
        `;
        
        container.appendChild(particle);
        
        // Remove and recreate particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
                this.createParticle(container);
            }
        }, (8 + Math.random() * 4) * 1000);
    }
    
    createInteractiveParticles() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
        `;
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const particles = [];
        let mouse = { x: 0, y: 0 };
        
        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            
            // Create particles on mouse move
            if (Math.random() < 0.3) {
                particles.push({
                    x: mouse.x,
                    y: mouse.y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 1,
                    decay: 0.02,
                    color: Math.random() < 0.5 ? '#ff0000' : '#0066ff'
                });
            }
        });
        
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }
                
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    // Fire effects
    setupFireEffects() {
        this.enhanceFlameElements();
        this.addFireTrails();
    }
    
    enhanceFlameElements() {
        const flames = document.querySelectorAll('.flame, .hero-flame, .track-flame, .photo-flame');
        
        flames.forEach(flame => {
            // Add random intensity variations
            this.addFlameVariations(flame);
            
            // Add interactive effects
            flame.addEventListener('mouseenter', () => {
                this.intensifyFlame(flame);
            });
            
            flame.addEventListener('mouseleave', () => {
                this.normalizeFlame(flame);
            });
        });
    }
    
    addFlameVariations(flame) {
        setInterval(() => {
            const intensity = 0.8 + Math.random() * 0.4;
            const hue = Math.random() * 60;
            
            flame.style.filter = `brightness(${intensity}) hue-rotate(${hue}deg)`;
            flame.style.transform = `scaleY(${0.9 + Math.random() * 0.2}) scaleX(${0.9 + Math.random() * 0.2})`;
        }, 100 + Math.random() * 200);
    }
    
    intensifyFlame(flame) {
        flame.style.transition = 'all 0.3s ease';
        flame.style.filter = 'brightness(1.5) hue-rotate(45deg)';
        flame.style.transform = 'scale(1.3)';
        flame.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.8)';
    }
    
    normalizeFlame(flame) {
        flame.style.transition = 'all 0.3s ease';
        flame.style.filter = '';
        flame.style.transform = '';
        flame.style.boxShadow = '';
    }
    
    addFireTrails() {
        const buttons = document.querySelectorAll('.btn-primary');
        
        buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                this.createFireTrail(e.clientX, e.clientY);
            });
        });
    }
    
    createFireTrail(x, y) {
        const trail = document.createElement('div');
        trail.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, #ff0000, #ff6600);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: fireTrail 0.5s ease-out forwards;
        `;
        
        document.body.appendChild(trail);
        
        setTimeout(() => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        }, 500);
        
        // Add fire trail animation if not exists
        if (!document.querySelector('#fire-trail-styles')) {
            const style = document.createElement('style');
            style.id = 'fire-trail-styles';
            style.textContent = `
                @keyframes fireTrail {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Scroll animations
    setupScrollAnimations() {
        this.addScrollTriggers();
        this.addParallaxScrolling();
        this.addScrollProgress();
    }
    
    addScrollTriggers() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerElementAnimation(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        const elements = document.querySelectorAll('.track-card, .social-link, .product-card, .about-text');
        elements.forEach(el => observer.observe(el));
    }
    
    triggerElementAnimation(element) {
        element.classList.add('animate-in');
        
        // Add specific animations based on element type
        if (element.classList.contains('track-card')) {
            this.animateTrackCard(element);
        } else if (element.classList.contains('social-link')) {
            this.animateSocialLink(element);
        }
    }
    
    animateTrackCard(card) {
        const flames = card.querySelectorAll('.track-flame');
        const playBtn = card.querySelector('.play-btn');
        
        flames.forEach((flame, index) => {
            setTimeout(() => {
                flame.style.opacity = '1';
                flame.style.animation = 'trackFlameFlicker 0.8s ease-in-out infinite alternate';
            }, index * 150);
        });
        
        if (playBtn) {
            setTimeout(() => {
                playBtn.style.animation = 'pulse 1s ease-in-out';
            }, 500);
        }
    }
    
    animateSocialLink(link) {
        const icon = link.querySelector('i');
        if (icon) {
            icon.style.animation = 'bounce 0.6s ease-out';
            
            setTimeout(() => {
                icon.style.animation = '';
            }, 600);
        }
    }
    
    addParallaxScrolling() {
        const parallaxElements = document.querySelectorAll('.hero-flame, .ascii-star');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrollY * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
    
    addScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #ff0000, #0066ff);
            z-index: 10000;
            transition: width 0.1s ease;
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        `;
        
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
        });
    }
    
    // Hover animations
    setupHoverAnimations() {
        this.addMagneticEffect();
        this.addRippleEffect();
        this.addGlowEffect();
    }
    
    addMagneticEffect() {
        const magneticElements = document.querySelectorAll('.btn, .social-link, .nav-link');
        
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const moveX = x * 0.15;
                const moveY = y * 0.15;
                
                element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
            });
        });
    }
    
    addRippleEffect() {
        const rippleElements = document.querySelectorAll('.btn, .track-card, .product-card');
        
        rippleElements.forEach(element => {
            element.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = element.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                element.style.position = 'relative';
                element.style.overflow = 'hidden';
                element.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
    
    addGlowEffect() {
        const glowElements = document.querySelectorAll('.track-artwork, .artist-photo');
        
        glowElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.filter = 'drop-shadow(0 0 20px rgba(0, 102, 255, 0.6)) brightness(1.1)';
                element.style.transform = 'scale(1.05)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.filter = '';
                element.style.transform = '';
            });
        });
    }
    
    // Mouse tracker
    setupMouseTracker() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #ff0000, #0066ff);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            mix-blend-mode: difference;
            transition: transform 0.1s ease;
            opacity: 0;
        `;
        
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX - 10}px`;
            cursor.style.top = `${e.clientY - 10}px`;
            cursor.style.opacity = '1';
        });
        
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
        
        // Change cursor on hover
        const hoverElements = document.querySelectorAll('a, button, .track-card, .product-card');
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(2)';
                cursor.style.background = 'radial-gradient(circle, #0066ff, #ff0000)';
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = 'radial-gradient(circle, #ff0000, #0066ff)';
            });
        });
    }
    
    // Utility methods
    addCustomAnimation(element, animationName, duration = '1s', easing = 'ease') {
        if (!element) return;
        
        element.style.animation = `${animationName} ${duration} ${easing}`;
        
        const animationId = `${animationName}-${Date.now()}`;
        this.activeAnimations.add(animationId);
        
        setTimeout(() => {
            element.style.animation = '';
            this.activeAnimations.delete(animationId);
        }, parseFloat(duration) * 1000);
        
        return animationId;
    }
    
    stopAnimation(animationId) {
        if (this.activeAnimations.has(animationId)) {
            this.activeAnimations.delete(animationId);
        }
    }
    
    pauseAllAnimations() {
        document.querySelectorAll('*').forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    }
    
    resumeAllAnimations() {
        document.querySelectorAll('*').forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }
}

// Initialize animation controller
const animationController = new AnimationController();

// Make it globally accessible
window.animationController = animationController;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}