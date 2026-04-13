// Cart functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.bindEvents();
        this.renderCartItems();
    }

    bindEvents() {
        // Cart button
        const cartBtn = document.getElementById('cart-btn');
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        const closeCart = document.getElementById('close-cart');

        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.openCart());
        }

        if (closeCart) {
            closeCart.addEventListener('click', () => this.closeCart());
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.closeCart());
        }

        // Search button
        const searchBtn = document.getElementById('search-btn');
        const searchModal = document.getElementById('search-modal');
        const closeSearch = document.getElementById('close-search');
        const searchInput = document.getElementById('search-input');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.openSearch());
        }

        if (closeSearch) {
            closeSearch.addEventListener('click', () => this.closeSearch());
        }

        if (searchModal) {
            searchModal.addEventListener('click', (e) => {
                if (e.target === searchModal) {
                    this.closeSearch();
                }
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }

        // Listen for add to cart events from Shopify
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
        
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }

    closeSearch() {
        const searchModal = document.getElementById('search-modal');
        
        if (searchModal) {
            searchModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1,
                variant_id: product.variant_id
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        this.showCartNotification();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartCount();
                this.renderCartItems();
            }
        }
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        // Update checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = totalItems === 0;
        }
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

        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${(item.price / 100).toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button class="quantity-btn" onclick="cart.removeItem('${item.id}')" style="margin-left: 1rem; background: rgba(255, 0, 0, 0.2); border-color: rgba(255, 0, 0, 0.5);">×</button>
                    </div>
                </div>
            </div>
        `).join('');

        if (cartTotal) {
            cartTotal.textContent = (total / 100).toFixed(2);
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    showCartNotification() {
        // Simple notification - you can enhance this
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #0066ff;
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = 'Item added to cart!';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async handleSearch(query) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults || !query.trim()) {
            if (searchResults) searchResults.innerHTML = '';
            return;
        }

        // Simple search through existing products
        // In a real implementation, you'd search through your Shopify products
        searchResults.innerHTML = '<p style="color: #fff; padding: 1rem;">Searching...</p>';
        
        // Simulate search delay
        setTimeout(() => {
            searchResults.innerHTML = '<p style="color: rgba(255,255,255,0.6); padding: 1rem;">Search functionality will be connected to your Shopify store.</p>';
        }, 500);
    }

    async checkout() {
        if (this.items.length === 0) return;

        try {
            // Create Shopify checkout
            const checkout = await this.createShopifyCheckout();
            if (checkout && checkout.webUrl) {
                window.location.href = checkout.webUrl;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('There was an error processing your checkout. Please try again.');
        }
    }

    async createShopifyCheckout() {
        // This would integrate with your Shopify store
        // For now, we'll redirect to a placeholder
        const lineItems = this.items.map(item => ({
            variantId: item.variant_id,
            quantity: item.quantity
        }));

        // In a real implementation, you'd use Shopify's Storefront API
        // For now, we'll simulate the checkout process
        console.log('Creating checkout with items:', lineItems);
        
        // Placeholder - replace with actual Shopify integration
        return {
            webUrl: 'https://your-shopify-store.myshopify.com/cart'
        };
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);