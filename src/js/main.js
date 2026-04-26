// Main JavaScript for Hells Savior Website
class HellsSaviorSite {
    constructor() {
        this.isPageLoaded = false;
        this.currentTrack = null;
        this.audioContext = null;
        
        this.init();
    }
    
    init() {
        // Wait for page to be fully loaded
        document.addEventListener('pageLoaded', () => {
            this.isPageLoaded = true;
            this.initializeAllFeatures();
        });

        // Also init on DOMContentLoaded (for pages without loading screen)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                if (!this.isPageLoaded) {
                    this.initializeAllFeatures();
                }
            });
        } else {
            // DOM already ready
            if (!this.isPageLoaded) {
                this.initializeAllFeatures();
            }
        }
        
        // Fallback initialization
        setTimeout(() => {
            if (!this.isPageLoaded) {
                this.initializeAllFeatures();
            }
        }, 1000);
    }
    
    initializeAllFeatures() {
        this.initNavigation();
        this.initScrollEffects();
        this.initAnimations();
        this.initMusicPlayer();
        this.initInteractiveElements();
        this.initParallaxEffects();
        this.addScrollToTopButton();
        this.initMagneticEffects();
        this.initFlameEffects();
    }
    
    // Navigation functionality
    initNavigation() {
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerMenu = document.getElementById('hamburger-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        const hamburgerLinks = document.querySelectorAll('.hamburger-link');
        const navbar = document.querySelector('.navbar');

        // Create overlay backdrop for hamburger menu
        let hamburgerOverlay = document.querySelector('.hamburger-overlay');
        if (!hamburgerOverlay) {
            hamburgerOverlay = document.createElement('div');
            hamburgerOverlay.className = 'hamburger-overlay';
            document.body.appendChild(hamburgerOverlay);
        }

        const closeHamburger = () => {
            if (mobileMenu) mobileMenu.classList.remove('active');
            if (hamburgerMenu) hamburgerMenu.classList.remove('active');
            hamburgerOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        const openHamburger = () => {
            if (mobileMenu) mobileMenu.classList.add('active');
            if (hamburgerMenu) hamburgerMenu.classList.add('active');
            hamburgerOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        // Hamburger toggle
        if (mobileMenu) {
            mobileMenu.addEventListener('click', () => {
                if (hamburgerMenu && hamburgerMenu.classList.contains('active')) {
                    closeHamburger();
                } else {
                    openHamburger();
                }
            });
        }

        // Close when clicking overlay
        hamburgerOverlay.addEventListener('click', closeHamburger);

        // Close when clicking a hamburger link
        hamburgerLinks.forEach(link => {
            link.addEventListener('click', closeHamburger);
        });

        // Close mobile menu when clicking on a nav link (legacy)
        navLinks.forEach(link => {
            link.addEventListener('click', closeHamburger);
        });

        // Close hamburger on outside click
        document.addEventListener('click', (e) => {
            if (hamburgerMenu && hamburgerMenu.classList.contains('active')) {
                if (!hamburgerMenu.contains(e.target) && !mobileMenu.contains(e.target)) {
                    closeHamburger();
                }
            }
        });
        
        // Enhanced navbar scroll effects
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            if (navbar) {
                // Change navbar appearance based on scroll
                if (scrollY > 50) {
                    navbar.style.background = 'rgba(0, 0, 0, 0.98)';
                    navbar.style.backdropFilter = 'blur(20px)';
                    navbar.style.borderBottom = '1px solid rgba(0, 102, 255, 0.5)';
                } else {
                    navbar.style.background = 'rgba(0, 0, 0, 0.95)';
                    navbar.style.backdropFilter = 'blur(10px)';
                    navbar.style.borderBottom = '1px solid rgba(0, 102, 255, 0.3)';
                }
                
                // Hide/show navbar on scroll
                if (scrollY > lastScrollY && scrollY > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = scrollY;
        });
        
        // Add active link highlighting
        this.highlightActiveSection();
    }
    
    highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.3
        });
        
        sections.forEach(section => observer.observe(section));
    }
    
    // Enhanced scroll effects
    initScrollEffects() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            // Hide scroll indicator after scrolling
            if (scrollIndicator) {
                if (scrollY > 100) {
                    scrollIndicator.style.opacity = '0';
                    scrollIndicator.style.transform = 'translateX(-50%) translateY(20px)';
                } else {
                    scrollIndicator.style.opacity = '1';
                    scrollIndicator.style.transform = 'translateX(-50%) translateY(0)';
                }
            }
            
            // Update parallax elements
            this.updateParallax(scrollY);
        });
        
        // Intersection Observer for animations
        this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Add special effects for specific elements
                    if (entry.target.classList.contains('track-card')) {
                        this.animateTrackCard(entry.target);
                    }
                    
                    if (entry.target.classList.contains('social-link')) {
                        this.animateSocialLink(entry.target);
                    }
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.track-card, .social-link, .about-text, .about-image, .product-card'
        );
        
        animateElements.forEach(el => {
            observer.observe(el);
        });
    }
    
    animateTrackCard(card) {
        const flames = card.querySelectorAll('.track-flame');
        flames.forEach((flame, index) => {
            setTimeout(() => {
                flame.style.opacity = '1';
                flame.style.animation = 'trackFlameFlicker 0.8s ease-in-out infinite alternate';
            }, index * 100);
        });
    }
    
    animateSocialLink(link) {
        const icon = link.querySelector('i');
        if (icon) {
            icon.style.animation = 'bounce 0.6s ease-out';
        }
    }
    
    // Music player functionality
    initMusicPlayer() {
        const playButtons = document.querySelectorAll('.play-btn');
        
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleTrackPlay(button);
            });
        });
    }
    
    handleTrackPlay(button) {
        const trackCard = button.closest('.track-card');
        const trackTitle = trackCard.querySelector('.track-title').textContent;
        
        // Stop current track if playing
        if (this.currentTrack && this.currentTrack !== button) {
            this.stopTrack(this.currentTrack);
        }
        
        // Toggle play/pause
        if (button.classList.contains('fa-play')) {
            this.playTrack(button, trackTitle);
        } else {
            this.pauseTrack(button);
        }
    }
    
    playTrack(button, trackTitle) {
        button.classList.remove('fa-play');
        button.classList.add('fa-pause');
        this.currentTrack = button;
        
        // Add visual effects
        const trackCard = button.closest('.track-card');
        trackCard.classList.add('playing');
        
        // Animate flames
        const flames = trackCard.querySelectorAll('.track-flame');
        flames.forEach(flame => {
            flame.style.animationDuration = '0.3s';
            flame.style.filter = 'brightness(1.5) hue-rotate(90deg)';
        });
        
        // Show notification
        this.showNotification(`Now playing: ${trackTitle}`, 'success');
        
        // Simulate audio visualization
        this.startAudioVisualization(trackCard);
    }
    
    pauseTrack(button) {
        button.classList.remove('fa-pause');
        button.classList.add('fa-play');
        
        const trackCard = button.closest('.track-card');
        trackCard.classList.remove('playing');
        
        // Reset flames
        const flames = trackCard.querySelectorAll('.track-flame');
        flames.forEach(flame => {
            flame.style.animationDuration = '0.8s';
            flame.style.filter = '';
        });
        
        this.stopAudioVisualization();
        this.currentTrack = null;
    }
    
    stopTrack(button) {
        this.pauseTrack(button);
    }
    
    startAudioVisualization(trackCard) {
        const artwork = trackCard.querySelector('.track-artwork');
        let intensity = 0;
        let direction = 1;
        
        const visualize = () => {
            if (!trackCard.classList.contains('playing')) return;
            
            intensity += direction * 0.05;
            if (intensity >= 1) direction = -1;
            if (intensity <= 0) direction = 1;
            
            artwork.style.transform = `scale(${1 + intensity * 0.1})`;
            artwork.style.filter = `brightness(${1 + intensity * 0.3}) hue-rotate(${intensity * 30}deg)`;
            
            requestAnimationFrame(visualize);
        };
        
        visualize();
    }
    
    stopAudioVisualization() {
        // Reset any ongoing visualizations
        const playingCards = document.querySelectorAll('.track-card.playing');
        playingCards.forEach(card => {
            const artwork = card.querySelector('.track-artwork');
            artwork.style.transform = '';
            artwork.style.filter = '';
        });
    }
    
    // Interactive elements
    initInteractiveElements() {
        // Add hover effects to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
        
        // Add ripple effect to clickable elements
        this.addRippleEffect();
        
        // Initialize contact form if exists
        this.initContactForm();
    }
    
    addRippleEffect() {
        const rippleElements = document.querySelectorAll('.btn, .social-link, .track-card');
        
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
        
        // Add ripple animation keyframes
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    initContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmission(contactForm);
            });
        }
    }
    
    handleContactSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        this.showNotification('Message sent successfully!', 'success');
        form.reset();
    }
    
    // Parallax effects
    initParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.hero-flame, .ascii-star, .photo-flame');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            this.updateParallax(scrollY);
        });
    }
    
    updateParallax(scrollY) {
        const parallaxElements = document.querySelectorAll('.hero-flame');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        // Parallax for ASCII star
        const asciiStar = document.querySelector('.hero-ascii-star');
        if (asciiStar) {
            const yPos = -(scrollY * 0.3);
            asciiStar.style.transform = `translateY(${yPos}px)`;
        }
    }
    
    // Magnetic effects for interactive elements
    initMagneticEffects() {
        const magneticElements = document.querySelectorAll('.btn, .social-link');
        
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const moveX = x * 0.1;
                const moveY = y * 0.1;
                
                element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
            });
        });
    }
    
    // Enhanced flame effects
    initFlameEffects() {
        const flameElements = document.querySelectorAll('.flame, .hero-flame, .track-flame, .photo-flame');
        
        flameElements.forEach((flame, index) => {
            // Add random variations
            const randomDelay = Math.random() * 2;
            const randomDuration = 0.8 + Math.random() * 0.4;
            
            flame.style.animationDelay = `${randomDelay}s`;
            flame.style.animationDuration = `${randomDuration}s`;
            
            // Add interactive hover effects
            flame.addEventListener('mouseenter', () => {
                flame.style.filter = 'brightness(1.5) hue-rotate(45deg)';
                flame.style.transform = 'scale(1.2)';
            });
            
            flame.addEventListener('mouseleave', () => {
                flame.style.filter = '';
                flame.style.transform = '';
            });
        });
    }
    
    // Scroll to top functionality
    addScrollToTopButton() {
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Add visual feedback
            scrollBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                scrollBtn.style.transform = '';
            }, 150);
        });
        
        document.body.appendChild(scrollBtn);
        
        // Show/hide scroll to top button
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });
    }
    
    // Utility functions
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add icon based on type
        const icon = document.createElement('i');
        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                break;
            default:
                icon.className = 'fas fa-info-circle';
        }
        
        notification.insertBefore(icon, notification.firstChild);
        notification.insertBefore(document.createTextNode(' '), notification.childNodes[1]);
        
        document.body.appendChild(notification);
        
        // Auto remove notification
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Initialize animations
    initAnimations() {
        // Add entrance animations to elements
        const animatedElements = document.querySelectorAll('.section-title, .hero-content, .track-card, .social-link');
        
        animatedElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
        });
        
        // Add typing effect to hero subtitle
        this.addTypingEffect();
    }
    
    addTypingEffect() {
        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle) {
            const text = subtitle.textContent;
            subtitle.textContent = '';
            subtitle.style.borderRight = '2px solid #0066ff';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    subtitle.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                } else {
                    // Remove cursor after typing is complete
                    setTimeout(() => {
                        subtitle.style.borderRight = 'none';
                    }, 1000);
                }
            };
            
            // Start typing after a delay
            setTimeout(typeWriter, 2000);
        }
    }
}

