/*
=========================================================
MK Bags World — Products Rendering
=========================================================
*/

"use strict";

let selectedCategory = "all";
let searchKeyword = "";
let sortBy = "featured";

const productCardSwipers = new WeakMap();
let productGalleryModalEl = null;
let productGalleryModal = null;
let productGalleryModalSwiper = null;
let productGalleryClickBound = false;

function getStockBadge(product) {
    if (!product.badge) return "";
    return `<span class="product-badge stock ${product.badge.type}">${product.badge.text}</span>`;
}

function slugifyColor(color) {
    return color.toLowerCase().replace(/\s+/g, "-");
}

function getProductImageForColor(product, color) {
    if (!product || !product.image) return "";

    if (color && product.colorImages && product.colorImages[color]) {
        return product.colorImages[color];
    }

    return product.image;
}

function getProductGalleryImages(product) {
    if (!product) return [];

    const images = [];
    const pushUnique = src => {
        if (!src || images.includes(src)) return;
        images.push(src);
    };

    if (Array.isArray(product.images)) {
        product.images.forEach(pushUnique);
    }

    pushUnique(product.image);

    if (product.colorImages && typeof product.colorImages === "object") {
        Object.values(product.colorImages).forEach(pushUnique);
    }

    return images;
}

function getProductCardSliderMarkup(product) {
    const images = getProductGalleryImages(product);
    const gallery = images.length ? images : [product.image || ""];
    const safeName = escapeHtml(product.name);
    const multi = gallery.length > 1;

    const slides = gallery.map((src, index) => `
        <div class="swiper-slide">
            <button type="button"
                class="product-image-trigger"
                data-product-id="${product.id}"
                data-image-index="${index}"
                aria-label="View larger image of ${safeName}">
                <img src="${src}"
                    ${index === 0 ? `id="product-image-${product.id}"` : ""}
                    class="product-image"
                    alt="${safeName}"
                    loading="${index === 0 ? "eager" : "lazy"}"
                    data-default-image="${gallery[0]}"
                    data-product-id="${product.id}"
                    data-image-index="${index}">
            </button>
        </div>`).join("");

    return `
        <div class="swiper product-card-swiper" id="product-swiper-${product.id}" data-product-id="${product.id}">
            <div class="swiper-wrapper">
                ${slides}
            </div>
            ${multi ? `<div class="swiper-pagination product-card-pagination"></div>` : ""}
        </div>`;
}

function destroyProductCardSwipers(container) {
    if (!container) return;

    container.querySelectorAll(".product-card-swiper").forEach(el => {
        const instance = productCardSwipers.get(el) || el.swiper;
        if (instance && typeof instance.destroy === "function") {
            instance.destroy(true, true);
        }
        productCardSwipers.delete(el);
    });
}

function initProductCardSwiper(el) {
    if (!el || typeof Swiper === "undefined") return null;

    const existing = productCardSwipers.get(el) || el.swiper;
    if (existing && typeof existing.destroy === "function") {
        existing.destroy(true, true);
        productCardSwipers.delete(el);
    }

    const slideCount = el.querySelectorAll(".swiper-slide").length;
    const paginationEl = el.querySelector(".product-card-pagination");

    const swiper = new Swiper(el, {
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 350,
        watchOverflow: true,
        grabCursor: slideCount > 1,
        allowTouchMove: slideCount > 1,
        nested: true,
        pagination: slideCount > 1 && paginationEl
            ? { el: paginationEl, clickable: true }
            : undefined
    });

    productCardSwipers.set(el, swiper);
    return swiper;
}

function initProductCardSwipers(container) {
    if (!container || typeof Swiper === "undefined") return;

    destroyProductCardSwipers(container);
    container.querySelectorAll(".product-card-swiper").forEach(initProductCardSwiper);
    bindProductGalleryTriggers();
    ensureProductGalleryModal();
}

