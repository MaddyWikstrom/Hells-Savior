// Enhanced Loading Screen JavaScript with Barb Wire, Chain Unlock, and Code Entry
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.mainContent = document.getElementById('main-content');
        
        // Phase elements
        this.phase1 = document.querySelector('.phase-1');
        this.phase2 = document.querySelector('.phase-2');
        this.phase3 = document.querySelector('.phase-3');
        
        // Phase 1 elements
        this.progressFill = document.querySelector('.progress-fill');
        this.progressPercentage = document.querySelector('.loading-percentage');
        this.loadingCross = document.querySelector('.loading-cross');
        this.barbWires = document.querySelectorAll('.barb-wire');
        
        // Phase 2 elements
        this.chainLinks = document.querySelectorAll('.chain-link');
        this.lock = document.querySelector('.lock');
        this.key = document.querySelector('.key');
        
        // Phase 3 elements
        this.codeDigits = document.querySelectorAll('.code-digit');
        this.codeInput = document.getElementById('code-input');
        this.typingIndicator = document.querySelector('.typing-indicator');
        
        this.progress = 0;
        this.targetProgress = 0;
        this.isLoading = true;
        this.currentPhase = 1;
        this.codeEntered = '';
        
        this.init();
    }
    
    init() {
        // Hide main content initially
        if (this.mainContent) {
            this.mainContent.style.opacity = '0';
        }
        
        // Add fallback timeout to ensure content shows
        setTimeout(() => {
            if (this.isLoading) {
                console.log('Fallback: Forcing content to show after timeout');
                this.completeLoading();
            }
        }, 10000); // 10 second fallback
        
        // Start Phase 1: Loading with barb wire animation
        this.startPhase1();
        
        // Add cross pulsing
        this.animateCross();
        
        // Listen for actual page load
        this.setupLoadListeners();
    }
    
    startPhase1() {
        console.log('Starting Phase 1: Loading with Barb Wire');
        this.currentPhase = 1;
        this.showPhase(1);
        
        // Start barb wire animations
        this.animateBarbWires();
        
        // Start loading simulation
        this.simulateLoading();
    }
    
    animateBarbWires() {
        // Barb wires are already animated via CSS
        // Add any additional JavaScript-controlled animations here if needed
        this.barbWires.forEach((wire, index) => {
            wire.style.animationDelay = `${index * 0.5}s`;
        });
    }
    
    simulateLoading() {
        const loadingSteps = [
            { progress: 15, delay: 400, message: 'Summoning darkness...' },
            { progress: 30, delay: 500, message: 'Loading hellish beats...' },
            { progress: 45, delay: 600, message: 'Wrapping barb wire...' },
            { progress: 60, delay: 500, message: 'Preparing the ritual...' },
            { progress: 75, delay: 400, message: 'Channeling energy...' },
            { progress: 90, delay: 300, message: 'Almost ready...' },
            { progress: 100, delay: 200, message: 'Loading complete...' }
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
                // Phase 1 complete, move to Phase 2
                setTimeout(() => {
                    this.startPhase2();
                }, 800);
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
                if (crossSymbol && this.currentPhase === 1) {
                    crossSymbol.style.filter = `brightness(${glowIntensity}) drop-shadow(0 0 ${glowIntensity * 20}px #8a2be2)`;
                }
                
                if (this.isLoading) {
                    requestAnimationFrame(pulseGlow);
                }
            };
            
            pulseGlow();
        }
    }
    
    startPhase2() {
        console.log('Starting Phase 2: Chain and Key Unlock');
        this.currentPhase = 2;
        this.showPhase(2);
        
        // Start chain breaking animation
        setTimeout(() => {
            this.breakChains();
        }, 500);
        
        // Start key insertion after chains break
        setTimeout(() => {
            this.insertKey();
        }, 2000);
        
        // Move to Phase 3 after unlock animation
        setTimeout(() => {
            this.startPhase3();
        }, 4500);
    }
    
    breakChains() {
        this.chainLinks.forEach((chain, index) => {
            setTimeout(() => {
                chain.classList.add('breaking');
            }, index * 200);
        });
    }
    
    insertKey() {
        if (this.key) {
            this.key.style.opacity = '1';
            this.key.style.animation = 'keyInsert 2s ease-in-out forwards';
        }
        
        // Unlock the lock after key insertion
        setTimeout(() => {
            if (this.lock) {
                this.lock.classList.add('unlocking');
            }
        }, 1500);
    }
    
    startPhase3() {
        console.log('Starting Phase 3: Code Entry');
        this.currentPhase = 3;
        this.showPhase(3);
        
        // Start automatic code entry after a brief delay
        setTimeout(() => {
            this.enterCode();
        }, 1000);
    }
    
    enterCode() {
        const code = '777';
        let currentDigit = 0;
        
        const typeDigit = () => {
            if (currentDigit < code.length) {
                // Update the display digit
                if (this.codeDigits[currentDigit]) {
                    this.codeDigits[currentDigit].textContent = code[currentDigit];
                    this.codeDigits[currentDigit].classList.add('filled');
                }
                
                // Add typing sound effect (if you want to add audio later)
                this.playTypingEffect();
                
                currentDigit++;
                
                // Continue typing next digit
                setTimeout(typeDigit, 800);
            } else {
                // Code entry complete
                setTimeout(() => {
                    this.completeCodeEntry();
                }, 500);
            }
        };
        
        typeDigit();
    }
    
    playTypingEffect() {
        // Visual feedback for typing
        if (this.typingIndicator) {
            this.typingIndicator.style.opacity = '0';
            setTimeout(() => {
                this.typingIndicator.style.opacity = '1';
            }, 100);
        }
    }
    
    completeCodeEntry() {
        console.log('Code entry complete - transitioning to site');
        
        // Add success effect to all digits
        this.codeDigits.forEach(digit => {
            digit.classList.add('code-success');
        });
        
        // Hide typing indicator
        if (this.typingIndicator) {
            this.typingIndicator.style.opacity = '0';
        }
        
        // Complete loading after success animation
        setTimeout(() => {
            this.completeLoading();
        }, 1000);
    }
    
    showPhase(phaseNumber) {
        // Hide all phases
        [this.phase1, this.phase2, this.phase3].forEach(phase => {
            if (phase) {
                phase.classList.remove('active');
            }
        });
        
        // Show target phase
        const targetPhase = phaseNumber === 1 ? this.phase1 : 
                           phaseNumber === 2 ? this.phase2 : this.phase3;
        
        if (targetPhase) {
            setTimeout(() => {
                targetPhase.classList.add('active');
            }, 300);
        }
    }
    
    setupLoadListeners() {
        // Wait for DOM content and images to load
        const checkLoadComplete = () => {
            if (document.readyState === 'complete') {
                // Ensure minimum loading time for effect
                const minLoadTime = 8000; // 8 seconds minimum for full animation
                const loadStartTime = performance.now();
                
                const remainingTime = Math.max(0, minLoadTime - (performance.now() - loadStartTime));
                
                setTimeout(() => {
                    if (this.currentPhase >= 3) {
                        // Loading sequence complete
                        console.log('Page load complete, ready for transition');
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
            console.log('Window load event fired');
        });
    }
    
    completeLoading() {
        if (!this.isLoading) return;
        
        console.log('Completing loading sequence');
        this.isLoading = false;
        
        // Final effects
        this.finalEffects();
        
        // Fade out loading screen
        setTimeout(() => {
            this.fadeOutLoading();
        }, 800);
    }
    
    finalEffects() {
        // Final glow effect on all elements
        if (this.loadingScreen) {
            this.loadingScreen.style.background = `
                radial-gradient(circle, 
                    rgba(255, 0, 0, 0.1) 0%, 
                    rgba(138, 43, 226, 0.05) 50%, 
                    rgba(0, 0, 0, 1) 100%
                )
            `;
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
                message: 'Hell\'s gates have opened - Welcome to the darkness',
                code: '777'
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
    console.log('DOM loaded - initializing enhanced loading screen');
    
    // Skip loading screen by default (set to false to enable loading screen)
    const skipLoading = true;
    
    // Check for debug parameter to override
    const urlParams = new URLSearchParams(window.location.search);
    const forceLoading = urlParams.get('showLoading') === 'true';
    
    if (skipLoading && !forceLoading) {
        console.log('Skipping loading screen (default behavior)');
        const mainContent = document.getElementById('main-content');
        const loadingScreen = document.getElementById('loading-screen');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.classList.add('loaded');
        }
        return;
    }
    
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

// Listen for the custom page loaded event
document.addEventListener('pageLoaded', (event) => {
    console.log('Page fully loaded:', event.detail);
});