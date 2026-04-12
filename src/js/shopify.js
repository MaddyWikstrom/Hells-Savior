// Shopify Integration for Hells Savior Website
class ShopifyIntegration {
    constructor() {
        this.client = null;
        this.cart = null;
        this.products = [];
        this.isInitialized = false;
        
        this.config = {
            domain: '', // Will be set when credentials are provided
            storefrontAccessToken: '', // Will be set when credentials are provided
            apiVersion: '2023-10'
        };
        
        this.init();
    }
    
    init() {
        // Wait for page to be loaded
        document.addEventListener('pageLoaded', () => {
            this.initializeShopify();
        });
        
        // Fallback initialization
        setTimeout(() => {
            if (!this.isInitialized) {
                this.initializeShopify();
            }
        }, 3000);
    }
    
    async initializeShopify() {
        try {
            // Check if Shopify Buy SDK is loaded
            if (typeof ShopifyBuy === 'undefined') {
                console.warn('Shopify Buy SDK not loaded, showing placeholder products');
                this.showPlaceholderProducts();
                return;
            }
            
            // Only initialize client when both credentials are available and valid
            if (this.config.domain && this.config.storefrontAccessToken &&
                this.config.domain.trim() !== '' && this.config.storefrontAccessToken.trim() !== '') {
                
                try {
                    this.client = ShopifyBuy.buildClient({
                        domain: this.config.domain,
                        storefrontAccessToken: this.config.storefrontAccessToken,
                        apiVersion: this.config.apiVersion
                    });
                    
                    await this.loadProducts();
                    this.createCart();
                    this.isInitialized = true;
                } catch (clientError) {
                    console.warn('Shopify client initialization failed:', clientError);
                    this.client = null;
                    this.showPlaceholderProducts();
                }
            } else {
                // Show placeholder products until credentials are provided
                console.info('Shopify credentials not configured, showing placeholder products');
                this.showPlaceholderProducts();
            }
        } catch (error) {
            console.error('Error initializing Shopify:', error);
            this.client = null;
            this.showPlaceholderProducts();
        }
    }
    
    // Method to set credentials (call this when credentials are provided)
    setCredentials(domain, storefrontAccessToken) {
        this.config.domain = domain;
        this.config.storefrontAccessToken = storefrontAccessToken;
        
        if (!this.isInitialized) {
            this.initializeShopify();
        }
    }
    
    async loadProducts() {
        if (!this.client) {
            console.warn('Shopify client not initialized, showing placeholder products');
            this.showPlaceholderProducts();
            return;
        }
        
        try {
            const products = await this.client.product.fetchAll();
            this.products = products;
            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            // Reset client on API error to prevent further issues
            this.client = null;
            this.showPlaceholderProducts();
        }
    }
    
    renderProducts(products) {
        // Check if we're on the home page (merch preview) or shop page
        const merchScrollTrack = document.getElementById('merch-scroll-track');
        const productContainer = document.getElementById('shopify-products');
        
        if (merchScrollTrack) {
            // Home page - render scrolling preview
            this.renderMerchPreview(products);
        } else if (productContainer) {
            // Shop page - render full grid
            productContainer.innerHTML = '';
            
            if (products.length === 0) {
                this.showPlaceholderProducts();
                return;
            }
            
            products.forEach(product => {
                const productElement = this.createProductElement(product);
                productContainer.appendChild(productElement);
            });
            
            // Add stagger animation
            this.addStaggerAnimation(productContainer);
        }
    }
    
    renderMerchPreview(products) {
        const merchScrollTrack = document.getElementById('merch-scroll-track');
        if (!merchScrollTrack) return;
        
        // Use placeholder products if no real products available
        const previewProducts = products.length > 0 ? products.slice(0, 6) : this.getPreviewPlaceholderProducts();
        
        // Duplicate products for seamless scrolling
        const duplicatedProducts = [...previewProducts, ...previewProducts];
        
        merchScrollTrack.innerHTML = '';
        
        duplicatedProducts.forEach(product => {
            const previewCard = this.createPreviewCard(product);
            merchScrollTrack.appendChild(previewCard);
        });
    }
    
    createPreviewCard(product) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'merch-preview-card';
        
        const image = product.images && product.images[0] ? product.images[0].src : this.getPlaceholderImage();
        const price = product.variants && product.variants[0] ? product.variants[0].price.amount : product.price || '25.00';
        const currencyCode = product.variants && product.variants[0] ? product.variants[0].price.currencyCode : 'USD';
        const currencySymbol = currencyCode === 'USD' ? '$' : currencyCode;
        
        cardDiv.innerHTML = `
            <div class="merch-preview-image">
                <img src="${image}" alt="${product.title}" loading="lazy">
                <div class="merch-preview-overlay">
                    <a href="shop.html" class="btn btn-primary">
                        <i class="fas fa-shopping-bag"></i>
                        Shop Now
                    </a>
                </div>
            </div>
            <div class="merch-preview-info">
                <h3 class="merch-preview-title">${product.title}</h3>
                <p class="merch-preview-price">${currencySymbol}${parseFloat(price).toFixed(2)}</p>
            </div>
        `;
        
