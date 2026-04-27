// Product Detail Page — Hells Savior
// Reads ?id=<shopify-product-id> or ?handle=<product-handle> from the URL,
// fetches the product from Shopify (or falls back to placeholder data),
// and renders the full product detail experience.

(function () {
    'use strict';

    /* =============================================
       STATE
       ============================================= */
    let currentProduct = null;
    let selectedVariant = null;
    let quantity = 1;
    let allProducts = []; // for related products

    /* =============================================
       INIT
       ============================================= */
    document.addEventListener('DOMContentLoaded', function () {
        initProductPage();
    });

    function initProductPage() {
        setupQuantityControls();
        setupLightbox();
        loadProduct();
    }

    /* =============================================
       URL PARAMS
       ============================================= */
    function getUrlParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    /* =============================================
       LOAD PRODUCT
       ============================================= */
    async function loadProduct() {
        const productId = getUrlParam('id');
        const productHandle = getUrlParam('handle');
        const productIndex = getUrlParam('index'); // fallback: index into placeholder list

        showState('loading');

        try {
            // Try Shopify first
            if (window.shopifyIntegration && window.shopifyIntegration.isReady()) {
                const products = window.shopifyIntegration.getProducts();
                allProducts = products;

                let product = null;

                if (productId) {
                    product = products.find(p => String(p.id) === String(productId));
                } else if (productHandle) {
                    product = products.find(p => p.handle === productHandle);
                } else if (productIndex !== null) {
                    product = products[parseInt(productIndex, 10)] || null;
                }

                if (product) {
                    renderShopifyProduct(product);
                    renderRelatedProducts(products, product);
                    return;
                }
            }

            // Fallback: placeholder data
            const placeholders = getPlaceholderProducts();
            allProducts = placeholders;

            let product = null;
            if (productId) {
                product = placeholders.find(p => p.id === productId);
            } else if (productHandle) {
                product = placeholders.find(p => p.handle === productHandle);
            } else if (productIndex !== null) {
                product = placeholders[parseInt(productIndex, 10)] || null;
            }

            if (!product && placeholders.length > 0) {
                // Default to first product if no specific one requested
                product = placeholders[0];
            }

            if (product) {
                renderPlaceholderProduct(product);
                renderRelatedProducts(placeholders, product);
            } else {
                showState('error');
            }

        } catch (err) {
            console.error('[product.js] Error loading product:', err);
            showState('error');
        }
    }

    /* =============================================
       RENDER — SHOPIFY PRODUCT
       ============================================= */
    function renderShopifyProduct(product) {
        currentProduct = product;

        // Title
        setText('product-title', product.title);
        setText('breadcrumb-product-name', product.title);
        document.title = product.title + ' — Hells Savior';

        // Price (first variant)
        const firstVariant = product.variants && product.variants[0];
        if (firstVariant) {
            const price = parseFloat(firstVariant.price.amount);
            const currency = firstVariant.price.currencyCode === 'USD' ? '$' : firstVariant.price.currencyCode;
            setText('product-price', currency + price.toFixed(2));
        }

        // Description
        const descEl = document.getElementById('product-description');
        if (descEl) {
            descEl.innerHTML = product.descriptionHtml || `<p>${product.description || ''}</p>`;
        }

        // Images
        const images = product.images || [];
        renderGallery(images.map(img => ({ src: img.src, alt: product.title })));

        // Variants
        renderVariants(product);

        // Select first available variant
        selectedVariant = firstVariant || null;

        // Meta
        renderMeta(product);

        // Shopify store link
        const storeLink = document.getElementById('product-shopify-link');
        if (storeLink && product.onlineStoreUrl) {
            storeLink.href = product.onlineStoreUrl;
        }

        // ATC button
        setupATCButton();

        showState('product');
    }

    /* =============================================
       RENDER — PLACEHOLDER PRODUCT
       ============================================= */
    function renderPlaceholderProduct(product) {
        currentProduct = product;

        setText('product-title', product.title);
        setText('breadcrumb-product-name', product.title);
        document.title = product.title + ' — Hells Savior';

        const currency = product.currency === 'USD' ? '$' : (product.currency || '$');
        setText('product-price', currency + parseFloat(product.price).toFixed(2));

        const descEl = document.getElementById('product-description');
        if (descEl) {
            descEl.innerHTML = `<p>${product.description || ''}</p>`;
        }

        // Images — placeholder may have one or multiple
        const images = product.images || [{ src: product.image, alt: product.title }];
        renderGallery(images);

        // No real variants for placeholders — show a simple size selector as demo
        renderPlaceholderVariants();

        // Meta
        const metaEl = document.getElementById('product-meta');
        if (metaEl) {
            metaEl.innerHTML = `
                <div class="product-meta-row">
                    <span class="product-meta-label">Category</span>
                    <span class="product-meta-value">${capitalize(product.category || 'Merch')}</span>
                </div>
            `;
        }

        // ATC button (fallback to external store)
        setupATCButtonFallback(product);

        showState('product');
    }

    /* =============================================
       GALLERY
       ============================================= */
    function renderGallery(images) {
        if (!images || images.length === 0) return;

        const mainImg = document.getElementById('gallery-main-img');
        const thumbsEl = document.getElementById('gallery-thumbs');

        // Set main image
        if (mainImg) {
            mainImg.src = images[0].src;
            mainImg.alt = images[0].alt || '';
        }

        // Build thumbnails
        if (thumbsEl) {
            thumbsEl.innerHTML = '';

            images.forEach((img, i) => {
                const thumb = document.createElement('div');
                thumb.className = 'gallery-thumb' + (i === 0 ? ' active' : '');
                thumb.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}" loading="lazy">`;

                thumb.addEventListener('click', function () {
                    // Update main image
                    if (mainImg) {
                        mainImg.src = img.src;
                        mainImg.alt = img.alt || '';
                    }
                    // Update active thumb
                    thumbsEl.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });

                thumbsEl.appendChild(thumb);
            });
        }

        // Lightbox click on main image
        const galleryMain = document.getElementById('gallery-main');
        if (galleryMain) {
            galleryMain.addEventListener('click', function () {
                openLightbox(mainImg ? mainImg.src : images[0].src);
            });
        }
    }

    /* =============================================
       VARIANTS — SHOPIFY
       ============================================= */
    function renderVariants(product) {
        const variantsEl = document.getElementById('product-variants');
        if (!variantsEl) return;

        const options = product.options || [];
        if (!options.length || (options.length === 1 && options[0].name === 'Title')) {
            variantsEl.innerHTML = '';
            return;
        }

        variantsEl.innerHTML = '';

        options.forEach(option => {
            const group = document.createElement('div');
            group.className = 'variant-group';

            const label = document.createElement('div');
            label.className = 'variant-label';
            label.innerHTML = `${option.name}: <span id="selected-${option.name.toLowerCase()}">${option.values[0]}</span>`;
            group.appendChild(label);

            const optionsRow = document.createElement('div');
            optionsRow.className = 'variant-options';

            option.values.forEach((value, i) => {
                const btn = document.createElement('button');
                btn.className = 'variant-btn' + (i === 0 ? ' active' : '');
                btn.textContent = value;
                btn.dataset.option = option.name;
                btn.dataset.value = value;

                btn.addEventListener('click', function () {
                    // Update active state
                    optionsRow.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Update label
                    const selectedLabel = document.getElementById('selected-' + option.name.toLowerCase());
                    if (selectedLabel) selectedLabel.textContent = value;

                    // Find matching variant
                    updateSelectedVariant(product);
                });

                optionsRow.appendChild(btn);
            });

            group.appendChild(optionsRow);
            variantsEl.appendChild(group);
        });
    }

    function updateSelectedVariant(product) {
        const variantsEl = document.getElementById('product-variants');
        if (!variantsEl || !product.variants) return;

        // Collect current selections
        const selections = {};
        variantsEl.querySelectorAll('.variant-btn.active').forEach(btn => {
            selections[btn.dataset.option] = btn.dataset.value;
        });

        // Find matching variant
        const match = product.variants.find(v => {
            return v.selectedOptions.every(opt => selections[opt.name] === opt.value);
        });

        if (match) {
            selectedVariant = match;
            // Update price
            const price = parseFloat(match.price.amount);
            const currency = match.price.currencyCode === 'USD' ? '$' : match.price.currencyCode;
            setText('product-price', currency + price.toFixed(2));
        }
    }

    /* =============================================
       VARIANTS — PLACEHOLDER (demo sizes)
       ============================================= */
    function renderPlaceholderVariants() {
        const variantsEl = document.getElementById('product-variants');
        if (!variantsEl) return;

        variantsEl.innerHTML = `
            <div class="variant-group">
                <div class="variant-label">Size: <span id="selected-size">M</span></div>
                <div class="variant-options">
                    <button class="variant-btn" data-option="Size" data-value="XS">XS</button>
                    <button class="variant-btn" data-option="Size" data-value="S">S</button>
                    <button class="variant-btn active" data-option="Size" data-value="M">M</button>
                    <button class="variant-btn" data-option="Size" data-value="L">L</button>
                    <button class="variant-btn" data-option="Size" data-value="XL">XL</button>
                    <button class="variant-btn" data-option="Size" data-value="XXL">XXL</button>
                </div>
            </div>
        `;

        variantsEl.querySelectorAll('.variant-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                variantsEl.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const lbl = document.getElementById('selected-size');
                if (lbl) lbl.textContent = btn.dataset.value;
            });
        });
    }

    /* =============================================
       META
       ============================================= */
    function renderMeta(product) {
        const metaEl = document.getElementById('product-meta');
        if (!metaEl) return;

        let html = '';

        if (product.productType) {
            html += `<div class="product-meta-row">
                <span class="product-meta-label">Type</span>
                <span class="product-meta-value">${product.productType}</span>
            </div>`;
        }

        if (product.tags && product.tags.length) {
            const tagHtml = product.tags.slice(0, 6).map(t => `<span class="product-tag">${t}</span>`).join(' ');
            html += `<div class="product-meta-row">
                <span class="product-meta-label">Tags</span>
                <span class="product-meta-value">${tagHtml}</span>
            </div>`;
        }

        metaEl.innerHTML = html;
    }

    /* =============================================
       ADD TO CART — SHOPIFY
       ============================================= */
    function setupATCButton() {
        const btn = document.getElementById('product-atc-btn');
        if (!btn) return;

        btn.addEventListener('click', function () {
            if (!selectedVariant) {
                showNotification('Please select a variant', 'error');
                return;
            }

            btn.classList.add('loading');
            const btnText = document.getElementById('atc-btn-text');
            if (btnText) btnText.textContent = 'Adding...';

            // Use Shopify integration if available
            if (window.shopifyIntegration && window.shopifyIntegration.isReady()) {
                window.shopifyIntegration.addToCart(selectedVariant, quantity)
                    .then(() => {
                        onATCSuccess(btn, btnText);
                    })
                    .catch(() => {
                        onATCError(btn, btnText);
                    });
            } else if (window.cart) {
                // Use local cart
                window.cart.addItem({
                    id: selectedVariant.id,
                    title: currentProduct.title,
                    price: parseFloat(selectedVariant.price.amount) * 100,
                    image: currentProduct.images && currentProduct.images[0] ? currentProduct.images[0].src : '',
                    variant_id: selectedVariant.id
                });
                onATCSuccess(btn, btnText);
            } else {
                onATCError(btn, btnText);
            }
        });
    }

    /* =============================================
       ADD TO CART — FALLBACK (placeholder)
       ============================================= */
    function setupATCButtonFallback(product) {
        const btn = document.getElementById('product-atc-btn');
        if (!btn) return;

        btn.addEventListener('click', function () {
            btn.classList.add('loading');
            const btnText = document.getElementById('atc-btn-text');
            if (btnText) btnText.textContent = 'Adding...';

            // Add to local cart
            if (window.cart) {
                window.cart.addItem({
                    id: product.id,
                    title: product.title,
                    price: parseFloat(product.price) * 100,
                    image: product.image || (product.images && product.images[0] ? product.images[0].src : ''),
                    variant_id: product.id
                });
                onATCSuccess(btn, btnText);
            } else {
                // Last resort: open external store
                window.open('https://hellssavior.myshopify.com', '_blank');
                onATCSuccess(btn, btnText);
            }
        });

        // Update shopify link
        const storeLink = document.getElementById('product-shopify-link');
        if (storeLink) {
            storeLink.href = 'https://hellssavior.myshopify.com';
        }
    }

    function onATCSuccess(btn, btnText) {
        btn.classList.remove('loading');
        btn.classList.add('success');
        if (btnText) btnText.textContent = 'Added to Cart!';
        showNotification('Added to cart!', 'success');

        setTimeout(() => {
            btn.classList.remove('success');
            if (btnText) btnText.textContent = 'Add to Cart';
        }, 2500);
    }

    function onATCError(btn, btnText) {
        btn.classList.remove('loading');
        if (btnText) btnText.textContent = 'Add to Cart';
        showNotification('Could not add to cart. Try again.', 'error');
    }

    /* =============================================
       QUANTITY CONTROLS
       ============================================= */
    function setupQuantityControls() {
        const minusBtn = document.getElementById('qty-minus');
        const plusBtn = document.getElementById('qty-plus');
        const qtyDisplay = document.getElementById('qty-value');

        if (minusBtn) {
            minusBtn.addEventListener('click', function () {
                if (quantity > 1) {
                    quantity--;
                    if (qtyDisplay) qtyDisplay.textContent = quantity;
                }
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener('click', function () {
                quantity++;
                if (qtyDisplay) qtyDisplay.textContent = quantity;
            });
        }
    }

    /* =============================================
       RELATED PRODUCTS
       ============================================= */
    function renderRelatedProducts(products, currentProd) {
        const section = document.getElementById('related-section');
        const grid = document.getElementById('related-grid');
        if (!section || !grid) return;

        // Pick up to 4 other products
        const related = products
            .filter(p => p.id !== currentProd.id)
            .slice(0, 4);

        if (related.length === 0) return;

        grid.innerHTML = '';

        related.forEach((product, index) => {
            const card = createRelatedCard(product, index);
            grid.appendChild(card);
        });

        section.style.display = 'block';
    }

    function createRelatedCard(product, index) {
        const isShopify = !!product.variants;

        const image = isShopify
            ? (product.images && product.images[0] ? product.images[0].src : generatePlaceholderImage(product.title))
            : (product.image || generatePlaceholderImage(product.title));

        const price = isShopify
            ? parseFloat(product.variants[0].price.amount)
            : parseFloat(product.price);

        const currency = isShopify
            ? (product.variants[0].price.currencyCode === 'USD' ? '$' : product.variants[0].price.currencyCode)
            : '$';

        const card = document.createElement('div');
        card.className = 'product-card stagger-item';
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.cursor = 'pointer';

        card.innerHTML = `
            <div class="product-image">
                <img src="${image}" alt="${product.title}" loading="lazy">
                <div class="product-overlay">
                    <button class="btn btn-primary" style="font-size:0.85rem; padding:0.6rem 1.2rem;">
                        <i class="fas fa-eye"></i> View Product
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
                <p class="product-price">${currency}${price.toFixed(2)}</p>
            </div>
        `;

        // Navigate to product page on click
        card.addEventListener('click', function () {
            const params = new URLSearchParams();
            if (isShopify) {
                params.set('id', product.id);
            } else {
                params.set('id', product.id);
            }
            window.location.href = 'product.html?' + params.toString();
        });

        return card;
    }

    /* =============================================
       LIGHTBOX
       ============================================= */
    function setupLightbox() {
        // Create lightbox element
        const lb = document.createElement('div');
        lb.className = 'product-lightbox';
        lb.id = 'product-lightbox';
        lb.innerHTML = `
            <img src="" alt="" class="lightbox-img" id="lightbox-img">
            <button class="lightbox-close" id="lightbox-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        `;
        document.body.appendChild(lb);

        // Close on background click
        lb.addEventListener('click', function (e) {
            if (e.target === lb || e.target.id === 'lightbox-close' || e.target.closest('#lightbox-close')) {
                closeLightbox();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    function openLightbox(src) {
        const lb = document.getElementById('product-lightbox');
        const img = document.getElementById('lightbox-img');
        if (!lb || !img) return;
        img.src = src;
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lb = document.getElementById('product-lightbox');
        if (!lb) return;
        lb.classList.remove('active');
        document.body.style.overflow = '';
    }

    /* =============================================
       NOTIFICATIONS
       ============================================= */
    function showNotification(message, type) {
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        const notif = document.createElement('div');
        notif.className = `product-notification ${type || 'info'}`;
        notif.innerHTML = `<i class="fas ${iconMap[type] || iconMap.info}"></i> ${message}`;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'notifSlideOut 0.3s ease forwards';
            setTimeout(() => notif.remove(), 320);
        }, 3000);
    }

    /* =============================================
       UI STATE
       ============================================= */
    function showState(state) {
        const loading = document.getElementById('product-loading');
        const layout = document.getElementById('product-detail-layout');
        const error = document.getElementById('product-error');

        if (loading) loading.style.display = state === 'loading' ? 'block' : 'none';
        if (layout) layout.style.display = state === 'product' ? 'grid' : 'none';
        if (error) error.style.display = state === 'error' ? 'block' : 'none';
    }

    /* =============================================
       PLACEHOLDER DATA
       ============================================= */
    function getPlaceholderProducts() {
        return [
            {
                id: 'hs-tshirt-777',
                handle: '777-hells-savior-tshirt',
                title: '777 Hells Savior T-Shirt',
                description: 'Official Hells Savior merchandise featuring the iconic 777 logo with skull and crossbones design. Premium quality cotton blend. Printed with high-quality, long-lasting ink.',
                price: '25.00',
                currency: 'USD',
                image: generatePlaceholderImage('T-SHIRT'),
                images: [
                    { src: generatePlaceholderImage('T-SHIRT'), alt: '777 Hells Savior T-Shirt' },
                    { src: generatePlaceholderImage('T-SHIRT BACK'), alt: '777 Hells Savior T-Shirt Back' },
                    { src: generatePlaceholderImage('T-SHIRT DETAIL'), alt: '777 Hells Savior T-Shirt Detail' }
                ],
                category: 'clothing'
            },
            {
                id: 'hs-hoodie-hellfire',
                handle: 'hellfire-hoodie',
                title: 'Hellfire Hoodie',
                description: 'Premium quality hoodie with cobalt blue flame design and Hells Savior branding. Perfect for cold nights. Heavyweight fleece, kangaroo pocket, adjustable drawstring.',
                price: '45.00',
                currency: 'USD',
                image: generatePlaceholderImage('HOODIE'),
                images: [
                    { src: generatePlaceholderImage('HOODIE'), alt: 'Hellfire Hoodie' },
                    { src: generatePlaceholderImage('HOODIE BACK'), alt: 'Hellfire Hoodie Back' }
                ],
                category: 'clothing'
            },
            {
                id: 'hs-cap-skull',
                handle: 'skull-crown-snapback',
                title: 'Skull Crown Snapback',
                description: 'Adjustable snapback cap with embroidered skull crown and 777 numbering. One size fits all. Structured 6-panel design.',
                price: '20.00',
                currency: 'USD',
                image: generatePlaceholderImage('CAP'),
                images: [
                    { src: generatePlaceholderImage('CAP'), alt: 'Skull Crown Snapback' },
                    { src: generatePlaceholderImage('CAP SIDE'), alt: 'Skull Crown Snapback Side' }
                ],
                category: 'accessories'
            },
            {
                id: 'hs-necklace-souls',
                handle: 'chain-of-souls-necklace',
                title: 'Chain of Souls Necklace',
                description: 'Sterling silver chain necklace with skull pendant, inspired by the 777 aesthetic. Comes with gift box. 18" chain length.',
                price: '35.00',
                currency: 'USD',
                image: generatePlaceholderImage('JEWELRY'),
                images: [
                    { src: generatePlaceholderImage('JEWELRY'), alt: 'Chain of Souls Necklace' }
                ],
                category: 'accessories'
            },
            {
                id: 'hs-vinyl-flame',
                handle: 'flame-vinyl-record',
                title: 'Flame Vinyl Record',
                description: 'Limited edition vinyl featuring the latest Hells Savior tracks with flame-colored pressing. Collector\'s item. 12" LP, 180g vinyl.',
                price: '30.00',
                currency: 'USD',
                image: generatePlaceholderImage('VINYL'),
                images: [
                    { src: generatePlaceholderImage('VINYL'), alt: 'Flame Vinyl Record' }
                ],
                category: 'music'
            },
            {
                id: 'hs-poster-set',
                handle: 'inferno-poster-set',
                title: 'Inferno Poster Set',
                description: 'High-quality poster set featuring exclusive Hells Savior artwork and lyrics. Set of 3 posters, 18"x24" each. Printed on premium matte paper.',
                price: '15.00',
                currency: 'USD',
                image: generatePlaceholderImage('POSTER'),
                images: [
                    { src: generatePlaceholderImage('POSTER'), alt: 'Inferno Poster Set' }
                ],
                category: 'collectibles'
            }
        ];
    }

    function generatePlaceholderImage(type) {
        const svg = `<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#000000"/>
                    <stop offset="50%" style="stop-color:#0a0a1a"/>
                    <stop offset="100%" style="stop-color:#000000"/>
                </linearGradient>
            </defs>
            <rect width="600" height="600" fill="url(#bg)"/>
            <text x="300" y="260" font-family="Arial,sans-serif" font-size="36" fill="#ffffff" text-anchor="middle" font-weight="bold">${type}</text>
            <text x="300" y="310" font-family="Arial,sans-serif" font-size="22" fill="#ff2222" text-anchor="middle">HELLS SAVIOR</text>
            <text x="300" y="360" font-family="Arial,sans-serif" font-size="30" fill="#0066ff" text-anchor="middle" font-weight="bold">777</text>
        </svg>`;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    /* =============================================
       UTILITIES
       ============================================= */
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
    }

})();