// =============================================
// PROMO BANNER
// =============================================
(function initPromoBanner() {
    function setup() {
        const banner = document.getElementById('promo-banner');
        const closeBtn = document.getElementById('promo-close');
        const navbar = document.querySelector('.navbar');
        if (!banner) return;

        // If user already dismissed this session, hide immediately (no animation)
        if (sessionStorage.getItem('promoBannerDismissed')) {
            banner.style.display = 'none';
            return;
        }

        function applyBannerOffset() {
            const h = banner.getBoundingClientRect().height;
            document.documentElement.style.setProperty('--banner-height', h + 'px');
            if (navbar) navbar.classList.add('banner-visible');
        }

        function removeBannerOffset() {
            document.documentElement.style.setProperty('--banner-height', '0px');
            if (navbar) navbar.classList.remove('banner-visible');
        }

        // Apply offset immediately and on resize
        applyBannerOffset();
        window.addEventListener('resize', applyBannerOffset);

        // Also re-apply after fonts/layout settle
        setTimeout(applyBannerOffset, 300);

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                banner.classList.add('hidden');
                removeBannerOffset();
                sessionStorage.setItem('promoBannerDismissed', '1');
            });
        }
    }

    // Run as early as possible — before DOMContentLoaded if DOM is already ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();

// Initialize the site
document.addEventListener('DOMContentLoaded', () => {
    new HellsSaviorSite();
});

