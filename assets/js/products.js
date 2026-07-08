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

function createTrendingCard(product) {
    const promoBadge = product.badge && product.stock !== "low-stock" && product.stock !== "out-of-stock"
        ? `<span class="product-badge promo ${product.badge.type}">${product.badge.text}</span>`
        : "";

    return `
    <div class="col-lg-4 col-md-6">
        <div class="product-card">
            <div class="product-image-wrap">
                <span class="product-badge category">${product.category}</span>
                ${promoBadge}
                ${getStockBadge(product)}
                <img src="${product.image}" class="product-image" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-body">
                <div class="product-info">
                    <h4 class="product-title">${product.name}</h4>
                    <span class="product-price">${formatPrice(product.price)}</span>
                </div>
                <button class="btn-add-cart" onclick="addToCart(${product.id}, '${product.defaultColor}', 1)" ${!isProductAvailable(product) ? "disabled" : ""}>
                    ${isProductAvailable(product) ? "Add to Cart" : "Sold Out"}
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
                <img src="${product.image}" class="product-image" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-body">
                <div class="product-info">
                    <h4 class="product-title">${product.name}</h4>
                    <span class="product-price">${formatPrice(product.price)}</span>
                </div>
                <p class="product-description">${product.description}</p>
                <label class="product-field-label" for="color-${product.id}">COLOR</label>
                <select id="color-${product.id}" class="form-select product-color-select" ${soldOut ? "disabled" : ""}>
                    ${colorOptions}
                </select>
                <div class="product-actions-row">
                    <div class="qty-control ${soldOut ? "disabled" : ""}">
                        <button type="button" onclick="changeProductQty(${product.id}, -1)" ${soldOut ? "disabled" : ""}>-</button>
                        <input type="text" id="qty-${product.id}" value="1" readonly ${soldOut ? "disabled" : ""}>
                        <button type="button" onclick="changeProductQty(${product.id}, 1)" ${soldOut ? "disabled" : ""}>+</button>
                    </div>
                    <button class="btn-add-cart catalog-add-btn" onclick="addProductFromCard(${product.id})" ${soldOut ? "disabled" : ""}>
                        ${soldOut ? "Sold Out" : "Add to Cart"}
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

document.addEventListener("DOMContentLoaded", () => {
    renderTrendingProducts();
    initProductsPage();
});
