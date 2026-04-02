// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initScrollEffects();
    initShopify();
    initAnimations();
    initMusicPlayer();
});

// Navigation functionality
function initNavigation() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    mobileMenu.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll effects
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;

        // Navbar background opacity
        if (scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        }

        // Hide scroll indicator after scrolling
        if (scrollY > 100) {
            scrollIndicator.style.opacity = '0';
        } else {
            scrollIndicator.style.opacity = '1';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.track-card, .social-link, .about-text, .about-image');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Shopify integration
function initShopify() {
    // Initialize Shopify Buy Button SDK
    const client = ShopifyBuy.buildClient({
        domain: 'your-shop-name.myshopify.com', // Replace with actual domain
        storefrontAccessToken: 'your-storefront-access-token' // Replace with actual token
    });

    // Create product grid
    createProductGrid(client);
}

function createProductGrid(client) {
    const productContainer = document.getElementById('shopify-products');
    
    // Sample product IDs - replace with actual product IDs from your Shopify store
    const productIds = [
        'gid://shopify/Product/1', // Replace with actual product IDs
        'gid://shopify/Product/2',
        'gid://shopify/Product/3'
    ];

    // If no Shopify client is available, show placeholder products
    if (!window.ShopifyBuy) {
        showPlaceholderProducts(productContainer);
        return;
    }

    productIds.forEach(productId => {
        client.product.fetch(productId).then((product) => {
            const productElement = createProductElement(product);
            productContainer.appendChild(productElement);
        }).catch(error => {
            console.log('Error fetching product:', error);
            showPlaceholderProducts(productContainer);
        });
    });
}

function createProductElement(product) {
    const productDiv = document.createElement('div');
    productDiv.className = 'product-card';
    
    const image = product.images[0] ? product.images[0].src : 'https://via.placeholder.com/300x300/ff0000/ffffff?text=MERCH';
    const price = product.variants[0].price;
    
    productDiv.innerHTML = `
        <div class="product-image">
            <img src="${image}" alt="${product.title}" loading="lazy">
            <div class="product-overlay">
                <button class="btn btn-primary buy-btn" data-variant-id="${product.variants[0].id}">
                    Buy Now - $${price}
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-price">$${price}</p>
        </div>
    `;

    // Add buy button functionality
    const buyBtn = productDiv.querySelector('.buy-btn');
    buyBtn.addEventListener('click', function() {
        const variantId = this.getAttribute('data-variant-id');
        addToCart(variantId);
    });

    return productDiv;
}

function showPlaceholderProducts(container) {
    const placeholderProducts = [
        { title: 'Hells Savior T-Shirt', price: '25.00', image: 'https://via.placeholder.com/300x300/ff0000/ffffff?text=T-SHIRT' },
        { title: 'Hells Savior Hoodie', price: '45.00', image: 'https://via.placeholder.com/300x300/ff0000/ffffff?text=HOODIE' },
        { title: 'Hells Savior Cap', price: '20.00', image: 'https://via.placeholder.com/300x300/ff0000/ffffff?text=CAP' },
        { title: 'Hells Savior Poster', price: '15.00', image: 'https://via.placeholder.com/300x300/ff0000/ffffff?text=POSTER' }
    ];

    placeholderProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';
        productDiv.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <div class="product-overlay">
                    <button class="btn btn-primary buy-btn" onclick="openShopifyStore()">
                        Buy Now - $${product.price}
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">$${product.price}</p>
            </div>
        `;
        container.appendChild(productDiv);
    });
}

function openShopifyStore() {
    // Redirect to Shopify store - replace with actual store URL
    window.open('https://your-shop-name.myshopify.com', '_blank');
}

function addToCart(variantId) {
    // Add to cart functionality
    console.log('Adding to cart:', variantId);
    // Implement actual cart functionality here
}

// Music player functionality
function initMusicPlayer() {
    const playButtons = document.querySelectorAll('.play-btn');
    
    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const trackCard = this.closest('.track-card');
            const trackTitle = trackCard.querySelector('.track-title').textContent;
            
            // Toggle play/pause icon
            if (this.classList.contains('fa-play')) {
                this.classList.remove('fa-play');
                this.classList.add('fa-pause');
                playTrack(trackTitle);
            } else {
                this.classList.remove('fa-pause');
                this.classList.add('fa-play');
                pauseTrack();
            }
        });
    });
}

function playTrack(trackTitle) {
    console.log('Playing track:', trackTitle);
    // Implement SoundCloud widget integration here
    // For now, we'll just show a notification
    showNotification(`Now playing: ${trackTitle}`);
}

function pauseTrack() {
    console.log('Pausing track');
    // Implement pause functionality
}

// Animations
function initAnimations() {
    // Add CSS classes for animations
    const style = document.createElement('style');
    style.textContent = `
        .track-card,
        .social-link,
        .about-text,
        .about-image {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .track-card.animate-in,
        .social-link.animate-in,
        .about-text.animate-in,
        .about-image.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .product-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 0, 0, 0.1);
        }
        
        .product-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 10px 30px rgba(255, 0, 0, 0.2);
            border-color: rgba(255, 0, 0, 0.3);
        }
        
        .product-image {
            position: relative;
            overflow: hidden;
        }
        
        .product-image img {
            width: 100%;
            height: 250px;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .product-card:hover .product-image img {
            transform: scale(1.1);
        }
        
        .product-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .product-card:hover .product-overlay {
            opacity: 1;
        }
        
        .product-info {
            padding: 1.5rem;
            text-align: center;
        }
        
        .product-title {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
            color: #ffffff;
        }
        
        .product-price {
            font-size: 1.1rem;
            color: #ff0000;
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
}

// Utility functions
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #ff0000, #cc0000);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
    `;

    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Contact form functionality (if needed)
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Handle form submission
            showNotification('Message sent successfully!');
        });
    }
}

// Social media integration
function initSocialMedia() {
    // Add click tracking for social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', function() {
            const platform = this.querySelector('span').textContent;
            console.log(`Clicked ${platform} link`);
            // Add analytics tracking here if needed
        });
    });
}

// Initialize social media functionality
document.addEventListener('DOMContentLoaded', function() {
    initSocialMedia();
});

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top button
function addScrollToTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(45deg, #ff0000, #cc0000);
        border: none;
        border-radius: 50%;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
    `;

    scrollBtn.addEventListener('click', scrollToTop);
    document.body.appendChild(scrollBtn);

    // Show/hide scroll to top button
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
}

// Initialize scroll to top button
document.addEventListener('DOMContentLoaded', function() {
    addScrollToTopButton();
});