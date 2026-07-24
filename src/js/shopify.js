// Shopify Storefront API Integration for Hells Savior Website
// Uses the Storefront GraphQL API directly (no Buy SDK required)

class ShopifyIntegration {
    constructor() {
        this.products = [];
        this.checkout = null;
        this.isInitialized = false;

        this.config = {
            domain: 'hells-savior.myshopify.com',
            storefrontAccessToken: 'cc767d2e56cf9350db5eac6eb800d2b6',
            apiVersion: '2023-10'
        };

        this.init();
    }

    get apiUrl() {
        return `https://${this.config.domain}/api/${this.config.apiVersion}/graphql.json`;
    }

    async graphql(query, variables = {}) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': this.config.storefrontAccessToken
            },
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();

        if (json.errors) {
            throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
        }

        return json.data;
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeShopify());
        } else {
            setTimeout(() => this.initializeShopify(), 100);
        }

        // Fallback
        setTimeout(() => {
            if (!this.isInitialized) this.initializeShopify();
        }, 1500);
    }

    async initializeShopify() {
        if (this.isInitialized) return;

        // Prevent concurrent initialization (Safari race condition fix)
        if (this._initPromise) return this._initPromise;

        this._initPromise = (async () => {
            try {
                await this.loadProducts();
                this.isInitialized = true;
                console.info('[Shopify] Initialized successfully with', this.products.length, 'product(s)');
            } catch (error) {
                console.error('[Shopify] Initialization failed:', error);
                this.showPlaceholderProducts();
            } finally {
                this._initPromise = null;
            }
        })();

        return this._initPromise;
    }

    async loadProducts() {
        const query = `
            {
                products(first: 50) {
                    edges {
                        node {
                            id
                            title
                            description
                            descriptionHtml
                            handle
                            priceRange {
                                minVariantPrice {
                                    amount
                                    currencyCode
                                }
                            }
                            images(first: 5) {
                                edges {
                                    node {
                                        url
                                        altText
                                    }
                                }
                            }
                            options {
                                name
                                values
                            }
                            variants(first: 20) {
                                edges {
                                    node {
                                        id
                                        title
                                        price {
                                            amount
                                            currencyCode
                                        }
                                        availableForSale
                                        selectedOptions {
                                            name
                                            value
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const data = await this.graphql(query);
        const rawProducts = data.products.edges.map(edge => edge.node);

        if (rawProducts.length === 0) {
            console.warn('[Shopify] No products returned from API — showing placeholders');
            this.showPlaceholderProducts();
            return;
        }

        // Normalize product shape to match what shop.js / product.js expects
        this.products = rawProducts.map(p => ({
            id: p.id,
            handle: p.handle,
            title: p.title,
            description: p.description || '',
            descriptionHtml: p.descriptionHtml || '',
            price: parseFloat(p.priceRange.minVariantPrice.amount),
            currency: p.priceRange.minVariantPrice.currencyCode,
            // images array: [{src, altText}]
            images: p.images.edges.map(e => ({ src: e.node.url, altText: e.node.altText })),
            // options array: [{name, values}] — used by product.js to render size/color buttons
            options: (p.options || []).map(o => ({ name: o.name, values: o.values })),
            // variants array with selectedOptions so product.js can match selections
            variants: p.variants.edges.map(e => ({
                id: e.node.id,
                title: e.node.title,
                price: e.node.price,
                availableForSale: e.node.availableForSale,
                selectedOptions: e.node.selectedOptions || []
            })),
            // Convenience fields
            image: p.images.edges.length > 0 ? p.images.edges[0].node.url : null,
            availableForSale: p.variants.edges.some(e => e.node.availableForSale)
        }));

        this.renderProducts(this.products);
    }

    renderProducts(products) {
        // Home page merch preview scroll track
        const merchScrollTrack = document.getElementById('merch-scroll-track');
        // Shop page product grid (used by shopify.js legacy path — shop.js has its own renderer)
        const productContainer = document.getElementById('shopify-products');

        if (merchScrollTrack) {
            this.renderMerchPreview(products);
        } else if (productContainer) {
            productContainer.innerHTML = '';

            if (products.length === 0) {
                this.showPlaceholderProducts();
                return;
            }

            products.forEach(product => {
                const el = this.createProductElement(product);
                productContainer.appendChild(el);
            });

            this.addStaggerAnimation(productContainer);
        }
    }

    renderMerchPreview(products) {
        const merchScrollTrack = document.getElementById('merch-scroll-track');
        if (!merchScrollTrack) return;

        const previewProducts = products.length > 0 ? products.slice(0, 6) : this.getPreviewPlaceholderProducts();

        // Only duplicate if we have enough products to fill the scroll track
        // With 1 product, duplicating just shows 2 cards — use more copies for seamless scroll
        let displayProducts;
        if (previewProducts.length === 1) {
            // Repeat single product enough times to fill the track
            displayProducts = Array(8).fill(previewProducts[0]);
        } else if (previewProducts.length < 4) {
            // Duplicate to ensure enough cards for scrolling
            displayProducts = [...previewProducts, ...previewProducts, ...previewProducts];
        } else {
            // Standard duplicate for seamless infinite scroll
            displayProducts = [...previewProducts, ...previewProducts];
        }

        merchScrollTrack.innerHTML = '';
        displayProducts.forEach(product => {
            const card = this.createPreviewCard(product);
            merchScrollTrack.appendChild(card);
        });
    }

    createPreviewCard(product) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'merch-preview-card';

        const image = product.image || (product.images && product.images[0] ? product.images[0].src : this.getPlaceholderImage());
        const price = product.price || (product.variants && product.variants[0] ? parseFloat(product.variants[0].price.amount) : 25.00);
        const currency = product.currency || (product.variants && product.variants[0] ? product.variants[0].price.currencyCode : 'USD');
        const currencySymbol = currency === 'USD' ? '$' : currency;

        // Build the product detail URL
        const productUrl = product.id
            ? `product.html?id=${encodeURIComponent(product.id)}`
            : 'shop.html';

        cardDiv.innerHTML = `
            <div class="merch-preview-image">
                <img src="${image}" alt="${product.title}" loading="lazy">
                <div class="merch-preview-overlay">
                    <a href="${productUrl}" class="btn btn-primary">
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

        cardDiv.addEventListener('click', () => {
            window.location.href = productUrl;
        });

        return cardDiv;
    }

    createProductElement(product) {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card stagger-item';

        const image = product.image || this.getPlaceholderImage();
        const price = product.price || 0;
        const currency = product.currency || 'USD';
        const currencySymbol = currency === 'USD' ? '$' : currency;

        productDiv.innerHTML = `
            <div class="product-image">
                <img src="${image}" alt="${product.title}" loading="lazy">
                <div class="product-overlay">
                    <button class="btn btn-primary view-product-btn">
                        <i class="fas fa-eye"></i>
                        View Product
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">${currencySymbol}${parseFloat(price).toFixed(2)}</p>
                <div class="product-description">${this.truncateText(product.description, 100)}</div>
            </div>
        `;

        const navigate = () => {
            window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
        };

        productDiv.addEventListener('click', navigate);
        const viewBtn = productDiv.querySelector('.view-product-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', e => { e.stopPropagation(); navigate(); });
        }

        this.addProductHoverEffects(productDiv);
        return productDiv;
    }

    showPlaceholderProducts() {
        const merchScrollTrack = document.getElementById('merch-scroll-track');
        const productContainer = document.getElementById('shopify-products');

        if (merchScrollTrack) {
            this.renderMerchPreview([]);
        } else if (productContainer) {
            const placeholders = this.getPreviewPlaceholderProducts();
            productContainer.innerHTML = '';

            placeholders.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product-card stagger-item';
                productDiv.innerHTML = `
                    <div class="product-image">
                        <img src="${this.generateProductImage(product.type || 'MERCH')}" alt="${product.title}" loading="lazy">
                        <div class="product-overlay">
                            <button class="btn btn-primary buy-btn" onclick="window.open('https://hells-savior.myshopify.com', '_blank')">
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
                this.addProductHoverEffects(productDiv);
                productContainer.appendChild(productDiv);
            });

            this.addStaggerAnimation(productContainer);
        }
    }

    getPreviewPlaceholderProducts() {
        return [
            { title: '777 Hells Savior T-Shirt', price: '25.00', type: 'T-SHIRT', description: 'Official Hells Savior merchandise.' },
            { title: 'Hellfire Hoodie', price: '45.00', type: 'HOODIE', description: 'Premium quality hoodie.' },
            { title: 'Skull Crown Snapback', price: '20.00', type: 'CAP', description: 'Adjustable snapback cap.' },
            { title: 'Chain of Souls Necklace', price: '35.00', type: 'JEWELRY', description: 'Sterling silver chain necklace.' },
            { title: 'Flame Vinyl Record', price: '30.00', type: 'VINYL', description: 'Limited edition vinyl.' },
            { title: 'Inferno Poster Set', price: '15.00', type: 'POSTER', description: 'High-quality poster set.' }
        ];
    }

    generateProductImage(type) {
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

        if (!document.querySelector('#product-flame-styles')) {
            const style = document.createElement('style');
            style.id = 'product-flame-styles';
            style.textContent = `
                .product-flames {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    pointer-events: none;
                }
                .product-flame {
                    position: absolute;
                    width: 6px; height: 20px;
                    background: linear-gradient(to top, #ff0000 0%, #ff6600 50%, #0066ff 100%);
                    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                    opacity: 0.7;
                    transition: all 0.3s ease;
                }
                .product-flame-1 { top: 20px; left: 20px; }
                .product-flame-2 { top: 30px; right: 25px; }
                .product-flame-3 { bottom: 25px; left: 50%; transform: translateX(-50%); }
                @keyframes productFlameFlicker {
                    0% { transform: scaleY(1) scaleX(1) rotate(-1deg); filter: brightness(1); }
                    100% { transform: scaleY(1.2) scaleX(0.8) rotate(1deg); filter: brightness(1.3) hue-rotate(30deg); }
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
            setTimeout(() => item.classList.add('animate-in'), 100);
        });
    }

    // Create a Shopify cart and return the checkout URL (uses Cart API)
    async createCart(lineItems) {
        const mutation = `
            mutation cartCreate($input: CartInput!) {
                cartCreate(input: $input) {
                    cart {
                        id
                        checkoutUrl
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;

        const lines = lineItems.map(item => ({
            merchandiseId: item.variantId,
            quantity: item.quantity || 1
        }));

        const data = await this.graphql(mutation, { input: { lines } });
        const { cart, userErrors } = data.cartCreate;

        if (userErrors && userErrors.length > 0) {
            throw new Error(userErrors.map(e => e.message).join(', '));
        }

        return cart;
    }

    async openCheckout(lineItems) {
        try {
            if (!lineItems || lineItems.length === 0) {
                window.open(`https://${this.config.domain}`, '_blank');
                return;
            }

            const cart = await this.createCart(lineItems);
            if (cart && cart.checkoutUrl) {
                window.location.href = cart.checkoutUrl;
            } else {
                window.open(`https://${this.config.domain}`, '_blank');
            }
        } catch (error) {
            console.error('[Shopify] Checkout error:', error);
            window.open(`https://${this.config.domain}`, '_blank');
        }
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showNotification(message, type = 'info') {
        if (window.hellsSaviorSite && window.hellsSaviorSite.showNotification) {
            window.hellsSaviorSite.showNotification(message, type);
            return;
        }

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
                if (notification.parentNode) notification.parentNode.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Public API
    getProducts() { return this.products; }
    isReady() { return this.isInitialized; }

    setCredentials(domain, storefrontAccessToken) {
        this.config.domain = domain;
        this.config.storefrontAccessToken = storefrontAccessToken;
        this.isInitialized = false;
        this.initializeShopify();
    }
}

// Initialize and expose globally
const shopifyIntegration = new ShopifyIntegration();
window.shopifyIntegration = shopifyIntegration;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShopifyIntegration;
}
