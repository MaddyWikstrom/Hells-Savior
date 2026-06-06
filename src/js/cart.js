// Cart functionality — Hells Savior
// Manages local cart state (localStorage) and Shopify checkout via Cart API

class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('hs_cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.bindEvents();
        this.renderCartItems();
    }

    bindEvents() {
        const cartBtn     = document.getElementById('cart-btn');
        const cartOverlay = document.getElementById('cart-overlay');
        const closeCart   = document.getElementById('close-cart');

        if (cartBtn)     cartBtn.addEventListener('click', () => this.openCart());
        if (closeCart)   closeCart.addEventListener('click', () => this.closeCart());
        if (cartOverlay) cartOverlay.addEventListener('click', () => this.closeCart());

        // Search
        const searchBtn   = document.getElementById('search-btn');
        const searchModal = document.getElementById('search-modal');
        const closeSearch = document.getElementById('close-search');
        const searchInput = document.getElementById('search-input');

        if (searchBtn)   searchBtn.addEventListener('click', () => this.openSearch());
        if (closeSearch) closeSearch.addEventListener('click', () => this.closeSearch());
        if (searchModal) {
            searchModal.addEventListener('click', (e) => {
                if (e.target === searchModal) this.closeSearch();
            });
        }
        if (searchInput) searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.checkout());

        // Listen for add-to-cart events dispatched by other scripts
        document.addEventListener('shopify:cart:add', (e) => {
            this.addItem(e.detail);
        });
    }

    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartSidebar) cartSidebar.classList.add('active');
        if (cartOverlay) cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartSidebar) cartSidebar.classList.remove('active');
        if (cartOverlay) cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    openSearch() {
        const searchModal = document.getElementById('search-modal');
        const searchInput = document.getElementById('search-input');
        if (searchModal) {
            searchModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        if (searchInput) setTimeout(() => searchInput.focus(), 100);
    }

    closeSearch() {
        const searchModal = document.getElementById('search-modal');
        if (searchModal) {
            searchModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /* =============================================
       ADD / REMOVE / UPDATE ITEMS
       ============================================= */
    addItem(product) {
        // Use variant_id as the unique key so different sizes are separate line items
        const key = product.variant_id || product.id;
        const existingItem = this.items.find(item => (item.variant_id || item.id) === key);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + (product.quantity || 1);
        } else {
            this.items.push({
                id: product.id,
                title: product.title,
                variantTitle: product.variantTitle || '',
                price: product.price,          // stored in cents
                image: product.image || '',
                quantity: product.quantity || 1,
                variant_id: product.variant_id || product.id
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
    }

    removeItem(variantId) {
        this.items = this.items.filter(item => (item.variant_id || item.id) !== variantId);
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
    }

    updateQuantity(variantId, qty) {
        const item = this.items.find(item => (item.variant_id || item.id) === variantId);
        if (!item) return;
        if (qty <= 0) {
            this.removeItem(variantId);
        } else {
            item.quantity = qty;
            this.saveCart();
            this.updateCartCount();
            this.renderCartItems();
        }
    }

    /* =============================================
       CART COUNT & RENDER
       ============================================= */
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = this.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) checkoutBtn.disabled = totalItems === 0;
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            if (cartTotal) cartTotal.textContent = '0.00';
            return;
        }

        // Total in cents → dollars
        const total = this.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

        cartItemsContainer.innerHTML = this.items.map(item => {
            const key = item.variant_id || item.id;
            const displayTitle = item.variantTitle
                ? `${item.title} <span style="color:rgba(255,255,255,0.5);font-size:0.8em;">(${item.variantTitle})</span>`
                : item.title;
            const imgHtml = item.image
                ? `<img src="${item.image}" alt="${item.title}" class="cart-item-image">`
                : `<div class="cart-item-image" style="background:#111;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🛍️</div>`;

            return `
                <div class="cart-item" data-id="${key}">
                    ${imgHtml}
                    <div class="cart-item-details">
                        <div class="cart-item-title">${displayTitle}</div>
                        <div class="cart-item-price">$${(item.price / 100).toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="window.cart.updateQuantity('${key}', ${(item.quantity || 1) - 1})">−</button>
                            <span>${item.quantity || 1}</span>
                            <button class="quantity-btn" onclick="window.cart.updateQuantity('${key}', ${(item.quantity || 1) + 1})">+</button>
                            <button class="quantity-btn remove-btn" onclick="window.cart.removeItem('${key}')" title="Remove">×</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (cartTotal) cartTotal.textContent = (total / 100).toFixed(2);
    }

    saveCart() {
        localStorage.setItem('hs_cart', JSON.stringify(this.items));
    }

    /* =============================================
       CHECKOUT — Shopify Cart API
       ============================================= */
    async checkout() {
        if (this.items.length === 0) return;

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = 'Processing...';
        }

        try {
            const checkoutUrl = await this.createShopifyCheckout();
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('[Cart] Checkout error:', error);
            // Fallback: open store homepage
            window.open('https://hells-savior.myshopify.com', '_blank');
        } finally {
            if (checkoutBtn) {
                checkoutBtn.disabled = this.items.length === 0;
                checkoutBtn.textContent = 'Checkout';
            }
        }
    }

    async createShopifyCheckout() {
        // Build line items from cart — only items that have a real Shopify variant ID
        const lineItems = this.items
            .filter(item => item.variant_id && String(item.variant_id).startsWith('gid://'))
            .map(item => ({
                merchandiseId: item.variant_id,
                quantity: item.quantity || 1
            }));

        if (lineItems.length === 0) {
            // No real Shopify items — open store
            window.open('https://hells-savior.myshopify.com', '_blank');
            return null;
        }

        // Use Shopify Cart API (cartCreate mutation)
        const domain = 'hells-savior.myshopify.com';
        const token  = 'cc767d2e56cf9350db5eac6eb800d2b6';
        const apiUrl = `https://${domain}/api/2023-10/graphql.json`;

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

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': token
            },
            body: JSON.stringify({
                query: mutation,
                variables: { input: { lines: lineItems } }
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const json = await response.json();

        if (json.errors) throw new Error(JSON.stringify(json.errors));

        const { cart, userErrors } = json.data.cartCreate;

        if (userErrors && userErrors.length > 0) {
            throw new Error(userErrors.map(e => e.message).join(', '));
        }

        return cart ? cart.checkoutUrl : null;
    }

    /* =============================================
       SEARCH
       ============================================= */
    async handleSearch(query) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        if (!query.trim()) {
            searchResults.innerHTML = '';
            return;
        }

        searchResults.innerHTML = '<p style="color:rgba(255,255,255,0.5);padding:1rem;">Searching...</p>';

        // Search through Shopify products if available
        const products = window.shopifyIntegration ? window.shopifyIntegration.getProducts() : [];
        const q = query.toLowerCase();
        const matches = products.filter(p =>
            p.title.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q))
        );

        if (matches.length === 0) {
            searchResults.innerHTML = '<p style="color:rgba(255,255,255,0.5);padding:1rem;">No products found.</p>';
            return;
        }

        searchResults.innerHTML = matches.slice(0, 5).map(p => {
            const img = p.image || (p.images && p.images[0] ? p.images[0].src : '');
            const price = p.price ? `$${parseFloat(p.price).toFixed(2)}` : '';
            return `
                <div class="search-result-item" onclick="window.location.href='product.html?id=${encodeURIComponent(p.id)}'" style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.07);">
                    ${img ? `<img src="${img}" alt="${p.title}" style="width:48px;height:48px;object-fit:cover;border-radius:4px;">` : ''}
                    <div>
                        <div style="color:#fff;font-size:0.9rem;">${p.title}</div>
                        ${price ? `<div style="color:#2255cc;font-size:0.8rem;">${price}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
});

// CSS for cart items
const cartStyle = document.createElement('style');
cartStyle.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to   { transform: translateX(0);    opacity: 1; }
    }

    .cart-item {
        display: flex;
        gap: 0.75rem;
        padding: 0.85rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        align-items: flex-start;
    }

    .cart-item-image {
        width: 64px;
        height: 64px;
        object-fit: cover;
        border-radius: 6px;
        flex-shrink: 0;
        background: #111;
    }

    .cart-item-details {
        flex: 1;
        min-width: 0;
    }

    .cart-item-title {
        font-size: 0.85rem;
        color: #fff;
        margin-bottom: 0.2rem;
        line-height: 1.3;
    }

    .cart-item-price {
        font-size: 0.9rem;
        color: #2255cc;
        font-family: 'Bebas Neue', cursive;
        letter-spacing: 1px;
        margin-bottom: 0.4rem;
    }

    .cart-item-quantity {
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }

    .quantity-btn {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        color: #fff;
        width: 26px;
        height: 26px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        padding: 0;
        line-height: 1;
    }

    .quantity-btn:hover { background: rgba(255,255,255,0.18); }

    .quantity-btn.remove-btn {
        background: rgba(255,0,0,0.12);
        border-color: rgba(255,0,0,0.3);
        margin-left: 0.25rem;
        font-size: 1.1rem;
    }

    .quantity-btn.remove-btn:hover { background: rgba(255,0,0,0.3); }

    .cart-item-quantity span {
        min-width: 22px;
        text-align: center;
        font-size: 0.9rem;
        color: #fff;
    }

    .empty-cart {
        text-align: center;
        color: rgba(255,255,255,0.4);
        padding: 2rem 0;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(cartStyle);
