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
        
        // Fallback initialization
        if (document.readyState === 'complete') {
            setTimeout(() => {
                if (!this.isPageLoaded) {
                    this.initializeAllFeatures();
                }
            }, 3000);
        }
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
        const navCenter = document.querySelector('.nav-center');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        const navbar = document.querySelector('.navbar');
        
        // Mobile menu toggle
        if (mobileMenu && navCenter) {
            mobileMenu.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                navCenter.classList.toggle('active');
                
                // Add body scroll lock when menu is open
                if (navCenter.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu && navCenter) {
                    mobileMenu.classList.remove('active');
                    navCenter.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navCenter && navCenter.classList.contains('active')) {
                if (!navCenter.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                    navCenter.classList.remove('active');
                    document.body.style.overflow = '';
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
    "|_||_|\\___||_| |_|/__/ /__/\\__,_| \\_/  |_|\\___/|_|   "
  ].join("\n");
}