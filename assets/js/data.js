/*
=========================================================
BagsProMax — Shared Data
=========================================================
*/

"use strict";

let SITE_CONFIG = {};
let ALL_PRODUCTS = [];

const dataReady = Promise.all([
    fetch("assets/data/site-config.json").then(response => {
        if (!response.ok) throw new Error("Failed to load site config");
        return response.json();
    }),
    fetch("assets/data/products.json").then(response => {
        if (!response.ok) throw new Error("Failed to load products");
        return response.json();
    })
]).then(([config, products]) => {
    SITE_CONFIG = config;
    ALL_PRODUCTS = products;
});

function formatPrice(price) {
    return SITE_CONFIG.currencySymbol + price;
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