        // Add click handler to navigate to shop
        cardDiv.addEventListener('click', () => {
            window.location.href = 'shop.html';
        });
        
        return cardDiv;
    }
    
    getPreviewPlaceholderProducts() {
        return [
            {
                title: '777 Hells Savior T-Shirt',
                price: 25.00,
                image: this.generateProductImage('T-SHIRT')
            },
            {
                title: 'Hellfire Hoodie',
                price: 45.00,
                image: this.generateProductImage('HOODIE')
            },
            {
                title: 'Skull Crown Snapback',
                price: 20.00,
                image: this.generateProductImage('CAP')
            },
            {
                title: 'Chain of Souls Necklace',
                price: 35.00,
                image: this.generateProductImage('JEWELRY')
            },
            {
                title: 'Flame Vinyl Record',
                price: 30.00,
                image: this.generateProductImage('VINYL')
            },
            {
                title: 'Inferno Poster Set',
                price: 15.00,
                image: this.generateProductImage('POSTER')
            }
        ];
    }
    
    createProductElement(product) {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card stagger-item';
        
        const image = product.images[0] ? product.images[0].src : this.getPlaceholderImage();
        const price = product.variants[0].price.amount;
        const currencyCode = product.variants[0].price.currencyCode;
        
        productDiv.innerHTML = `
            <div class="product-image">
                <img src="${image}" alt="${product.title}" loading="lazy">
                <div class="product-overlay">
                    <button class="btn btn-primary buy-btn" data-variant-id="${product.variants[0].id}">
                        <i class="fas fa-shopping-cart"></i>
                        Buy Now - ${currencyCode} ${price}
                    </button>
                </div>
                <div class="product-flames">
                    <div class="product-flame product-flame-1"></div>
                    <div class="product-flame product-flame-2"></div>
                    <div class="product-flame product-flame-3"></div>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">${currencyCode} ${price}</p>
                <div class="product-description">${this.truncateText(product.description, 100)}</div>
            </div>
        `;
        
        // Add buy button functionality
        const buyBtn = productDiv.querySelector('.buy-btn');
        buyBtn.addEventListener('click', () => {
            this.addToCart(product.variants[0]);
        });
        
        // Add hover effects
        this.addProductHoverEffects(productDiv);
        
        return productDiv;
    }
    
    showPlaceholderProducts() {
        // Check if we're on the home page (merch preview) or shop page
        const merchScrollTrack = document.getElementById('merch-scroll-track');
        const productContainer = document.getElementById('shopify-products');
        
        if (merchScrollTrack) {
            // Home page - render scrolling preview
            this.renderMerchPreview([]);
        } else if (productContainer) {
            // Shop page - render full grid
            const placeholderProducts = [
                {
                    title: '777 Hells Savior T-Shirt',
                    price: '25.00',
                    image: this.generateProductImage('T-SHIRT'),
                    description: 'Official Hells Savior merchandise featuring the iconic 777 logo with skull and crossbones design.'
                },
                {
                    title: 'Hellfire Hoodie',
                    price: '45.00',
                    image: this.generateProductImage('HOODIE'),
                    description: 'Premium quality hoodie with cobalt blue flame design and Hells Savior branding.'
                },
                {
                    title: 'Skull Crown Snapback',
                    price: '20.00',
                    image: this.generateProductImage('CAP'),
                    description: 'Adjustable snapback cap with embroidered skull crown and 777 numbering.'
                },
                {
                    title: 'Inferno Poster Set',
                    price: '15.00',
                    image: this.generateProductImage('POSTER'),
                    description: 'High-quality poster set featuring exclusive Hells Savior artwork and lyrics.'
                },
                {
                    title: 'Chain of Souls Necklace',
                    price: '35.00',
                    image: this.generateProductImage('JEWELRY'),
                    description: 'Sterling silver chain necklace with skull pendant, inspired by the 777 aesthetic.'
                },
                {
                    title: 'Flame Vinyl Record',
                    price: '30.00',
                    image: this.generateProductImage('VINYL'),
                    description: 'Limited edition vinyl featuring the latest Hells Savior tracks with flame-colored pressing.'
                }
            ];
            
            productContainer.innerHTML = '';
            
            placeholderProducts.forEach((product, index) => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product-card stagger-item';
                productDiv.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.title}" loading="lazy">
                        <div class="product-overlay">
                            <button class="btn btn-primary buy-btn" onclick="window.open('https://hellssavior.myshopify.com', '_blank')">
                                <i class="fas fa-shopping-cart"></i>
                                Buy Now - $${product.price}
                            </button>
                        </div>
                        <div class="product-flames">
                            <div class="product-flame product-flame-1"></div>
                            <div class="product-flame product-flame-2"></div>
                            <div class="product-flame product-flame-3"></div>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-price">$${product.price}</p>
                        <div class="product-description">${product.description}</div>
                    </div>
                `;
                
                // Add hover effects
                this.addProductHoverEffects(productDiv);
                
                productContainer.appendChild(productDiv);
            });
            
            // Add stagger animation
            this.addStaggerAnimation(productContainer);
        }
    }
    
    generateProductImage(type) {
        // Create a data URL for a simple SVG placeholder instead of external service
        const svg = `
            <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="400" fill="#000000"/>
                <text x="200" y="180" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" text-anchor="middle">${type}</text>
                <text x="200" y="220" font-family="Arial, sans-serif" font-size="16" fill="#ff0000" text-anchor="middle">HELLS SAVIOR</text>
                <text x="200" y="250" font-family="Arial, sans-serif" font-size="20" fill="#0066ff" text-anchor="middle">777</text>
            </svg>
        `;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    
    getPlaceholderImage() {
        return this.generateProductImage('MERCH');
    }
    
    addProductHoverEffects(productDiv) {
        const flames = productDiv.querySelectorAll('.product-flame');
        
        productDiv.addEventListener('mouseenter', () => {
            flames.forEach((flame, index) => {
                setTimeout(() => {
                    flame.style.opacity = '1';
                    flame.style.animation = 'productFlameFlicker 0.6s ease-in-out infinite alternate';
                }, index * 100);
            });
        });
        
        productDiv.addEventListener('mouseleave', () => {
            flames.forEach(flame => {
                flame.style.opacity = '0.7';
                flame.style.animation = '';
            });
        });
        
        // Add flame animation styles if not already present
        if (!document.querySelector('#product-flame-styles')) {
            const style = document.createElement('style');
            style.id = 'product-flame-styles';
            style.textContent = `
                .product-flames {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                }
                
                .product-flame {
                    position: absolute;
                    width: 6px;
                    height: 20px;
                    background: linear-gradient(to top, #ff0000 0%, #ff6600 50%, #0066ff 100%);
                    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                    opacity: 0.7;
                    transition: all 0.3s ease;
                }
                
                .product-flame-1 { top: 20px; left: 20px; }
                .product-flame-2 { top: 30px; right: 25px; }
                .product-flame-3 { bottom: 25px; left: 50%; transform: translateX(-50%); }
                
                @keyframes productFlameFlicker {
                    0% {
                        transform: scaleY(1) scaleX(1) rotate(-1deg);
                        filter: brightness(1);
                    }
                    100% {
                        transform: scaleY(1.2) scaleX(0.8) rotate(1deg);
                        filter: brightness(1.3) hue-rotate(30deg);
                    }
                }
                
                .product-description {
                    font-size: 0.9rem;
                    color: #cccccc;
                    margin-top: 0.5rem;
                    line-height: 1.4;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    addStaggerAnimation(container) {
        const items = container.querySelectorAll('.stagger-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('fade-in-up');
            
            // Trigger animation
            setTimeout(() => {
                item.classList.add('animate-in');
            }, 100);
        });
    }
    
    async createCart() {
        if (!this.client) return;
        
        try {
            this.cart = await this.client.checkout.create();
        } catch (error) {
            console.error('Error creating cart:', error);
        }
    }
    
    async addToCart(variant, quantity = 1) {
        if (!this.client || !this.cart) {
            // Fallback to external store
            this.openExternalStore();
            return;
        }
        
        try {
            const lineItemsToAdd = [{
                variantId: variant.id,
                quantity: quantity
            }];
            
            this.cart = await this.client.checkout.addLineItems(this.cart.id, lineItemsToAdd);
            
            this.showNotification(`Added ${variant.product.title} to cart!`, 'success');
            this.updateCartUI();
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Error adding item to cart', 'error');
        }
    }
    
    updateCartUI() {
        // Update cart icon/counter if exists
        const cartCounter = document.querySelector('.cart-counter');
        if (cartCounter && this.cart) {
            const itemCount = this.cart.lineItems.reduce((total, item) => total + item.quantity, 0);
            cartCounter.textContent = itemCount;
            cartCounter.style.display = itemCount > 0 ? 'block' : 'none';
        }
    }
    
    openExternalStore() {
        const storeUrl = this.config.domain ? 
            `https://${this.config.domain}` : 
            'https://hellssavior.myshopify.com';
        
        window.open(storeUrl, '_blank');
        this.showNotification('Opening store in new tab...', 'info');
    }
    
    openCheckout() {
        if (this.cart && this.cart.webUrl) {
            window.open(this.cart.webUrl, '_blank');
        } else {
            this.openExternalStore();
        }
    }
    
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    showNotification(message, type = 'info') {
        // Use the main site's notification system if available
        if (window.hellsSaviorSite && window.hellsSaviorSite.showNotification) {
            window.hellsSaviorSite.showNotification(message, type);
            return;
        }
        
        // Fallback notification system
        const notification = document.createElement('div');
        notification.className = `shopify-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(45deg, #ff0000, #0066ff);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Public methods for external use
    getProducts() {
        return this.products;
    }
    
    getCart() {
        return this.cart;
    }
    
    isReady() {
        return this.isInitialized;
    }
}

// Initialize Shopify integration
const shopifyIntegration = new ShopifyIntegration();

// Make it globally accessible
window.shopifyIntegration = shopifyIntegration;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShopifyIntegration;
}