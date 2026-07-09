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

function getSwatchColor(color) {
    const colors = {
        Black: "#1a1a1a",
        Navy: "#1e3a5f",
        Grey: "#94a3b8",
        Tan: "#c4a574",
        Olive: "#556b2f",
        Brown: "#8b5a2b",
        Natural: "#e8dcc8"
    };
    return colors[color] || "#cbd5e1";
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

function getColorRadios(product, soldOut) {
    const groupName = `color-${product.id}`;

    return product.colors.map(color => `
        <label class="color-radio" title="${color}">
            <input type="radio"
                name="${groupName}"
                value="${color}"
                ${color === product.defaultColor ? "checked" : ""}
                ${soldOut ? "disabled" : ""}
                onchange="setProductColor(${product.id}, '${color}')"
                aria-label="${color}">
            <span class="color-radio-mark" style="--swatch-color: ${getSwatchColor(color)}"></span>
        </label>
    `).join("");
}

function setProductColor(id, color) {
    const select = document.getElementById(`color-${id}`);
    if (select) select.value = color;

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
    const colorOptions = product.colors.map(c =>
        `<option value="${c}" ${c === product.defaultColor ? "selected" : ""}>${c}</option>`
    ).join("");

    return `
    <div class="col-lg-4 col-md-6">
        <div class="product-card trending-card ${soldOut ? "sold-out" : ""}">
            <div class="product-image-wrap">
                <span class="product-badge category">${product.category}</span>
                ${promoBadge}
                ${getStockBadge(product)}
                <img src="${product.image}" id="product-image-${product.id}" class="product-image" alt="${product.name}" loading="lazy" data-default-image="${product.image}">
                <div class="product-image-overlay">
                    <button type="button" class="product-overlay-btn" onclick="addProductFromCard(${product.id})" ${soldOut ? "disabled" : ""}>
                        <i class="bi bi-bag-plus"></i> ${soldOut ? "Sold Out" : "Quick Add"}
                    </button>
                </div>
            </div>
            <div class="product-body">
                <div class="product-info">
                    <h4 class="product-title">${product.name}</h4>
                    <span class="product-price">${formatPrice(product.price)}</span>
                </div>
                <div class="product-color-field">
                    <div class="color-radio-group" id="color-radios-${product.id}" role="radiogroup" aria-label="Select color for ${product.name}">
                        ${getColorRadios(product, soldOut)}
                    </div>
                    <select id="color-${product.id}" class="form-select product-color-select visually-hidden" ${soldOut ? "disabled" : ""} tabindex="-1" aria-hidden="true">
                        ${colorOptions}
                    </select>
                </div>
                <button class="btn-add-cart" onclick="addProductFromCard(${product.id})" ${soldOut ? "disabled" : ""}>
                    ${soldOut ? "Sold Out" : "Add to Cart"}
                </button>
            </div>
        </div>
    </div>`;
}

function createCatalogCard(product) {
    const colorOptions = product.colors.map(c =>
        `<option value="${c}" ${c === product.defaultColor ? "selected" : ""}>${c}</option>`
    ).join("");

    const soldOut = !isProductAvailable(product);

    return `
    <div class="col-lg-4 col-md-6 product-item" data-category="${product.filterCategory}">
        <div class="product-card catalog-card ${soldOut ? "sold-out" : ""}">
            <div class="product-image-wrap">
                <span class="product-badge category">${product.category}</span>
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
                    <span class="product-price">${formatPrice(product.price)}</span>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-color-field">
                    <span class="product-field-label">COLOR</span>
                    <div class="color-radio-group" id="color-radios-${product.id}" role="radiogroup" aria-label="Select color for ${product.name}">
                        ${getColorRadios(product, soldOut)}
                    </div>
                    <select id="color-${product.id}" class="form-select product-color-select visually-hidden" ${soldOut ? "disabled" : ""} tabindex="-1" aria-hidden="true">
                        ${colorOptions}
                    </select>
                </div>
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
}

function getFilteredProducts() {
    return sortProducts(ALL_PRODUCTS.filter(product => {
        const matchesCategory = selectedCategory === "all" || product.filterCategory === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchKeyword) ||
            product.description.toLowerCase().includes(searchKeyword) ||
            product.filterCategory.toLowerCase().includes(searchKeyword) ||
            product.category.toLowerCase().includes(searchKeyword);
        return matchesCategory && matchesSearch;
    }));
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
}

function initProductsPage() {
    const container = document.getElementById("productContainer");
    if (!container || container.dataset.mode !== "all") return;

    const searchInput = document.getElementById("searchProduct");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");

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

