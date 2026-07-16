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
    let allProducts = [];

    /* =============================================
       INIT
       ============================================= */
    document.addEventListener('DOMContentLoaded', function () {
        setupQuantityControls();
        setupLightbox();
        loadProduct();
    });

    /* =============================================
       URL PARAMS
       ============================================= */
    function getUrlParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }

    /* =============================================
       LOAD PRODUCT
       ============================================= */
    async function loadProduct() {
        const productId     = getUrlParam('id');
        const productHandle = getUrlParam('handle');
        const productIndex  = getUrlParam('index');

        showState('loading');

        try {
            // Wait up to 6 seconds for Shopify to initialize
            const shopifyProducts = await waitForShopifyProducts(6000);

            if (shopifyProducts && shopifyProducts.length > 0) {
                allProducts = shopifyProducts;

                let product = null;
                if (productId)           product = shopifyProducts.find(p => String(p.id) === String(productId));
                else if (productHandle)  product = shopifyProducts.find(p => p.handle === productHandle);
                else if (productIndex !== null) product = shopifyProducts[parseInt(productIndex, 10)] || null;

                // If no match by id/handle, just show the first product
                if (!product) product = shopifyProducts[0] || null;

                if (product) {
                    renderShopifyProduct(product);
                    renderRelatedProducts(shopifyProducts, product);
                    return;
                }
            }

            // Fallback: placeholder data
            const placeholders = getPlaceholderProducts();
            allProducts = placeholders;

            let product = null;
            if (productId)           product = placeholders.find(p => p.id === productId);
            else if (productHandle)  product = placeholders.find(p => p.handle === productHandle);
            else if (productIndex !== null) product = placeholders[parseInt(productIndex, 10)] || null;

            if (!product) product = placeholders[0] || null;

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

    function waitForShopifyProducts(timeoutMs) {
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

    /* =============================================
       RENDER — SHOPIFY PRODUCT
       ============================================= */
    function renderShopifyProduct(product) {
        currentProduct = product;

        setText('product-title', product.title);
        setText('breadcrumb-product-name', product.title);
        document.title = product.title + ' — Hells Savior';

        // Find first available variant, or fall back to first variant
        const firstAvailable = product.variants && product.variants.find(v => v.availableForSale);
        const firstVariant = firstAvailable || (product.variants && product.variants[0]);

        if (firstVariant) {
            const price    = parseFloat(firstVariant.price.amount);
            const currency = firstVariant.price.currencyCode === 'USD' ? '$' : firstVariant.price.currencyCode;
            setText('product-price', currency + price.toFixed(2));
            selectedVariant = firstVariant;
        }

        const descEl = document.getElementById('product-description');
        if (descEl) {
            const rawHtml = product.descriptionHtml || `<p>${product.description || ''}</p>`;
            descEl.innerHTML = buildDescriptionAccordions(rawHtml);
            initAccordions(descEl);
        }

        // product.images is [{src, altText}] from our normalized shopify.js shape
        let images = [];
        if (product.images && product.images.length > 0) {
            images = product.images.map(img => ({ src: img.src || img.url, alt: img.altText || product.title }));
        } else if (product.image) {
            images = [{ src: product.image, alt: product.title }];
        }
        renderMosaicGallery(images);

        renderVariants(product, firstVariant);
        renderMeta(product);

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
        if (descEl) descEl.innerHTML = `<p>${product.description || ''}</p>`;

        const images = product.images || [{ src: product.image, alt: product.title }];
        renderMosaicGallery(images);

        renderPlaceholderVariants();

        const metaEl = document.getElementById('product-meta');
        if (metaEl) {
            metaEl.innerHTML = `
                <div class="pd-meta-row">
                    <span class="pd-meta-label">Category</span>
                    <span class="pd-meta-value">${capitalize(product.category || 'Merch')}</span>
                </div>`;
        }

        setupATCButtonFallback(product);
        showState('product');
    }

    /* =============================================
       IMAGE GALLERY
       On mobile: swipe carousel with dots + thumbnails
       On desktop: Adidas-style mosaic grid
       ============================================= */
    function renderMosaicGallery(images) {
        const loadingEl = document.getElementById('pd-gallery-loading');
        if (loadingEl) loadingEl.style.display = 'none';

        const isMobile = window.innerWidth <= 900;

        if (isMobile) {
            renderMobileCarousel(images);
        } else {
            renderDesktopMosaic(images);
        }
    }

    function renderMobileCarousel(images) {
        const carouselEl = document.getElementById('pd-carousel');
        const trackEl    = document.getElementById('pd-carousel-track');
        const dotsEl     = document.getElementById('pd-carousel-dots');
        const thumbsEl   = document.getElementById('pd-carousel-thumbs');
        const gridEl     = document.getElementById('pd-img-grid');

        if (!carouselEl || !trackEl) return;

        // Hide desktop grid
        if (gridEl) gridEl.style.display = 'none';

        trackEl.innerHTML = '';
        dotsEl.innerHTML  = '';
        thumbsEl.innerHTML = '';

        let currentIndex = 0;

        images.forEach((img, i) => {
            // Slide
            const slide = document.createElement('div');
            slide.className = 'pd-carousel-slide';
            const imgEl = document.createElement('img');
            imgEl.src     = img.src;
            imgEl.alt     = img.alt || '';
            imgEl.loading = i === 0 ? 'eager' : 'lazy';
            slide.appendChild(imgEl);
            trackEl.appendChild(slide);

            // Dot
            const dot = document.createElement('button');
            dot.className = 'pd-carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Image ${i + 1}`);
            dot.addEventListener('click', function () { goToSlide(i); });
            dotsEl.appendChild(dot);

            // Thumbnail
            const thumb = document.createElement('div');
            thumb.className = 'pd-carousel-thumb' + (i === 0 ? ' active' : '');
            const thumbImg = document.createElement('img');
            thumbImg.src     = img.src;
            thumbImg.alt     = img.alt || '';
            thumbImg.loading = 'lazy';
            thumb.appendChild(thumbImg);
            thumb.addEventListener('click', function () { goToSlide(i); });
            thumbsEl.appendChild(thumb);
        });

        function goToSlide(index) {
            currentIndex = index;
            const slideWidth = trackEl.offsetWidth;
            trackEl.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
            updateActiveState(index);
        }

        function updateActiveState(index) {
            dotsEl.querySelectorAll('.pd-carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === index);
            });
            thumbsEl.querySelectorAll('.pd-carousel-thumb').forEach((t, i) => {
                t.classList.toggle('active', i === index);
            });
        }

        // Update dots/thumbs on scroll
        let scrollTimer;
        trackEl.addEventListener('scroll', function () {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function () {
                const slideWidth = trackEl.offsetWidth;
                if (slideWidth > 0) {
                    const idx = Math.round(trackEl.scrollLeft / slideWidth);
                    if (idx !== currentIndex) {
                        currentIndex = idx;
                        updateActiveState(idx);
                    }
                }
            }, 50);
        });

        carouselEl.style.display = 'flex';
    }

    function renderDesktopMosaic(images) {
        const gridEl    = document.getElementById('pd-img-grid');
        const carouselEl = document.getElementById('pd-carousel');
        if (!gridEl) return;

        // Hide mobile carousel
        if (carouselEl) carouselEl.style.display = 'none';

        // Show all images (up to 10)
        const shown = images.slice(0, 10);

        // New layout: large primary image + thumbnail row below
        gridEl.className = 'pd-img-grid gallery-primary-layout';
        gridEl.innerHTML = '';

        let currentMainIndex = 0;

        // Primary (large) image container
        const mainCell = document.createElement('div');
        mainCell.className = 'pd-img-main';
        const mainImg = document.createElement('img');
        mainImg.src = shown[0].src;
        mainImg.alt = shown[0].alt || '';
        mainImg.loading = 'eager';
        mainImg.id = 'pd-main-img';
        mainCell.appendChild(mainImg);
        mainCell.addEventListener('click', function () {
            openLightbox(mainImg.src);
        });
        gridEl.appendChild(mainCell);

        // Thumbnail row (only if more than 1 image)
        if (shown.length > 1) {
            const thumbRow = document.createElement('div');
            thumbRow.className = 'pd-thumb-row';

            shown.forEach((img, i) => {
                const thumb = document.createElement('div');
                thumb.className = 'pd-thumb' + (i === 0 ? ' active' : '');
                const thumbImg = document.createElement('img');
                thumbImg.src = img.src;
                thumbImg.alt = img.alt || '';
                thumbImg.loading = i < 3 ? 'eager' : 'lazy';
                thumb.appendChild(thumbImg);

                thumb.addEventListener('click', function () {
                    // Update main image
                    mainImg.src = img.src;
                    currentMainIndex = i;
                    // Update active thumb
                    thumbRow.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });

                thumbRow.appendChild(thumb);
            });

            gridEl.appendChild(thumbRow);
        }

        gridEl.style.display = 'flex';
    }

    /* =============================================
       VARIANTS — SHOPIFY
       ============================================= */
    function renderVariants(product, defaultVariant) {
        const variantsEl = document.getElementById('product-variants');
        if (!variantsEl) return;

        const options = product.options || [];
        // If only one option and it's "Title" (default Shopify), hide variants
        if (!options.length || (options.length === 1 && options[0].name === 'Title')) {
            variantsEl.innerHTML = '';
            return;
        }

        variantsEl.innerHTML = '';

        options.forEach(option => {
            const group = document.createElement('div');
            group.className = 'variant-group';

            // Determine the default selected value for this option
            let defaultValue = option.values[0];
            if (defaultVariant && defaultVariant.selectedOptions) {
                const match = defaultVariant.selectedOptions.find(o => o.name === option.name);
                if (match) defaultValue = match.value;
            }

            const label = document.createElement('div');
            label.className = 'variant-label';
            label.innerHTML = `${option.name}: <span id="selected-${option.name.toLowerCase()}">${defaultValue}</span>`;
            group.appendChild(label);

            const optionsRow = document.createElement('div');
            optionsRow.className = 'variant-options';

            // Sort size values in proper order if this is a Size option
            let sortedValues = option.values;
            if (option.name.toLowerCase() === 'size') {
                const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '4XL', '5XL'];
                sortedValues = [...option.values].sort((a, b) => {
                    const aIdx = sizeOrder.indexOf(a.toUpperCase());
                    const bIdx = sizeOrder.indexOf(b.toUpperCase());
                    // If both found in order list, sort by that order
                    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                    // If only one found, it comes first
                    if (aIdx !== -1) return -1;
                    if (bIdx !== -1) return 1;
                    // Otherwise keep original order
                    return 0;
                });
            }

            sortedValues.forEach((value) => {
                const btn = document.createElement('button');
                const isActive = value === defaultValue;

                // Check if this variant is available for sale
                const variantForValue = product.variants && product.variants.find(v =>
                    v.selectedOptions && v.selectedOptions.some(o => o.name === option.name && o.value === value)
                );
                const isAvailable = variantForValue ? variantForValue.availableForSale : true;

                btn.className = 'variant-btn' + (isActive ? ' active' : '') + (!isAvailable ? ' unavailable' : '');
                btn.textContent = value;
                btn.dataset.option = option.name;
                btn.dataset.value  = value;
                if (!isAvailable) {
                    btn.title = 'Out of stock';
                }

                btn.addEventListener('click', function () {
                    optionsRow.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const lbl = document.getElementById('selected-' + option.name.toLowerCase());
                    if (lbl) lbl.textContent = value;
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

        const selections = {};
        variantsEl.querySelectorAll('.variant-btn.active').forEach(btn => {
            selections[btn.dataset.option] = btn.dataset.value;
        });

        const match = product.variants.find(v =>
            v.selectedOptions && v.selectedOptions.every(opt => selections[opt.name] === opt.value)
        );

        if (match) {
            selectedVariant = match;
            const price    = parseFloat(match.price.amount);
            const currency = match.price.currencyCode === 'USD' ? '$' : match.price.currencyCode;
            setText('product-price', currency + price.toFixed(2));

            // Update ATC button state based on availability
            const atcBtn = document.getElementById('product-atc-btn');
            const atcText = document.getElementById('atc-btn-text');
            if (atcBtn && atcText) {
                if (!match.availableForSale) {
                    atcBtn.disabled = true;
                    atcText.textContent = 'Out of Stock';
                } else {
                    atcBtn.disabled = false;
                    atcText.textContent = 'Add to Cart';
                }
            }
        }
    }

    /* =============================================
       VARIANTS — PLACEHOLDER
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
            </div>`;

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
            html += `<div class="pd-meta-row">
                <span class="pd-meta-label">Type</span>
                <span class="pd-meta-value">${product.productType}</span>
            </div>`;
        }

        if (product.tags && product.tags.length) {
            const tagHtml = product.tags.slice(0, 6).map(t => `<span class="pd-tag">${t}</span>`).join(' ');
            html += `<div class="pd-meta-row">
                <span class="pd-meta-label">Tags</span>
                <span class="pd-meta-value">${tagHtml}</span>
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

        // Check initial availability
        if (selectedVariant && !selectedVariant.availableForSale) {
            btn.disabled = true;
            const atcText = document.getElementById('atc-btn-text');
            if (atcText) atcText.textContent = 'Out of Stock';
        }

        btn.addEventListener('click', function () {
            if (btn.disabled) return;

            if (!selectedVariant) {
                showNotification('Please select a size', 'error');
                return;
            }

            setButtonLoading(btn, true);

            // Add to local cart display
            const cartItem = {
                id: selectedVariant.id,
                title: currentProduct.title,
                variantTitle: selectedVariant.title !== 'Default Title' ? selectedVariant.title : '',
                price: Math.round(parseFloat(selectedVariant.price.amount) * 100),
                image: currentProduct.images && currentProduct.images[0] ? currentProduct.images[0].src : (currentProduct.image || ''),
                variant_id: selectedVariant.id,
                quantity: quantity
            };

            if (window.cart) {
                // Add quantity times
                for (let i = 0; i < quantity; i++) {
                    window.cart.addItem(cartItem);
                }
                onATCSuccess(btn);
            } else {
                // Fallback: open Shopify checkout directly
                openShopifyCheckout(selectedVariant.id, quantity)
                    .then(() => onATCSuccess(btn))
                    .catch(() => onATCError(btn));
            }
        });
    }

    async function openShopifyCheckout(variantId, qty) {
        if (window.shopifyIntegration) {
            await window.shopifyIntegration.openCheckout([{ variantId: variantId, quantity: qty }]);
        }
    }

    /* =============================================
       ADD TO CART — FALLBACK
       ============================================= */
    function setupATCButtonFallback(product) {
        const btn = document.getElementById('product-atc-btn');
        if (!btn) return;

        btn.addEventListener('click', function () {
            if (btn.disabled) return;

            setButtonLoading(btn, true);

            if (window.cart) {
                window.cart.addItem({
                    id: product.id,
                    title: product.title,
                    variantTitle: '',
                    price: Math.round(parseFloat(product.price) * 100),
                    image: product.image || (product.images && product.images[0] ? product.images[0].src : ''),
                    variant_id: product.id,
                    quantity: quantity
                });
                onATCSuccess(btn);
            } else {
                window.open('https://hells-savior.myshopify.com', '_blank');
                onATCSuccess(btn);
            }
        });
    }

    function setButtonLoading(btn, isLoading) {
        const btnText = document.getElementById('atc-btn-text');
        const icon = btn.querySelector('i');

        if (isLoading) {
            btn.disabled = true;
            btn.style.opacity = '0.75';
            btn.style.pointerEvents = 'none';
            if (btnText) btnText.textContent = 'Adding...';
            if (icon) {
                icon.className = 'fas fa-spinner';
                icon.style.animation = 'spin 0.8s linear infinite';
            }
        } else {
            btn.style.opacity = '';
            btn.style.pointerEvents = '';
            if (icon) {
                icon.style.animation = '';
            }
        }
    }

    function onATCSuccess(btn) {
        const btnText = document.getElementById('atc-btn-text');
        const icon = btn.querySelector('i');

        // Reset loading state
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.pointerEvents = '';
        if (icon) {
            icon.style.animation = '';
            icon.className = 'fas fa-check';
        }
        if (btnText) btnText.textContent = 'Added to Cart!';

        btn.style.background = 'linear-gradient(45deg, #00aa44, #00cc55)';
        btn.style.borderColor = '#00aa44';
        btn.style.boxShadow = '0 8px 25px rgba(0, 170, 68, 0.4)';

        showNotification('Added to cart!', 'success');

        // Open cart sidebar
        if (window.cart) {
            setTimeout(() => window.cart.openCart(), 300);
        }

        setTimeout(() => {
            if (icon) icon.className = 'fas fa-shopping-cart';
            if (btnText) btnText.textContent = 'Add to Cart';
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.boxShadow = '';
            // Re-check availability
            if (selectedVariant && !selectedVariant.availableForSale) {
                btn.disabled = true;
                if (btnText) btnText.textContent = 'Out of Stock';
            }
        }, 2500);
    }

    function onATCError(btn) {
        const btnText = document.getElementById('atc-btn-text');
        const icon = btn.querySelector('i');

        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.pointerEvents = '';
        if (icon) {
            icon.style.animation = '';
            icon.className = 'fas fa-shopping-cart';
        }
        if (btnText) btnText.textContent = 'Add to Cart';
        showNotification('Could not add to cart. Try again.', 'error');
    }

    /* =============================================
       QUANTITY CONTROLS
       ============================================= */
    function setupQuantityControls() {
        const minusBtn  = document.getElementById('qty-minus');
        const plusBtn   = document.getElementById('qty-plus');
        const qtyDisplay = document.getElementById('qty-value');

        if (minusBtn) {
            minusBtn.addEventListener('click', function () {
                if (quantity > 1) { quantity--; if (qtyDisplay) qtyDisplay.textContent = quantity; }
            });
        }
        if (plusBtn) {
            plusBtn.addEventListener('click', function () {
                quantity++; if (qtyDisplay) qtyDisplay.textContent = quantity;
            });
        }
    }

    /* =============================================
       RELATED PRODUCTS — random selection
       ============================================= */
    function renderRelatedProducts(products, currentProd) {
        const section = document.getElementById('related-section');
        const grid    = document.getElementById('related-grid');
        if (!section || !grid) return;

        // Shuffle all products except current, pick up to 4
        const pool = products.filter(p => p.id !== currentProd.id);
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const related = pool.slice(0, 4);
        if (related.length === 0) return;

        grid.innerHTML = '';
        related.forEach((product, index) => grid.appendChild(createRelatedCard(product, index)));
        section.style.display = 'block';
    }

    function createRelatedCard(product, index) {
        const isShopify = !!product.variants;

        const image = isShopify
            ? (product.images && product.images[0] ? product.images[0].src : generatePlaceholderImage(product.title))
            : (product.image || generatePlaceholderImage(product.title));

        const price    = isShopify ? parseFloat(product.variants[0].price.amount) : parseFloat(product.price);
        const currency = isShopify ? (product.variants[0].price.currencyCode === 'USD' ? '$' : product.variants[0].price.currencyCode) : '$';

        const card = document.createElement('div');
        card.className = 'merch-preview-card';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="merch-preview-image">
                <img src="${image}" alt="${product.title}" loading="lazy">
                <div class="merch-preview-overlay">
                    <button class="btn btn-primary" style="font-size:0.85rem;padding:0.5rem 1rem;">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
            <div class="merch-preview-info">
                <div class="merch-preview-title">${product.title}</div>
                <div class="merch-preview-price">${currency}${price.toFixed(2)}</div>
            </div>`;

        card.addEventListener('click', function () {
            window.location.href = 'product.html?id=' + encodeURIComponent(product.id);
        });

        return card;
    }

    /* =============================================
       LIGHTBOX
       ============================================= */
    function setupLightbox() {
        const lb = document.getElementById('pd-lightbox');
        if (!lb) return;

        lb.addEventListener('click', function (e) {
            if (e.target === lb || e.target.id === 'pd-lightbox-close' || e.target.closest('#pd-lightbox-close')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    function openLightbox(src) {
        const lb  = document.getElementById('pd-lightbox');
        const img = document.getElementById('pd-lightbox-img');
        if (!lb || !img) return;
        img.src = src;
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lb = document.getElementById('pd-lightbox');
        if (!lb) return;
        lb.classList.remove('active');
        document.body.style.overflow = '';
    }

    /* =============================================
       NOTIFICATIONS
       ============================================= */
    function showNotification(message, type) {
        const iconMap = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
        const notif = document.createElement('div');
        notif.className = `pd-notification ${type || 'info'}`;
        notif.innerHTML = `<i class="fas ${iconMap[type] || iconMap.info}"></i> ${message}`;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'pdNotifOut 0.3s ease forwards';
            setTimeout(() => notif.remove(), 320);
        }, 3000);
    }

    /* =============================================
       UI STATE
       ============================================= */
    function showState(state) {
        // Gallery side
        const galleryLoading = document.getElementById('pd-gallery-loading');

        if (galleryLoading) galleryLoading.style.display = state === 'loading' ? 'flex' : 'none';

        // Info side
        const infoLoading = document.getElementById('pd-info-loading');
        const infoContent = document.getElementById('pd-info-content');
        const infoError   = document.getElementById('product-error');

        if (infoLoading) infoLoading.style.display = state === 'loading' ? 'flex' : 'none';
        if (infoContent) infoContent.style.display  = state === 'product' ? 'flex' : 'none';
        if (infoError)   infoError.style.display    = state === 'error'   ? 'flex' : 'none';
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
                    { src: generatePlaceholderImage('T-SHIRT'),        alt: '777 Hells Savior T-Shirt' },
                    { src: generatePlaceholderImage('T-SHIRT BACK'),   alt: '777 Hells Savior T-Shirt Back' },
                    { src: generatePlaceholderImage('T-SHIRT DETAIL'), alt: '777 Hells Savior T-Shirt Detail' },
                    { src: generatePlaceholderImage('T-SHIRT FLAT'),   alt: '777 Hells Savior T-Shirt Flat' }
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
                    { src: generatePlaceholderImage('HOODIE'),      alt: 'Hellfire Hoodie' },
                    { src: generatePlaceholderImage('HOODIE BACK'), alt: 'Hellfire Hoodie Back' },
                    { src: generatePlaceholderImage('HOODIE SIDE'), alt: 'Hellfire Hoodie Side' }
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
                    { src: generatePlaceholderImage('CAP'),      alt: 'Skull Crown Snapback' },
                    { src: generatePlaceholderImage('CAP SIDE'), alt: 'Skull Crown Snapback Side' }
                ],
                category: 'accessories'
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
       DESCRIPTION ACCORDIONS
       Parses the raw Shopify description HTML and splits it
       into clean dropdown sections by category.
       ============================================= */
    function buildDescriptionAccordions(rawHtml) {
        // Parse the HTML into a temporary container
        const temp = document.createElement('div');
        temp.innerHTML = rawHtml;

        // Define category patterns — order matters (first match wins)
        const categories = [
            { key: 'details',      label: 'Product Details',    icon: 'fa-tag',           patterns: ['item number', 'gender', 'fabric', 'fabric:', 'material', 'weight', 'thickness', 'stretch'] },
            { key: 'care',         label: 'Care Instructions',  icon: 'fa-hand-sparkles', patterns: ['care instruction', 'machine wash', 'do not bleach', 'tumble dry', 'iron', 'dry clean'] },
            { key: 'features',     label: 'Features',           icon: 'fa-list-check',    patterns: ['feature', 'casual', 'street', 'daily', 'pure cotton', 'drop shoulder', 'round neck', 'o-neck'] },
            { key: 'sizing',       label: 'Size Chart',         icon: 'fa-ruler',         patterns: ['print size', 'size:', 'length', 'shoulder', 'chest', 'sleeve'] },
            { key: 'notes',        label: 'Notes',              icon: 'fa-circle-info',   patterns: ['note', 'batch variation', 'we appreciate'] },
        ];

        // Get the text content to analyze
        const fullText = temp.textContent || temp.innerText || '';

        // If description is very short or has no recognizable sections, return as-is
        if (fullText.length < 100) {
            return rawHtml;
        }

        // Try to split content by recognized label patterns in the text
        // The Shopify descriptions appear to have labels like "Fabric:", "Care Instructions:", etc.
        const sections = {};
        let uncategorized = [];

        // Check if there's a table (size chart) — extract it separately
        const tables = temp.querySelectorAll('table');
        let sizeChartHtml = '';
        tables.forEach(table => {
            sizeChartHtml += table.outerHTML;
            table.remove();
        });

        // Now parse the remaining text content
        // Split by common delimiters that Shopify uses
        const remainingHtml = temp.innerHTML;
        const textContent = temp.textContent || '';

        // Try to extract labeled sections from the text
        // Pattern: "LabelName: content" or "LabelName content"
        const labelPatterns = [
            { regex: /Item\s*Number:\s*([^\n]*)/i, category: 'details', label: 'Item Number' },
            { regex: /Gender:\s*([^\n]*)/i, category: 'details', label: 'Gender' },
            { regex: /Fabric:\s*([^\n]*)/i, category: 'details', label: 'Fabric' },
            { regex: /Fabric\s*Weight:\s*([^\n]*)/i, category: 'details', label: 'Fabric Weight' },
            { regex: /Fabric\s*Thickness:\s*([^\n]*)/i, category: 'details', label: 'Fabric Thickness' },
            { regex: /Fabric\s*Stretch:\s*([^\n]*)/i, category: 'details', label: 'Fabric Stretch' },
            { regex: /Care\s*Instructions?:\s*([\s\S]*?)(?=Features?:|Print\s*Size:|Notes?:|$)/i, category: 'care', label: 'Care Instructions' },
            { regex: /Features?:\s*([\s\S]*?)(?=Care|Print\s*Size:|Notes?:|$)/i, category: 'features', label: 'Features' },
            { regex: /Print\s*Size:\s*([^\n]*)/i, category: 'sizing', label: 'Print Size' },
            { regex: /Notes?:\s*([\s\S]*?)$/i, category: 'notes', label: 'Notes' },
        ];

        // Extract structured data from text
        const extractedSections = {};
        let processedText = textContent;

        labelPatterns.forEach(({ regex, category, label }) => {
            const match = textContent.match(regex);
            if (match && match[1] && match[1].trim()) {
                if (!extractedSections[category]) extractedSections[category] = [];
                extractedSections[category].push({ label, value: match[1].trim() });
            }
        });

        // Build accordion HTML
        let accordionHtml = '';
        let hasAccordions = false;

        // Product Details accordion
        if (extractedSections['details'] && extractedSections['details'].length > 0) {
            hasAccordions = true;
            let detailsContent = '<div class="pd-accordion-details">';
            extractedSections['details'].forEach(item => {
                detailsContent += `<div class="pd-detail-row"><span class="pd-detail-label">${item.label}</span><span class="pd-detail-value">${item.value}</span></div>`;
            });
            detailsContent += '</div>';
            accordionHtml += buildAccordionItem('Product Details', 'fa-tag', detailsContent, true);
        }

        // Care Instructions accordion
        if (extractedSections['care'] && extractedSections['care'].length > 0) {
            hasAccordions = true;
            let careContent = '<ul class="pd-accordion-list">';
            extractedSections['care'].forEach(item => {
                // Split care instructions by semicolons
                const instructions = item.value.split(/[;]/).map(s => s.trim()).filter(Boolean);
                instructions.forEach(inst => {
                    careContent += `<li>${inst}</li>`;
                });
            });
            careContent += '</ul>';
            accordionHtml += buildAccordionItem('Care Instructions', 'fa-hand-sparkles', careContent, false);
        }

        // Features accordion
        if (extractedSections['features'] && extractedSections['features'].length > 0) {
            hasAccordions = true;
            let featContent = '<div class="pd-accordion-tags">';
            extractedSections['features'].forEach(item => {
                const tags = item.value.split(/[,]/).map(s => s.trim()).filter(Boolean);
                tags.forEach(tag => {
                    featContent += `<span class="pd-feature-tag">${tag}</span>`;
                });
            });
            featContent += '</div>';
            accordionHtml += buildAccordionItem('Features', 'fa-list-check', featContent, false);
        }

        // Size Chart accordion (includes table + print size)
        if (sizeChartHtml || (extractedSections['sizing'] && extractedSections['sizing'].length > 0)) {
            hasAccordions = true;
            let sizeContent = '';
            if (extractedSections['sizing']) {
                extractedSections['sizing'].forEach(item => {
                    sizeContent += `<p class="pd-size-note">${item.label}: ${item.value}</p>`;
                });
            }
            sizeContent += sizeChartHtml;
            accordionHtml += buildAccordionItem('Size Chart', 'fa-ruler', sizeContent, false);
        }

        // Notes accordion
        if (extractedSections['notes'] && extractedSections['notes'].length > 0) {
            hasAccordions = true;
            let notesContent = '';
            extractedSections['notes'].forEach(item => {
                notesContent += `<p>${item.value}</p>`;
            });
            accordionHtml += buildAccordionItem('Notes', 'fa-circle-info', notesContent, false);
        }

        if (!hasAccordions) {
            return rawHtml;
        }

        return `<div class="pd-accordions">${accordionHtml}</div>`;
    }

    function buildAccordionItem(title, icon, content, openByDefault) {
        return `
            <div class="pd-accordion${openByDefault ? ' open' : ''}">
                <button class="pd-accordion-header" type="button" aria-expanded="${openByDefault}">
                    <span class="pd-accordion-title"><i class="fas ${icon}"></i> ${title}</span>
                    <i class="fas fa-chevron-down pd-accordion-arrow"></i>
                </button>
                <div class="pd-accordion-body" style="${openByDefault ? '' : 'display:none;'}">
                    ${content}
                </div>
            </div>`;
    }

    function initAccordions(container) {
        container.querySelectorAll('.pd-accordion-header').forEach(header => {
            header.addEventListener('click', function () {
                const accordion = header.closest('.pd-accordion');
                const body = accordion.querySelector('.pd-accordion-body');
                const isOpen = accordion.classList.contains('open');

                if (isOpen) {
                    accordion.classList.remove('open');
                    header.setAttribute('aria-expanded', 'false');
                    body.style.display = 'none';
                } else {
                    accordion.classList.add('open');
                    header.setAttribute('aria-expanded', 'true');
                    body.style.display = 'block';
                }
            });
        });
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