function ensureProductGalleryModal() {
    if (productGalleryModalEl) return productGalleryModalEl;

    const existing = document.getElementById("productGalleryModal");
    if (existing) {
        productGalleryModalEl = existing;
        return productGalleryModalEl;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <div class="modal fade product-gallery-modal" id="productGalleryModal" tabindex="-1"
            aria-labelledby="productGalleryModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content">
                    <div class="modal-header border-0">
                        <h2 class="modal-title h5 text-white mb-0" id="productGalleryModalLabel">Product gallery</h2>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-0">
                        <div class="swiper product-gallery-modal-swiper">
                            <div class="swiper-wrapper" id="productGalleryModalSlides"></div>
                            <div class="swiper-button-prev product-gallery-nav" aria-label="Previous image"></div>
                            <div class="swiper-button-next product-gallery-nav" aria-label="Next image"></div>
                            <div class="swiper-pagination product-gallery-pagination"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    productGalleryModalEl = wrapper.firstElementChild;
    document.body.appendChild(productGalleryModalEl);

    productGalleryModalEl.addEventListener("hidden.bs.modal", () => {
        destroyProductGalleryModalSwiper();
    });

    return productGalleryModalEl;
}

function destroyProductGalleryModalSwiper() {
    if (productGalleryModalSwiper && typeof productGalleryModalSwiper.destroy === "function") {
        productGalleryModalSwiper.destroy(true, true);
    }
    productGalleryModalSwiper = null;
}

function initProductGalleryModalSwiper(startIndex = 0) {
    if (typeof Swiper === "undefined") return null;

    const modalEl = ensureProductGalleryModal();
    const swiperEl = modalEl.querySelector(".product-gallery-modal-swiper");
    if (!swiperEl) return null;

    destroyProductGalleryModalSwiper();

    const slideCount = swiperEl.querySelectorAll(".swiper-slide").length;
    const initialSlide = Math.max(0, Math.min(startIndex, slideCount - 1));

    const nextEl = swiperEl.querySelector(".swiper-button-next");
    const prevEl = swiperEl.querySelector(".swiper-button-prev");
    const paginationEl = swiperEl.querySelector(".product-gallery-pagination");
    const multi = slideCount > 1;

    if (nextEl) nextEl.style.display = multi ? "" : "none";
    if (prevEl) prevEl.style.display = multi ? "" : "none";
    if (paginationEl) paginationEl.style.display = multi ? "" : "none";

    productGalleryModalSwiper = new Swiper(swiperEl, {
        initialSlide,
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 400,
        loop: multi,
        grabCursor: multi,
        allowTouchMove: true,
        keyboard: {
            enabled: true,
            onlyInViewport: false
        },
        pagination: multi
            ? { el: paginationEl, clickable: true }
            : undefined,
        navigation: multi
            ? { nextEl, prevEl }
            : undefined
    });

    return productGalleryModalSwiper;
}

function openProductGalleryModal(productId, startIndex = 0) {
    const product = getProductById(productId);
    if (!product || typeof bootstrap === "undefined") return;

    const images = getProductGalleryImages(product);
    if (!images.length) return;

    const modalEl = ensureProductGalleryModal();
    const titleEl = modalEl.querySelector("#productGalleryModalLabel");
    const slidesEl = modalEl.querySelector("#productGalleryModalSlides");
    if (!slidesEl) return;

    const safeName = escapeHtml(product.name);
    if (titleEl) titleEl.textContent = product.name;

    slidesEl.innerHTML = images.map((src, index) => `
        <div class="swiper-slide">
            <div class="product-gallery-slide">
                <img src="${src}" alt="${safeName} — image ${index + 1}" class="product-gallery-image">
            </div>
        </div>`).join("");

    if (!productGalleryModal) {
        productGalleryModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    }

    const onShown = () => {
        initProductGalleryModalSwiper(startIndex);
        modalEl.removeEventListener("shown.bs.modal", onShown);
    };
    modalEl.addEventListener("shown.bs.modal", onShown);
    productGalleryModal.show();
}

function bindProductGalleryTriggers() {
    if (productGalleryClickBound) return;

    document.addEventListener("click", event => {
        const trigger = event.target.closest(".product-image-trigger");
        if (!trigger) return;

        const swiperEl = trigger.closest(".product-card-swiper");
        const swiper = swiperEl ? (productCardSwipers.get(swiperEl) || swiperEl.swiper) : null;
        if (swiper && swiper.allowClick === false) return;

        event.preventDefault();
        const productId = Number(trigger.dataset.productId);
        const imageIndex = Number(trigger.dataset.imageIndex || 0);
        if (!productId) return;

        openProductGalleryModal(productId, imageIndex);
    });

    productGalleryClickBound = true;
}

function getPriceBlock(product) {
    const comparePrice = product.discountedPrice && product.discountedPrice > product.price
        ? `<span class="product-discounted-price">${formatPrice(product.discountedPrice)}</span>`
        : "";

    return `
        <div class="product-price-wrap">
            <span class="product-price">${formatPrice(product.price)}</span>
            ${comparePrice}
        </div>`;
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function getDescriptionBlock(product) {
    const description = (product.description || "").trim();
    if (!description) return "";

    const safeText = escapeHtml(description);
    return `
        <p class="product-description"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-custom-class="product-desc-tooltip"
            title="${safeText}">
            ${safeText}
        </p>`;
}

function initProductTooltips(container) {
    if (!container || typeof bootstrap === "undefined" || !bootstrap.Tooltip) return;

    container.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
        const existing = bootstrap.Tooltip.getInstance(el);
        if (existing) existing.dispose();
        new bootstrap.Tooltip(el, { trigger: "hover focus", container: "body" });
    });
}

