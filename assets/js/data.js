/*
=========================================================
BagsProMax — Shared Data
=========================================================
*/

"use strict";

let SITE_CONFIG = {};
let ALL_PRODUCTS = [];

function getAssetBasePath() {
    const script = document.currentScript || document.querySelector('script[src*="data.js"]');
    if (!script) return "";

    const src = script.getAttribute("src") || "";
    return src.replace(/assets\/js\/data\.js(?:\?.*)?$/, "");
}

function resolveAssetPath(path) {
    const base = getAssetBasePath();
    return new URL(`${base}${path}`, window.location.href).href;
}

function isLocalFileProtocol() {
    return window.location.protocol === "file:";
}

function loadDataScript(path, readValue) {
    const existing = readValue();
    if (existing) return Promise.resolve(existing);

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = resolveAssetPath(path);
        script.onload = () => resolve(readValue());
        script.onerror = () => reject(new Error(`Failed to load ${path}`));
        document.head.appendChild(script);
    });
}

function fetchJson(path) {
    const url = resolveAssetPath(path);
    return fetch(url).then(response => {
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        return response.json();
    });
}

function loadSiteConfig() {
    if (isLocalFileProtocol()) {
        return loadDataScript("assets/data/site-config.js", () => window.MKBAGS_SITE_CONFIG);
    }

    return fetchJson("assets/data/site-config.json").catch(() =>
        loadDataScript("assets/data/site-config.js", () => window.MKBAGS_SITE_CONFIG)
    );
}

function loadProducts() {
    if (isLocalFileProtocol()) {
        return loadDataScript("assets/data/catalog.data.js", () => window.MKBAGS_PRODUCTS);
    }

    return fetchJson("assets/data/products.json").catch(() =>
        loadDataScript("assets/data/catalog.data.js", () => window.MKBAGS_PRODUCTS)
    );
}

const dataReady = Promise.all([
    loadSiteConfig(),
    loadProducts()
]).then(([config, products]) => {
    SITE_CONFIG = config || {};
    ALL_PRODUCTS = Array.isArray(products) ? products : [];
});

function formatPrice(price) {
    const symbol = SITE_CONFIG.currencySymbol || "$";
    return symbol + price;
}

function getProductById(id) {
    return ALL_PRODUCTS.find(p => p.id === Number(id));
}

function getTrendingProducts() {
    return ALL_PRODUCTS.filter(p => p.trending);
}

function isProductAvailable(product) {
    return product && product.stock !== "out-of-stock";
}
