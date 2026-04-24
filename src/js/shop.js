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
            // Check if Shopify integration is available and has products
            if (window.shopifyIntegration && window.shopifyIntegration.isReady()) {
                const shopifyProducts = window.shopifyIntegration.getProducts();
                if (shopifyProducts && shopifyProducts.length > 0) {
                    this.products = this.convertShopifyProducts(shopifyProducts);
                } else {
                    this.products = this.getPlaceholderProducts();
                }
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
    
    convertShopifyProducts(shopifyProducts) {
        return shopifyProducts.map(product => ({
            id: product.id,
            title: product.title,
            description: product.description,
            price: parseFloat(product.variants[0].price.amount),
            currency: product.variants[0].price.currencyCode,
            image: product.images[0] ? product.images[0].src : this.generateProductImage(product.title),
            category: this.categorizeProduct(product.title),
            featured: Math.random() > 0.5,
            shopifyProduct: product
        }));
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
        
        const currencySymbol = product.currency === 'USD' ? '$' : product.currency;
        
        productDiv.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <div class="product-overlay">
                    <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart - ${currencySymbol}${product.price.toFixed(2)}
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
                <div class="product-description">${this.truncateText(product.description, 100)}</div>
            </div>
        `;
        
        // Add event listeners
        const addToCartBtn = productDiv.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
            this.addToCart(product);
        });
        
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
    
    // Newsletter signup
    handleNewsletterSignup(form) {
        const email = form.querySelector('input[type="email"]').value;
        
        // Simulate newsletter signup
        this.showNotification('Thank you for subscribing!', 'success');
        form.reset();
        
        // Here you would typically send the email to your newsletter service
        console.log('Newsletter signup:', email);
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