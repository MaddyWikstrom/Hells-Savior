// Loading Screen JavaScript
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.mainContent = document.getElementById('main-content');
        this.progressFill = document.querySelector('.progress-fill');
        this.progressPercentage = document.querySelector('.loading-percentage');
        this.loadingCross = document.querySelector('.loading-cross');
        
        this.progress = 0;
        this.targetProgress = 0;
        this.isLoading = true;
        
        this.init();
    }
    
    init() {
        // Hide main content initially
        if (this.mainContent) {
            this.mainContent.style.opacity = '0';
        }
        
        // Start loading simulation
        this.simulateLoading();
        
        // Add cross pulsing
        this.animateCross();
        
        // Listen for actual page load
        this.setupLoadListeners();
    }
    
    simulateLoading() {
        const loadingSteps = [
            { progress: 20, delay: 300, message: 'Summoning flames...' },
            { progress: 40, delay: 500, message: 'Loading beats...' },
            { progress: 60, delay: 400, message: 'Preparing the stage...' },
            { progress: 80, delay: 600, message: 'Almost ready...' },
            { progress: 100, delay: 300, message: 'Welcome to Hell...' }
        ];
        
        let currentStep = 0;
        
        const executeStep = () => {
            if (currentStep < loadingSteps.length) {
                const step = loadingSteps[currentStep];
                
                setTimeout(() => {
                    this.updateProgress(step.progress);
                    currentStep++;
                    executeStep();
                }, step.delay);
            } else {
                // Loading complete
                setTimeout(() => {
                    this.completeLoading();
                }, 500);
            }
        };
        
        executeStep();
    }
    
    updateProgress(targetProgress) {
        this.targetProgress = targetProgress;
        
        const animateProgress = () => {
            if (this.progress < this.targetProgress) {
                this.progress += 1;
                
                if (this.progressFill) {
                    this.progressFill.style.width = `${this.progress}%`;
                }
                
                if (this.progressPercentage) {
                    this.progressPercentage.textContent = `${this.progress}%`;
                }
                
                // Update cross intensity based on progress
                this.updateCrossIntensity(this.progress);
                
                requestAnimationFrame(animateProgress);
            }
        };
        
        animateProgress();
    }
    
    updateCrossIntensity(progress) {
        if (this.loadingCross) {
            const crossSymbol = this.loadingCross.querySelector('.cross-symbol');
            if (crossSymbol) {
                const intensity = (progress / 100) * 1.5;
                const scale = 1 + (intensity * 0.2);
                const glowIntensity = 20 + (intensity * 20);
                
                crossSymbol.style.transform = `scale(${scale}) rotate(${intensity * 2}deg)`;
                crossSymbol.style.textShadow = `
                    0 0 ${glowIntensity}px #ff0000,
                    0 0 ${glowIntensity * 2}px #ff0000,
                    0 0 ${glowIntensity * 2}px #8a2be2,
                    0 0 ${glowIntensity * 3}px #0066ff
                `;
            }
        }
    }
    
    animateCross() {
        if (this.loadingCross) {
            let glowIntensity = 1;
            let direction = 1;
            
            const pulseGlow = () => {
                glowIntensity += direction * 0.02;
                
                if (glowIntensity >= 1.5) {
                    direction = -1;
                } else if (glowIntensity <= 0.8) {
                    direction = 1;
                }
                
                const crossSymbol = this.loadingCross.querySelector('.cross-symbol');
                if (crossSymbol) {
                    crossSymbol.style.filter = `brightness(${glowIntensity}) drop-shadow(0 0 ${glowIntensity * 20}px #8a2be2)`;
                }
                
                if (this.isLoading) {
                    requestAnimationFrame(pulseGlow);
                }
            };
            
            pulseGlow();
        }
    }
    
    setupLoadListeners() {
        // Wait for DOM content and images to load
        const checkLoadComplete = () => {
            if (document.readyState === 'complete') {
                // Ensure minimum loading time for effect
                const minLoadTime = 3000; // 3 seconds minimum
                const loadStartTime = performance.now();
                
                const remainingTime = Math.max(0, minLoadTime - (performance.now() - loadStartTime));
                
                setTimeout(() => {
                    if (this.progress >= 100) {
                        this.completeLoading();
                    }
                }, remainingTime);
            } else {
                setTimeout(checkLoadComplete, 100);
            }
        };
        
        // Start checking after a short delay
        setTimeout(checkLoadComplete, 1000);
        
        // Also listen for window load event
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (this.progress >= 100) {
                    this.completeLoading();
                }
            }, 1000);
        });
    }
    
    completeLoading() {
        if (!this.isLoading) return;
        
        this.isLoading = false;
        
        // Final cross effect
        this.finalCrossEffect();
        
        // Fade out loading screen
        setTimeout(() => {
            this.fadeOutLoading();
        }, 800);
    }
    
    finalCrossEffect() {
        // Cross final glow
        if (this.loadingCross) {
            const crossSymbol = this.loadingCross.querySelector('.cross-symbol');
            if (crossSymbol) {
                crossSymbol.style.transition = 'all 0.5s ease';
                crossSymbol.style.transform = 'scale(1.3) rotate(5deg)';
                crossSymbol.style.textShadow = `
                    0 0 50px #ff0000,
                    0 0 80px #ff0000,
                    0 0 60px #8a2be2,
                    0 0 100px #0066ff,
                    0 0 120px #ffffff
                `;
                
                setTimeout(() => {
                    crossSymbol.style.opacity = '0';
                }, 500);
            }
        }
    }
    
    fadeOutLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('fade-out');
            
            // Show main content immediately
            if (this.mainContent) {
                this.mainContent.style.display = 'block';
                this.mainContent.style.opacity = '0';
                
                // Fade in main content
                setTimeout(() => {
                    this.mainContent.classList.add('loaded');
                    this.mainContent.style.opacity = '1';
                }, 300);
            }
            
            // Remove loading screen from DOM
            setTimeout(() => {
                if (this.loadingScreen && this.loadingScreen.parentNode) {
                    this.loadingScreen.parentNode.removeChild(this.loadingScreen);
                }
                
                // Trigger page loaded event
                this.triggerPageLoadedEvent();
            }, 1000);
        }
    }
    
    triggerPageLoadedEvent() {
        // Dispatch custom event for other scripts
        const pageLoadedEvent = new CustomEvent('pageLoaded', {
            detail: {
                loadTime: performance.now(),
                message: 'Page fully loaded and ready'
            }
        });
        
        document.dispatchEvent(pageLoadedEvent);
        
        // Initialize other page functionality
        this.initializePageFeatures();
    }
    
    initializePageFeatures() {
        // Add scroll-triggered animations
        this.setupScrollAnimations();
        
        // Add particle effects
        this.addParticleEffects();
        
        // Initialize smooth scrolling
        this.initSmoothScrolling();
    }
    
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.track-card, .social-link, .about-text, .about-image, .product-card, .section-title'
        );
        
        animateElements.forEach(el => {
            el.classList.add('fade-in-up');
            observer.observe(el);
        });
        
        // Stagger grid items
        const gridItems = document.querySelectorAll('.music-grid .track-card, .merch-grid .product-card');
        gridItems.forEach((item, index) => {
            item.classList.add('stagger-item');
            item.style.transitionDelay = `${index * 0.1}s`;
        });
    }
    
    addParticleEffects() {
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            if (section.id !== 'home') { // Skip hero section
                const particles = document.createElement('div');
                particles.className = 'particles';
                
                for (let i = 0; i < 9; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = `${Math.random() * 100}%`;
                    particle.style.animationDelay = `${Math.random() * 8}s`;
                    particle.style.animationDuration = `${6 + Math.random() * 4}s`;
                    particles.appendChild(particle);
                }
                
                section.style.position = 'relative';
                section.appendChild(particles);
            }
        });
    }
    
    initSmoothScrolling() {
        // Enhanced smooth scrolling for navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Add visual feedback
                    this.addScrollFeedback(targetElement);
                }
            });
        });
    }
    
    addScrollFeedback(element) {
        element.style.transform = 'scale(1.02)';
        element.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }
}

// Initialize loading screen when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LoadingScreen();
});

// Fallback initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LoadingScreen();
    });
} else {
    new LoadingScreen();
}