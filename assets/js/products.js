/*
=========================================================
BagsProMax — Products Rendering
=========================================================
*/

"use strict";

let selectedCategory = "all";
let searchKeyword = "";
let sortBy = "featured";

function getStockBadge(product) {
    if (!product.badge) return "";
    return `<span class="product-badge stock ${product.badge.type}">${product.badge.text}</span>`;
}

function slugifyColor(color) {
    return color.toLowerCase().replace(/\s+/g, "-");
}

function getProductImageForColor(product, color) {
    if (product.colorImages && product.colorImages[color]) {
        return product.colorImages[color];
    }

    const match = product.image.match(/^(.+)\.(jpg|jpeg|png|webp)$/i);
    if (!match) return product.image;

    return `${match[1]}-${slugifyColor(color)}.${match[2]}`;
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

    const card = document.getElementById(`product-image-${id}`)?.closest(".product-card");
    if (card) {
        card.querySelectorAll(".color-option").forEach(btn => {
            const isActive = btn.dataset.color === color;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    }

    const product = getProductById(id);
    const image = document.getElementById(`product-image-${id}`);
    if (!product || !image) return;

    const nextImage = getProductImageForColor(product, color);
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
                <img src="${product.image}" id="product-image-${product.id}" class="product-image" alt="${product.name}" loading="lazy" data-default-image="${product.image}">
                <div class="product-image-overlay">
                    <button type="button" class="product-overlay-btn" onclick="addProductFromCard(${product.id})" ${soldOut ? "disabled" : ""}>
                        <i class="bi bi-bag-plus"></i> ${soldOut ? "Sold Out" : "Quick Add"}
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
                <img src="${product.image}" id="product-image-${product.id}" class="product-image" alt="${product.name}" loading="lazy" data-default-image="${product.image}">
                <div class="product-image-overlay">
                    <button type="button" class="product-overlay-btn" onclick="addProductFromCard(${product.id})" ${soldOut ? "disabled" : ""}>
                        <i class="bi bi-bag-plus"></i> ${soldOut ? "Sold Out" : "Quick Add"}
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

    container.innerHTML = getTrendingProducts()
        .map(product => createTrendingCard(product))
        .join("");
    initProductTooltips(container);
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

    container.innerHTML = products.map(product => createCatalogCard(product)).join("");
    initProductTooltips(container);
}

function initProductsPage() {
    const container = document.getElementById("productContainer");
    if (!container || container.dataset.mode !== "all") return;

    const searchInput = document.getElementById("searchProduct");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");

    populateCategoryFilter();

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