function getColorField(product, soldOut) {
    const colors = Array.isArray(product.colors) ? product.colors : [product.defaultColor];
    const activeColor = product.defaultColor || colors[0] || "Default";
    const colorOptions = colors.map(c =>
        `<option value="${c}" ${c === activeColor ? "selected" : ""}>${c}</option>`
    ).join("");

    const colorChoices = colors.length > 1
        ? `<div class="color-option-group" role="group" aria-label="Select color for ${product.name}">
            ${colors.map(color => `
                <button type="button"
                    class="color-option ${color === activeColor ? "active" : ""}"
                    data-color="${color}"
                    ${soldOut ? "disabled" : ""}
                    onclick="setProductColor(${product.id}, '${color}')"
                    aria-pressed="${color === activeColor}">
                    ${color}
                </button>
            `).join("")}
        </div>`
        : "";

    return `
        <div class="product-color-field">
            <p class="product-color-text">
                Color: <span id="color-label-${product.id}">${activeColor}</span>
            </p>
            ${colorChoices}
            <select id="color-${product.id}" class="form-select product-color-select visually-hidden" ${soldOut ? "disabled" : ""} tabindex="-1" aria-hidden="true">
                ${colorOptions}
            </select>
        </div>`;
}

function setProductColor(id, color) {
    const select = document.getElementById(`color-${id}`);
    if (select) select.value = color;

    const label = document.getElementById(`color-label-${id}`);
    if (label) label.textContent = color;

    const card = document.getElementById(`product-image-${id}`)?.closest(".product-card")
        || document.getElementById(`product-swiper-${id}`)?.closest(".product-card");
    if (card) {
        card.querySelectorAll(".color-option").forEach(btn => {
            const isActive = btn.dataset.color === color;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    }

    const product = getProductById(id);
    if (!product) return;

    const nextImage = getProductImageForColor(product, color);
    const gallery = getProductGalleryImages(product);
    const targetIndex = Math.max(0, gallery.indexOf(nextImage));
    const swiperEl = document.getElementById(`product-swiper-${id}`);
    const swiper = swiperEl ? (productCardSwipers.get(swiperEl) || swiperEl.swiper) : null;

    if (swiper && typeof swiper.slideTo === "function" && targetIndex >= 0) {
        swiper.slideTo(targetIndex);
        return;
    }

    const image = document.getElementById(`product-image-${id}`);
    if (!image) return;

    const fallbackImage = product.image;
    image.classList.add("is-swapping");

    const preview = new Image();
    preview.onload = () => {
        image.src = nextImage;
        image.classList.remove("is-swapping");
    };
    preview.onerror = () => {
        image.src = fallbackImage;
        image.classList.remove("is-swapping");
    };
    preview.src = nextImage;
}

function createTrendingCard(product) {
    const promoBadge = product.badge && product.stock !== "low-stock" && product.stock !== "out-of-stock"
        ? `<span class="product-badge promo ${product.badge.type}">${product.badge.text}</span>`
        : "";
    const soldOut = !isProductAvailable(product);
    const typeBadge = product.type
        ? `<span class="product-badge type">${product.type}</span>`
        : "";

    return `
    <div class="col-lg-4 col-md-6">
        <div class="product-card trending-card ${soldOut ? "sold-out" : ""}">
            <div class="product-image-wrap">
                <span class="product-badge category">${product.category}</span>
                ${typeBadge}
                ${promoBadge}
                ${getStockBadge(product)}
                ${getProductCardSliderMarkup(product)}
                <div class="product-image-overlay">
                    <button type="button" class="product-overlay-btn" onclick="addProductFromCard(${product.id})" ${soldOut ? "disabled" : ""} aria-label="${soldOut ? "Sold out" : "Quick add to cart"}" title="${soldOut ? "Sold Out" : "Quick Add"}">
                        <i class="bi ${soldOut ? "bi-bag-x" : "bi-bag-plus"}" aria-hidden="true"></i>
                    </button>
                </div>
                 <div class="product-brand-identity">
                    <img src="assets/images/icons/icons.svg" alt="brand" width="48" />
                </div>
            </div>
            <div class="product-body">
                <div class="product-info">
                    <h4 class="product-title">${product.name}</h4>
                    ${getPriceBlock(product)}
                </div>
                ${getDescriptionBlock(product)}
                ${getColorField(product, soldOut)}
                <div class="product-actions-row">
                    <div class="qty-control ${soldOut ? "disabled" : ""}">
                        <button type="button" onclick="changeProductQty(${product.id}, -1)" ${soldOut ? "disabled" : ""} aria-label="Decrease quantity">-</button>
                        <input type="text" id="qty-${product.id}" value="1" readonly ${soldOut ? "disabled" : ""} aria-label="Quantity">
                        <button type="button" onclick="changeProductQty(${product.id}, 1)" ${soldOut ? "disabled" : ""} aria-label="Increase quantity">+</button>
                    </div>
                    <button class="btn-add-cart catalog-add-btn" onclick="addProductFromCard(${product.id})" ${soldOut ? "disabled" : ""}>
                        <i class="bi bi-bag-plus me-1"></i>${soldOut ? "Sold Out" : "Add to Cart"}
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

function createCatalogCard(product) {
    const soldOut = !isProductAvailable(product);
    const typeBadge = product.type
        ? `<span class="product-badge type">${product.type}</span>`
        : "";

    return `
    <div class="col-lg-4 col-md-6 product-item" data-category="${product.filterCategory}">
        <div class="product-card catalog-card ${soldOut ? "sold-out" : ""}">
            <div class="product-image-wrap">
                <span class="product-badge category">${product.category}</span>
                ${typeBadge}
                ${getStockBadge(product)}
                ${getProductCardSliderMarkup(product)}
                <div class="product-image-overlay">
                    <button type="button" class="product-overlay-btn" onclick="addProductFromCard(${product.id})" ${soldOut ? "disabled" : ""} aria-label="${soldOut ? "Sold out" : "Quick add to cart"}" title="${soldOut ? "Sold Out" : "Quick Add"}">
                        <i class="bi ${soldOut ? "bi-bag-x" : "bi-bag-plus"}" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="product-brand-identity">
                    <img src="assets/images/icons/icons.svg" alt="brand" width="48" />
                </div>
            </div>
            <div class="product-body">
                <div class="product-info">
                    <h4 class="product-title">${product.name}</h4>
                    ${getPriceBlock(product)}
                </div>
                ${getDescriptionBlock(product)}
                ${getColorField(product, soldOut)}
                <div class="product-actions-row">
                    <div class="qty-control ${soldOut ? "disabled" : ""}">
                        <button type="button" onclick="changeProductQty(${product.id}, -1)" ${soldOut ? "disabled" : ""} aria-label="Decrease quantity">-</button>
                        <input type="text" id="qty-${product.id}" value="1" readonly ${soldOut ? "disabled" : ""} aria-label="Quantity">
                        <button type="button" onclick="changeProductQty(${product.id}, 1)" ${soldOut ? "disabled" : ""} aria-label="Increase quantity">+</button>
                    </div>
                    <button class="btn-add-cart catalog-add-btn" onclick="addProductFromCard(${product.id})" ${soldOut ? "disabled" : ""}>
                        <i class="bi bi-bag-plus me-1"></i>${soldOut ? "Sold Out" : "Add to Cart"}
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

function sortProducts(products) {
    const sorted = [...products];

    switch (sortBy) {
        case "price-low":
            return sorted.sort((a, b) => a.price - b.price);
        case "price-high":
            return sorted.sort((a, b) => b.price - a.price);
        case "name":
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return sorted;
    }
}

function renderTrendingProducts() {
    const container = document.getElementById("productContainer");
    if (!container || container.dataset.mode !== "trending") return;

    destroyProductCardSwipers(container);
    container.innerHTML = getTrendingProducts()
        .map(product => createTrendingCard(product))
        .join("");
    initProductTooltips(container);
    initProductCardSwipers(container);
}

function getFilteredProducts() {
    const keyword = (searchKeyword || "").trim().toLowerCase();

    return sortProducts(ALL_PRODUCTS.filter(product => {
        const filterCategory = String(product.filterCategory || "").trim();
        const matchesCategory = selectedCategory === "all" || filterCategory === selectedCategory;

        if (!matchesCategory) return false;
        if (!keyword) return true;

        const haystack = [
            product.name,
            product.description,
            product.category,
            product.filterCategory,
            product.type,
            ...(Array.isArray(product.colors) ? product.colors : [])
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return haystack.includes(keyword);
    }));
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById("categoryFilter");
    if (!categoryFilter) return;

    const currentValue = categoryFilter.value || selectedCategory || "all";
    const categories = [...new Set(
        ALL_PRODUCTS
            .map(product => String(product.filterCategory || "").trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    categoryFilter.innerHTML = `<option value="all">All Categories</option>` +
        categories.map(category =>
            `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
        ).join("");

    const hasCurrent = [...categoryFilter.options].some(option => option.value === currentValue);
    categoryFilter.value = hasCurrent ? currentValue : "all";
    selectedCategory = categoryFilter.value;
}

function renderAllProducts() {
    const container = document.getElementById("productContainer");
    if (!container || container.dataset.mode !== "all") return;

    const products = getFilteredProducts();

    if (products.length === 0) {
        destroyProductCardSwipers(container);
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-products">
                    <i class="bi bi-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter.</p>
                </div>
            </div>`;
        return;
    }

    destroyProductCardSwipers(container);
    container.innerHTML = products.map(product => createCatalogCard(product)).join("");
    initProductTooltips(container);
    initProductCardSwipers(container);
}

function initProductsPage() {
    const container = document.getElementById("productContainer");
    if (!container || container.dataset.mode !== "all") return;

    const searchInput = document.getElementById("searchProduct");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");

    populateCategoryFilter();

    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    const categoryParam = params.get("category");

    if (searchInput && searchParam) {
        searchInput.value = searchParam;
        searchKeyword = searchParam.trim().toLowerCase();
    }

    if (categoryFilter && categoryParam) {
        const decoded = decodeURIComponent(categoryParam).trim();
        const normalized = decoded.toLowerCase();
        const match = [...categoryFilter.options].find(opt => {
            const value = opt.value.toLowerCase();
            return value === normalized || value.includes(normalized) || normalized.includes(value);
        });
        if (match && match.value !== "all") {
            categoryFilter.value = match.value;
            selectedCategory = match.value;
        } else if (!searchKeyword) {
            // Fallback: treat unknown category labels as a search term
            searchKeyword = normalized;
            if (searchInput) searchInput.value = decoded;
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", e => {
            searchKeyword = e.target.value.trim().toLowerCase();
            renderAllProducts();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", e => {
            selectedCategory = e.target.value;
            renderAllProducts();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener("change", e => {
            sortBy = e.target.value;
            renderAllProducts();
        });
    }

    renderAllProducts();
}

function initProductViews() {
    renderTrendingProducts();
    initProductsPage();
}

document.addEventListener("DOMContentLoaded", () => {
    dataReady.then(initProductViews).catch(error => {
        console.error("Failed to load products:", error);
        initProductViews();
    });
});

