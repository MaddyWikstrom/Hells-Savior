// Shop Page JavaScript for Hells Savior Website
class ShopManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.cart = [];
        this.currentView = 'grid';
        this.currentCategory = 'all';
        this.currentSort = 'featured';
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        // Wait for page to be loaded
        document.addEventListener('pageLoaded', () => {
            this.initializeShop();
        });
        
        // Fallback initialization
        setTimeout(() => {
            this.initializeShop();
        }, 300);
    }
    
    initializeShop() {
        if (this.initialized) return;
        this.initialized = true;

        this.setupEventListeners();
        this.loadProducts();
        this.initCart();
        this.loadCartFromStorage();
        this.initShopAsciiFire();
    }
    
    initShopAsciiFire() {
        // Initialize ASCII fire background for shop page
        if (typeof createAsciiFire === 'function') {
            createAsciiFire('shop-ascii-fire');
        }
    }
    
    setupEventListeners() {
        // Filter and sort controls
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');
        const gridView = document.getElementById('grid-view');
        const listView = document.getElementById('list-view');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.filterAndSortProducts();
            });
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.filterAndSortProducts();
            });
        }
        
        if (gridView) {
            gridView.addEventListener('click', () => {
                this.setView('grid');
            });
        }
        
        if (listView) {
            listView.addEventListener('click', () => {
                this.setView('list');
            });
        }
        
        // Cart functionality
        const floatingCart = document.getElementById('floating-cart');
        const cartClose = document.getElementById('cart-close');
        const cartOverlay = document.getElementById('cart-overlay');
        const cartCheckout = document.getElementById('cart-checkout');
        
        if (floatingCart) {
            floatingCart.addEventListener('click', () => {
                this.toggleCart();
            });
        }
        
        if (cartClose) {
            cartClose.addEventListener('click', () => {
                this.closeCart();
            });
        }
        
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                this.closeCart();
            });
        }
        
        if (cartCheckout) {
            cartCheckout.addEventListener('click', () => {
                this.checkout();
            });
        }
        
        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSignup(newsletterForm);
            });
        }
    }
    
    async loadProducts() {
        this.showLoading(true);
        
        try {
            // Try to get products from Shopify integration
            // If already initialized, use cached products immediately
            if (window.shopifyIntegration && window.shopifyIntegration.isReady()) {
                const shopifyProducts = window.shopifyIntegration.getProducts();
                if (shopifyProducts && shopifyProducts.length > 0) {
                    this.products = this.convertShopifyProducts(shopifyProducts);
                    this.filteredProducts = [...this.products];
                    this.filterAndSortProducts();
                    this.showLoading(false);
                    return;
                }
            }

            // Shopify not ready yet — wait up to 5 seconds for it to initialize
            const shopifyProducts = await this.waitForShopifyProducts(5000);
            if (shopifyProducts && shopifyProducts.length > 0) {
                this.products = this.convertShopifyProducts(shopifyProducts);
            } else {
                this.products = this.getPlaceholderProducts();
            }
            
            this.filteredProducts = [...this.products];
            this.filterAndSortProducts();
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = this.getPlaceholderProducts();
            this.filteredProducts = [...this.products];
            this.renderProducts();
        } finally {
            this.showLoading(false);
        }
    }

    waitForShopifyProducts(timeoutMs) {
        return new Promise((resolve) => {
            const start = Date.now();

            const check = () => {
                if (window.shopifyIntegration && window.shopifyIntegration.isReady()) {
                    resolve(window.shopifyIntegration.getProducts());
                    return;
                }
                if (Date.now() - start >= timeoutMs) {
                    resolve([]);
                    return;
                }
                setTimeout(check, 200);
            };

            check();
        });
    }
    
    convertShopifyProducts(shopifyProducts) {
        return shopifyProducts.map(product => {
            // Support both the normalized shape from new shopify.js and legacy Buy SDK shape
            const price = product.price != null
                ? product.price
                : (product.variants && product.variants[0]
                    ? parseFloat(product.variants[0].price.amount)
                    : 0);

            const currency = product.currency
                || (product.variants && product.variants[0]
                    ? product.variants[0].price.currencyCode
                    : 'USD');

            // Image: normalized shape has product.image (string URL) and product.images [{src}]
            const image = product.image
                || (product.images && product.images[0] ? product.images[0].src : null)
                || this.generateProductImage(product.title);

            return {
                id: product.id,
                handle: product.handle || null,
                title: product.title,
                description: product.description || '',
                price: parseFloat(price),
                currency: currency,
                image: image,
                images: product.images || [],
                variants: product.variants || [],
                availableForSale: product.availableForSale !== undefined ? product.availableForSale : true,
                category: this.categorizeProduct(product.title),
                featured: true,
                shopifyProduct: product
            };
        });
    }
    
    categorizeProduct(title) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('shirt') || titleLower.includes('hoodie') || titleLower.includes('jacket')) {
            return 'clothing';
        } else if (titleLower.includes('necklace') || titleLower.includes('cap') || titleLower.includes('hat')) {
            return 'accessories';
        } else if (titleLower.includes('vinyl') || titleLower.includes('cd') || titleLower.includes('music')) {
            return 'music';
        } else if (titleLower.includes('poster') || titleLower.includes('collectible')) {
            return 'collectibles';
        }
        return 'accessories';
    }
    
    getPlaceholderProducts() {
        return [
            {
                id: 'hs-tshirt-777',
                title: '777 Hells Savior T-Shirt',
                description: 'Official Hells Savior merchandise featuring the iconic 777 logo with skull and crossbones design. Premium quality cotton blend.',
                price: 25.00,
                currency: 'USD',
                image: this.generateProductImage('T-SHIRT'),
                category: 'clothing',
                featured: true
            },
            {
                id: 'hs-hoodie-hellfire',
                title: 'Hellfire Hoodie',
                description: 'Premium quality hoodie with cobalt blue flame design and Hells Savior branding. Perfect for cold nights.',
                price: 45.00,
                currency: 'USD',
                image: this.generateProductImage('HOODIE'),
                category: 'clothing',
                featured: true
            },
            {
                id: 'hs-cap-skull',
                title: 'Skull Crown Snapback',
                description: 'Adjustable snapback cap with embroidered skull crown and 777 numbering. One size fits all.',
                price: 20.00,
                currency: 'USD',
                image: this.generateProductImage('CAP'),
                category: 'accessories',
                featured: false
            },
            {
                id: 'hs-poster-set',
                title: 'Inferno Poster Set',
                description: 'High-quality poster set featuring exclusive Hells Savior artwork and lyrics. Set of 3 posters.',
                price: 15.00,
                currency: 'USD',
                image: this.generateProductImage('POSTER'),
                category: 'collectibles',
                featured: false
            },
            {
                id: 'hs-necklace-souls',
                title: 'Chain of Souls Necklace',
                description: 'Sterling silver chain necklace with skull pendant, inspired by the 777 aesthetic. Comes with gift box.',
                price: 35.00,
                currency: 'USD',
                image: this.generateProductImage('JEWELRY'),
                category: 'accessories',
                featured: true
            },
            {
                id: 'hs-vinyl-flame',
                title: 'Flame Vinyl Record',
                description: 'Limited edition vinyl featuring the latest Hells Savior tracks with flame-colored pressing. Collector\'s item.',
                price: 30.00,
                currency: 'USD',
                image: this.generateProductImage('VINYL'),
                category: 'music',
                featured: true
            },
            {
                id: 'hs-jacket-leather',
                title: 'Hellbound Leather Jacket',
                description: 'Premium leather jacket with custom Hells Savior patches and 777 embroidery. Limited edition.',
                price: 120.00,
                currency: 'USD',
                image: this.generateProductImage('JACKET'),
                category: 'clothing',
                featured: true
            },
            {
                id: 'hs-sticker-pack',
                title: 'Demon Sticker Pack',
                description: 'Collection of 10 high-quality vinyl stickers featuring Hells Savior logos and artwork.',
                price: 8.00,
                currency: 'USD',
                image: this.generateProductImage('STICKERS'),
                category: 'collectibles',
                featured: false
            }
        ];
    }
    
    generateProductImage(type) {
        const svg = `
            <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#1a1a1a;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="400" height="400" fill="url(#bg)"/>
                <text x="200" y="160" font-family="Arial, sans-serif" font-size="28" fill="#ffffff" text-anchor="middle" font-weight="bold">${type}</text>
                <text x="200" y="200" font-family="Arial, sans-serif" font-size="18" fill="#ff0000" text-anchor="middle">HELLS SAVIOR</text>
                <text x="200" y="240" font-family="Arial, sans-serif" font-size="24" fill="#0066ff" text-anchor="middle" font-weight="bold">777</text>
                <circle cx="200" cy="280" r="30" fill="none" stroke="#0066ff" stroke-width="2" opacity="0.5"/>
                <polygon points="200,260 210,290 190,290" fill="#0066ff" opacity="0.7"/>
            </svg>
        `;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    
    filterAndSortProducts() {
        let filtered = [...this.products];
        
        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(product => product.category === this.currentCategory);
        }
        
        // Sort products
        switch (this.currentSort) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'newest':
                filtered.sort((a, b) => b.id.localeCompare(a.id));
                break;
            case 'featured':
            default:
                filtered.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return 0;
                });
                break;
        }
        
        this.filteredProducts = filtered;
        this.renderProducts();
    }
    
    renderProducts() {
        const container = document.getElementById('shop-products');
        const emptyState = document.getElementById('shop-empty');
        
        if (!container) return;
        
        if (this.filteredProducts.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        container.style.display = 'grid';
        container.innerHTML = '';
        
        this.filteredProducts.forEach((product, index) => {
            const productElement = this.createProductElement(product, index);
            container.appendChild(productElement);
        });
        
        // Add stagger animation
        setTimeout(() => {
            container.classList.add('loaded');
            this.addStaggerAnimation(container);
        }, 100);
    }
    
    createProductElement(product, index) {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card stagger-item';
        productDiv.style.animationDelay = `${index * 0.1}s`;
        productDiv.style.cursor = 'pointer';
        
        const currencySymbol = product.currency === 'USD' ? '$' : product.currency;
        
        productDiv.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <div class="product-overlay">
                    <button class="btn btn-primary view-product-btn" data-product-id="${product.id}">
                        <i class="fas fa-eye"></i>
                        View Product
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
                <p class="product-price">${currencySymbol}${product.price.toFixed(2)}</p>
            </div>
        `;
        
        // Navigate to product detail page on card click
        const navigateToProduct = () => {
            const params = new URLSearchParams();
            if (product.shopifyProduct) {
                params.set('id', product.id);
            } else {
                params.set('id', product.id);
            }
            window.location.href = 'product.html?' + params.toString();
        };
        
        productDiv.addEventListener('click', navigateToProduct);
        
        // View product button
        const viewBtn = productDiv.querySelector('.view-product-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateToProduct();
            });
        }
        
        // Add hover effects
        this.addProductHoverEffects(productDiv);
        
        return productDiv;
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
    }
    
    addStaggerAnimation(container) {
        const items = container.querySelectorAll('.stagger-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate-in');
            }, index * 100);
        });
    }
    
    setView(view) {
        this.currentView = view;
        const container = document.getElementById('shop-products');
        const gridBtn = document.getElementById('grid-view');
        const listBtn = document.getElementById('list-view');
        
        if (container) {
            container.classList.remove('list-view', 'grid-view');
            container.classList.add(`${view}-view`);
        }
        
        if (gridBtn && listBtn) {
            gridBtn.classList.toggle('active', view === 'grid');
            listBtn.classList.toggle('active', view === 'list');
        }
    }
    
    // Cart functionality
    initCart() {
        this.updateCartUI();
    }
    
    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification(`Added ${product.title} to cart!`, 'success');
        
        // Add visual feedback
        this.animateCartAdd();
    }
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateCartUI();
        this.renderCartItems();
    }
    
    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCartToStorage();
                this.updateCartUI();
                this.renderCartItems();
            }
        }
    }
    
    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        const floatingCart = document.getElementById('floating-cart');
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.classList.toggle('visible', totalItems > 0);
        }
        
        if (cartTotal) {
            cartTotal.textContent = totalPrice.toFixed(2);
        }
        
        // Show/hide floating cart button based on cart contents
        if (floatingCart) {
            floatingCart.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        this.renderCartItems();
    }
    
    renderCartItems() {
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #cccccc; padding: 2rem;">Your cart is empty</p>';
            return;
        }
        
        cartItems.innerHTML = '';
        
        this.cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="shopManager.updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="shopManager.updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button class="quantity-btn" onclick="shopManager.removeFromCart('${item.id}')" style="margin-left: 0.5rem; background: #ff0000;">×</button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar && cartOverlay) {
            const isOpen = cartSidebar.classList.contains('open');
            
            if (isOpen) {
                this.closeCart();
            } else {
                cartSidebar.classList.add('open');
                cartOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    }
    
    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }
        
        // If Shopify integration is available, use it
        if (window.shopifyIntegration && window.shopifyIntegration.isReady()) {
            window.shopifyIntegration.openCheckout();
        } else {
            // Fallback to external store
            window.open('https://hellssavior.myshopify.com', '_blank');
        }
        
        this.showNotification('Redirecting to checkout...', 'info');
    }
    
    animateCartAdd() {
        const floatingCart = document.getElementById('floating-cart');
        if (floatingCart) {
            floatingCart.style.transform = 'translateY(-3px) scale(1.2)';
            setTimeout(() => {
                floatingCart.style.transform = '';
            }, 300);
        }
    }
    
    // Storage functions
    saveCartToStorage() {
        localStorage.setItem('hellsSaviorCart', JSON.stringify(this.cart));
    }
    
    loadCartFromStorage() {
        const savedCart = localStorage.getItem('hellsSaviorCart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
                this.updateCartUI();
            } catch (error) {
                console.error('Error loading cart from storage:', error);
                this.cart = [];
            }
        }
    }
    
    // Newsletter signup — creates a Shopify customer with email marketing consent
    async handleNewsletterSignup(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();

        if (!email) return;

        // Disable form while submitting
        emailInput.disabled = true;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        }

        try {
            // Use the Shopify Storefront API customerCreate mutation
            const config = window.SiteConfig
                ? window.SiteConfig.getShopifyConfig()
                : { domain: 'hells-savior.myshopify.com', storefrontAccessToken: 'cc767d2e56cf9350db5eac6eb800d2b6', apiVersion: '2023-10' };

            const apiUrl = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;

            // Generate a random password (customer won't use it — this is just for the required field)
            const randomPassword = crypto.getRandomValues(new Uint8Array(16))
                .reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');

            const mutation = `
                mutation customerCreate($input: CustomerCreateInput!) {
                    customerCreate(input: $input) {
                        customer {
                            id
                            email
                        }
                        customerUserErrors {
                            field
                            message
                            code
                        }
                    }
                }
            `;

            const variables = {
                input: {
                    email: email,
                    password: randomPassword,
                    acceptsMarketing: true
                }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
                },
                body: JSON.stringify({ query: mutation, variables })
            });

            if (!response.ok) {
                throw new Error(`Network error: ${response.status}`);
            }

            const data = await response.json();
            const result = data.data?.customerCreate;

            if (result?.customerUserErrors?.length > 0) {
                const error = result.customerUserErrors[0];
                // Handle "already taken" email gracefully
                if (error.code === 'TAKEN' || error.message.toLowerCase().includes('taken')) {
                    this.showNewsletterSuccess(form, 'You\'re already subscribed! 🔥');
                } else {
                    throw new Error(error.message);
                }
            } else if (result?.customer) {
                this.showNewsletterSuccess(form, 'You\'re in! 🔥 We\'ll notify you about new drops.');
            } else {
                throw new Error('Unexpected response from server');
            }

        } catch (error) {
            console.error('Newsletter signup error:', error);
            this.showNotification('Something went wrong. Please try again.', 'error');
            // Re-enable the form on error
            emailInput.disabled = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-envelope"></i> Subscribe';
            }
        }
    }

    // Show success state on the newsletter form
    showNewsletterSuccess(form, message) {
        const formContainer = form.closest('.newsletter-content');
        
        // Replace the form with a success message
        form.innerHTML = `
            <div class="newsletter-success">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        form.classList.add('newsletter-submitted');
        
        // Also show a notification
        this.showNotification(message, 'success');
    }
    
    // Utility functions
    showLoading(show) {
        const loading = document.getElementById('shop-loading');
        const products = document.getElementById('shop-products');
        
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
        
        if (products) {
            products.style.display = show ? 'none' : 'grid';
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
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(45deg, #0066ff, #00aaff);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 102, 255, 0.3);
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
}

// Initialize shop manager
let shopManager;

document.addEventListener('DOMContentLoaded', () => {
    shopManager = new ShopManager();
});

// Fallback initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        shopManager = new ShopManager();
    });
} else {
    shopManager = new ShopManager();
}

// Make it globally accessible
window.shopManager = shopManager;