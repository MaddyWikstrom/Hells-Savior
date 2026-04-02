// Site Configuration for Hells Savior Website
const SiteConfig = {
    // Site Information
    site: {
        name: 'Hells Savior',
        tagline: 'SoundCloud Rapper',
        description: 'Official website of Hells Savior - SoundCloud rapper bringing raw energy and authentic storytelling to the hip-hop community.',
        url: 'https://hellssavior.com',
        email: 'booking@hellssavior.com'
    },
    
    // Brand Colors
    colors: {
        primary: '#ff0000',      // Fire Red
        secondary: '#0066ff',    // Cobalt Blue
        accent: '#ffffff',       // White
        dark: '#000000',         // Black
        darkGray: '#1a1a1a',     // Dark Gray
        lightGray: '#cccccc',    // Light Gray
        
        // Gradient combinations
        gradients: {
            fire: 'linear-gradient(45deg, #ff0000, #ff6600, #ffaa00)',
            ice: 'linear-gradient(45deg, #0066ff, #00aaff, #ffffff)',
            hellfire: 'linear-gradient(45deg, #ff0000, #0066ff)',
            shadow: 'linear-gradient(135deg, #000000, #1a0000, #000033)'
        }
    },
    
    // Typography
    fonts: {
        primary: "'Inter', sans-serif",
        heading: "'Bebas Neue', cursive",
        display: "'Metal Mania', cursive",
        mono: "'Courier New', monospace"
    },
    
    // Animation Settings
    animations: {
        duration: {
            fast: '0.3s',
            normal: '0.6s',
            slow: '1s',
            loading: '3s'
        },
        easing: {
            ease: 'ease',
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        },
        delays: {
            stagger: 0.1,
            section: 0.2,
            element: 0.05
        }
    },
    
    // Social Media Links
    social: {
        soundcloud: 'https://soundcloud.com/hellssavior',
        instagram: 'https://instagram.com/hellssavior',
        twitter: 'https://twitter.com/hellssavior',
        youtube: 'https://youtube.com/@hellssavior',
        spotify: 'https://open.spotify.com/artist/hellssavior',
        applemusic: 'https://music.apple.com/artist/hellssavior'
    },
    
    // Shopify Configuration
    shopify: {
        domain: '', // To be set when credentials are provided
        storefrontAccessToken: '', // To be set when credentials are provided
        apiVersion: '2023-10',
        currency: 'USD',
        
        // Placeholder products for development
        placeholderProducts: [
            {
                title: '777 Hells Savior T-Shirt',
                price: '25.00',
                description: 'Official Hells Savior merchandise featuring the iconic 777 logo with skull and crossbones design.',
                category: 'apparel'
            },
            {
                title: 'Hellfire Hoodie',
                price: '45.00',
                description: 'Premium quality hoodie with cobalt blue flame design and Hells Savior branding.',
                category: 'apparel'
            },
            {
                title: 'Skull Crown Snapback',
                price: '20.00',
                description: 'Adjustable snapback cap with embroidered skull crown and 777 numbering.',
                category: 'accessories'
            },
            {
                title: 'Inferno Poster Set',
                price: '15.00',
                description: 'High-quality poster set featuring exclusive Hells Savior artwork and lyrics.',
                category: 'art'
            },
            {
                title: 'Chain of Souls Necklace',
                price: '35.00',
                description: 'Sterling silver chain necklace with skull pendant, inspired by the 777 aesthetic.',
                category: 'jewelry'
            },
            {
                title: 'Flame Vinyl Record',
                price: '30.00',
                description: 'Limited edition vinyl featuring the latest Hells Savior tracks with flame-colored pressing.',
                category: 'music'
            }
        ]
    },
    
    // Music/Audio Settings
    music: {
        defaultVolume: 0.7,
        fadeInDuration: 1000,
        fadeOutDuration: 500,
        
        // Placeholder tracks for development
        tracks: [
            {
                title: 'Hellfire Anthem',
                artist: 'Hells Savior',
                duration: '3:45',
                genre: 'Hip-Hop',
                releaseDate: '2024-01-15',
                soundcloudUrl: 'https://soundcloud.com/hellssavior/hellfire-anthem'
            },
            {
                title: '777 Cypher',
                artist: 'Hells Savior',
                duration: '4:12',
                genre: 'Rap',
                releaseDate: '2024-02-20',
                soundcloudUrl: 'https://soundcloud.com/hellssavior/777-cypher'
            },
            {
                title: 'Cobalt Dreams',
                artist: 'Hells Savior',
                duration: '3:28',
                genre: 'Hip-Hop',
                releaseDate: '2024-03-10',
                soundcloudUrl: 'https://soundcloud.com/hellssavior/cobalt-dreams'
            }
        ]
    },
    
    // Performance Settings
    performance: {
        lazyLoading: true,
        imageOptimization: true,
        minLoadingTime: 3000, // Minimum loading screen time in ms
        maxLoadingTime: 8000, // Maximum loading screen time in ms
        
        // Intersection Observer settings
        observer: {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }
    },
    
    // SEO Settings
    seo: {
        keywords: [
            'Hells Savior',
            'SoundCloud rapper',
            'hip hop',
            'rap music',
            '777',
            'underground rap',
            'music artist',
            'rapper',
            'hip hop artist'
        ],
        ogImage: '/assets/images/og-image.jpg',
        twitterCard: 'summary_large_image'
    },
    
    // Feature Flags
    features: {
        loadingScreen: true,
        particleEffects: true,
        flameAnimations: true,
        glitchEffects: true,
        magneticHover: true,
        customCursor: true,
        scrollProgress: true,
        audioVisualization: true,
        shopifyIntegration: true
    },
    
    // Development Settings
    development: {
        debug: false,
        showFPS: false,
        logAnimations: false,
        mockShopifyData: true
    },
    
    // Responsive Breakpoints
    breakpoints: {
        mobile: '480px',
        tablet: '768px',
        desktop: '1024px',
        large: '1200px',
        xlarge: '1440px'
    },
    
    // ASCII Art and Special Characters
    ascii: {
        star: `    ★
   ███
  █████
 ███████
█████████
 ███████
  █████
   ███
    ★`,
        skull: '☠',
        cross: '†',
        flame: '🔥',
        lightning: '⚡',
        numbers: '777'
    },
    
    // Contact Information
    contact: {
        booking: 'booking@hellssavior.com',
        press: 'press@hellssavior.com',
        general: 'info@hellssavior.com',
        
        // Business hours
        hours: {
            timezone: 'EST',
            business: '9 AM - 6 PM',
            response: '24-48 hours'
        }
    },
    
    // Analytics (placeholder for future implementation)
    analytics: {
        googleAnalytics: '',
        facebookPixel: '',
        hotjar: ''
    },
    
    // Methods for easy access
    getColor: function(colorName) {
        return this.colors[colorName] || colorName;
    },
    
    getGradient: function(gradientName) {
        return this.colors.gradients[gradientName] || gradientName;
    },
    
    getFont: function(fontName) {
        return this.fonts[fontName] || this.fonts.primary;
    },
    
    getSocialLink: function(platform) {
        return this.social[platform] || '#';
    },
    
    isFeatureEnabled: function(featureName) {
        return this.features[featureName] || false;
    },
    
    // Shopify methods
    setShopifyCredentials: function(domain, token) {
        this.shopify.domain = domain;
        this.shopify.storefrontAccessToken = token;
        
        // Trigger Shopify reinitialization if integration exists
        if (window.shopifyIntegration) {
            window.shopifyIntegration.setCredentials(domain, token);
        }
    },
    
    getShopifyConfig: function() {
        return {
            domain: this.shopify.domain,
            storefrontAccessToken: this.shopify.storefrontAccessToken,
            apiVersion: this.shopify.apiVersion
        };
    }
};