// Fallback initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HellsSaviorSite();
    });
} else {
    new HellsSaviorSite();
}

// ASCII Logo Initialization
const asciiLogo = document.getElementById('ascii-logo');

if (asciiLogo) {
  asciiLogo.textContent = [
    "    )       (   (                                    ",
    " ( /(    (  )\\  )\\             )   )   (        (    ",
    " )\\())  ))\\((_)((_)(    (   ( /(  /((  )\\   (   )(   ",
    "((_)\\  /((_)_   _  )\\   )\\  )(_))(_))\\((_)  )\\ (()\\  ",
    "| |(_)(_)) | | | |((_) ((_)((_)_ _)((_)(_) ((_) ((_) ",
    "| ' \\ / -_)| | | |(_-< (_-</ _` |\\ V / | |/ _ \\| '_| ",
    "|_||_|\\___||_| |_|/__/ /__/\\__,_| \\_/  |_|\\___/|_|   ",
    "                                                     "
  ].join("\n");
}

// ASCII Fire Effect for Merchandise Section
function createAsciiFire(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="ascii-viewport">
      <div class="ascii-world"></div>
      <pre class="ascii-measure ascii"></pre>
    </div>
  `;

  const viewport = container.querySelector(".ascii-viewport");
  const world = container.querySelector(".ascii-world");
  const measure = container.querySelector(".ascii-measure");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const asciiLines = [
    "    )       (   (                                    ",
    " ( /(    (  )\\  )\\             )   )   (        (    ",
    " )\\())  ))\\((_)((_)(    (   ( /(  /((  )\\   (   )(   ",
    "((_)\\  /((_)_   _  )\\   )\\  )(_))(_))\\((_)  )\\ (()\\  ",
    "| |(_)(_)) | | | |((_) ((_)((_)_ _)((_)(_) ((_) ((_) ",
    "| ' \\ / -_)| | | |(_-< (_-</ _` |\\ V / | |/ _ \\| '_| ",
    "|_||_|\\___||_| |_|/__/ /__/\\__,_| \\_/  |_|\\___/|_|   ",
    "                                                     "
  ];

  const fullText = asciiLines.join("\n");
  const flameText = asciiLines
    .map((line, i) => (i < 4 ? line : " ".repeat(line.length)))
    .join("\n");

  let stepX = 0;
  let stepY = 0;
  let periodX = 0;
  let periodY = 0;
  let resizeFrame = 0;
  let animationFrame = 0;
  let lastTimestamp = 0;
  let driftX = 0;
  let driftY = 0;
  let flickerStates = [];
  const loopDurationMs = 140000; // Slower, more relaxed scroll

  const PALETTES = {
    white: {
      glowCore: "255 255 255",
      glowHot: "240 248 255",
      glowMid: "200 230 255",
      glowOuter: "160 210 255",
      glowDeep: "120 180 240",
      ghost1: "220 240 255",
      ghost2: "180 220 255",
      ghost3: "140 200 255"
    },
    blue: {
      glowCore: "220 245 255",
      glowHot: "80 210 255",
      glowMid: "0 150 255",
      glowOuter: "0 80 255",
      glowDeep: "0 30 200",
      ghost1: "60 190 255",
      ghost2: "0 110 255",
      ghost3: "0 40 220"
    },
    red: {
      glowCore: "255 240 240",
      glowHot: "255 160 160",
      glowMid: "255 60 60",
      glowOuter: "220 0 0",
      glowDeep: "160 0 0",
      ghost1: "255 120 120",
      ghost2: "220 40 40",
      ghost3: "180 0 0"
    }
  };

  const BASE_TONES = {
    white: {
      rgb: "245 249 255",
      opacity: "1",
      shadowRgb: "125 220 255",
      shadowA: "0.12",
      shadowB: "0.04"
    },
    offWhite: {
      rgb: "230 232 228",
      opacity: "0.95",
      shadowRgb: "180 185 175",
      shadowA: "0.1",
      shadowB: "0.03"
    },
    softGray: {
      rgb: "180 185 190",
      opacity: "0.9",
      shadowRgb: "140 148 158",
      shadowA: "0.08",
      shadowB: "0.025"
    },
    midGray: {
      rgb: "140 145 150",
      opacity: "0.85",
      shadowRgb: "100 108 118",
      shadowA: "0.07",
      shadowB: "0.02"
    },
    darkGray: {
      rgb: "90 95 100",
      opacity: "0.8",
      shadowRgb: "60 68 78",
      shadowA: "0.06",
      shadowB: "0.015"
    },
    veryDarkGray: {
      rgb: "55 58 62",
      opacity: "0.75",
      shadowRgb: "35 40 48",
      shadowA: "0.05",
      shadowB: "0.01"
    }
  };

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickPalette() {
    const roll = Math.random();
    if (roll < 0.33) return "red";
    if (roll < 0.66) return "blue";
    return "white";
  }

  function pickBaseTone() {
    const roll = Math.random();
    if (roll < 0.12) return "veryDarkGray";
    if (roll < 0.28) return "darkGray";
    if (roll < 0.45) return "midGray";
    if (roll < 0.62) return "softGray";
    if (roll < 0.78) return "offWhite";
    return "white";
  }

  function applyPalette(tile, paletteName) {
    const palette = PALETTES[paletteName] || PALETTES.default;
    tile.style.setProperty("--glow-core-rgb", palette.glowCore);
    tile.style.setProperty("--glow-hot-rgb", palette.glowHot);
    tile.style.setProperty("--glow-mid-rgb", palette.glowMid);
    tile.style.setProperty("--glow-outer-rgb", palette.glowOuter);
    tile.style.setProperty("--glow-deep-rgb", palette.glowDeep);
    tile.style.setProperty("--ghost-rgb-1", palette.ghost1);
    tile.style.setProperty("--ghost-rgb-2", palette.ghost2);
    tile.style.setProperty("--ghost-rgb-3", palette.ghost3);
  }

  function applyBaseTone(tile, toneName) {
    const tone = BASE_TONES[toneName] || BASE_TONES.white;
    tile.style.setProperty("--base-rgb", tone.rgb);
    tile.style.setProperty("--base-opacity", tone.opacity);
    tile.style.setProperty("--base-shadow-rgb", tone.shadowRgb);
    tile.style.setProperty("--base-shadow-a", tone.shadowA);
    tile.style.setProperty("--base-shadow-b", tone.shadowB);
  }

  function applyFlicker(tile, intensity, transitionMs) {
    const hot = intensity;
    tile.style.setProperty("--flicker-ms", `${transitionMs}ms`);
    tile.style.setProperty("--glow-opacity", (0.35 + hot * 0.8).toFixed(3));
    tile.style.setProperty("--glow-blur", `${(0.02 + hot * 0.35).toFixed(3)}px`);
    tile.style.setProperty("--glow-white-a", (0.4 + hot * 0.75).toFixed(3));
    tile.style.setProperty("--glow-ice-a", (0.35 + hot * 0.75).toFixed(3));
    tile.style.setProperty("--glow-blue-a", (0.25 + hot * 0.7).toFixed(3));
    tile.style.setProperty("--glow-outer-a", (0.15 + hot * 0.55).toFixed(3));
    tile.style.setProperty("--glow-deep-a", (0.08 + hot * 0.35).toFixed(3));
    tile.style.setProperty("--ghost-opacity", (0.08 + hot * 0.32).toFixed(3));
    tile.style.setProperty("--ghost-blur", `${(0.08 + hot * 0.9).toFixed(3)}px`);
    tile.style.setProperty("--ghost-a1", (0.08 + hot * 0.3).toFixed(3));
    tile.style.setProperty("--ghost-a2", (0.06 + hot * 0.28).toFixed(3));
    tile.style.setProperty("--ghost-a3", (0.04 + hot * 0.22).toFixed(3));
  }

  function createTile(x, y, phase) {
    const tile = document.createElement("div");
    tile.className = `ascii-tile ${phase}`;
    tile.style.setProperty("--x", `${x}px`);
    tile.style.setProperty("--y", `${y}px`);

    const ghost = document.createElement("pre");
    ghost.className = "ascii layer ghost";
    ghost.textContent = flameText;

    const glow = document.createElement("pre");
    glow.className = "ascii layer glow";
    glow.textContent = flameText;

    const base = document.createElement("pre");
    base.className = "ascii layer base";
    base.textContent = fullText;

    tile.appendChild(ghost);
    tile.appendChild(glow);
    tile.appendChild(base);
    return tile;
  }

  function createPatternCopy(offsetX, offsetY, content) {
    const copy = document.createElement("div");
    copy.className = "pattern-copy";
    copy.style.setProperty("--offset-x", `${offsetX}px`);
    copy.style.setProperty("--offset-y", `${offsetY}px`);
    copy.appendChild(content);
    return copy;
  }

  function initTile(tile) {
    applyPalette(tile, pickPalette());
    applyBaseTone(tile, pickBaseTone());
    applyFlicker(tile, 0.14, 0);
  }

  function refreshFlickerStates() {
    flickerStates = [];
    Array.from(world.querySelectorAll(".ascii-tile")).forEach(initTile);
  }

  function buildBasePattern(width, height) {
    const rect = measure.getBoundingClientRect();
    const tileWidth = Math.ceil(rect.width);
    const tileHeight = Math.ceil(rect.height);

    const gapX = Math.max(20, Math.round(tileWidth * 0.12));
    const gapY = Math.max(15, Math.round(tileHeight * 0.15));

    stepX = tileWidth + gapX;
    stepY = tileHeight + gapY;
    periodX = stepX * 2;
    periodY = stepY * 2;

    // startY must reach back to -periodY so the 3x3 grid copy at y=-periodY connects seamlessly
    // rows must cover height + 2*periodY so there are no gaps when wrapping
    const startX = -stepX * 3;
    const startY = -periodY;
    const cols = Math.ceil((width + stepX * 6) / stepX);
    const rows = Math.ceil((height + periodY * 2) / stepY) + 2;

    const wrapper = document.createElement("div");

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if ((row + col) % 2 !== 0) continue;
        const phase = (((row + col) / 2) % 2 === 0) ? "phase-a" : "phase-b";
        wrapper.appendChild(createTile(startX + col * stepX, startY + row * stepY, phase));
      }
    }

    return wrapper;
  }

  function buildInfiniteWorld() {
    world.innerHTML = "";
    measure.textContent = fullText;

    const rect = viewport.getBoundingClientRect();
    const basePattern = buildBasePattern(rect.width, rect.height);

    // Create a 3x3 grid of pattern copies for seamless infinite looping
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        world.appendChild(createPatternCopy(x * periodX, y * periodY, basePattern.cloneNode(true)));
      }
    }

    refreshFlickerStates();
  }

  function wrap(value, size) {
    return ((value % size) + size) % size;
  }

  function animate(timestamp) {
    if (reduceMotionQuery.matches) {
      world.style.transform = "translate3d(0, 0, 0)";
      animationFrame = 0;
      return;
    }

    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = Math.min(34, timestamp - lastTimestamp);
    lastTimestamp = timestamp;

    driftX = wrap(driftX + delta * (periodX / loopDurationMs), periodX);
    driftY = wrap(driftY + delta * (periodY / loopDurationMs), periodY);

    world.style.transform = `translate3d(${driftX}px, ${-driftY}px, 0)`;

    animationFrame = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    lastTimestamp = 0;
    animationFrame = requestAnimationFrame(animate);
  }

  function rebuild() {
    buildInfiniteWorld();
    startAnimation();
  }

  function scheduleRebuild() {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(rebuild);
  }

  // Use ResizeObserver for container-based resizing
  const resizeObserver = new ResizeObserver(scheduleRebuild);
  resizeObserver.observe(container);

  rebuild();
  
  // Cleanup function
  return () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeObserver.disconnect();
  };
}

// Initialize ASCII Fire Effect
document.addEventListener('DOMContentLoaded', function() {
  createAsciiFire('merch-ascii-fire');
});