// Make config globally accessible
window.SiteConfig = SiteConfig;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiteConfig;
}

// Auto-apply CSS custom properties for colors
document.addEventListener('DOMContentLoaded', function() {
    const root = document.documentElement;
    
    // Set CSS custom properties
    root.style.setProperty('--color-primary', SiteConfig.colors.primary);
    root.style.setProperty('--color-secondary', SiteConfig.colors.secondary);
    root.style.setProperty('--color-accent', SiteConfig.colors.accent);
    root.style.setProperty('--color-dark', SiteConfig.colors.dark);
    root.style.setProperty('--color-dark-gray', SiteConfig.colors.darkGray);
    root.style.setProperty('--color-light-gray', SiteConfig.colors.lightGray);
    
    // Set font properties
    root.style.setProperty('--font-primary', SiteConfig.fonts.primary);
    root.style.setProperty('--font-heading', SiteConfig.fonts.heading);
    root.style.setProperty('--font-display', SiteConfig.fonts.display);
    root.style.setProperty('--font-mono', SiteConfig.fonts.mono);
    
    // Set animation properties
    root.style.setProperty('--duration-fast', SiteConfig.animations.duration.fast);
    root.style.setProperty('--duration-normal', SiteConfig.animations.duration.normal);
    root.style.setProperty('--duration-slow', SiteConfig.animations.duration.slow);
});