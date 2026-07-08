/*
=========================================================
BagsProMax — Shared Data
=========================================================
*/

"use strict";

const SITE_CONFIG = {
    brand: "BAGSPROMAX",
    currency: "USD",
    currencySymbol: "$",
    whatsapp: "18001234567",
    email: "support@bagspromax.com",
    phone: "+923356000819",
    phoneHours: "Mon-Fri, 9am - 6pm PST",
    address: "123 Design Avenue, Suite 400, San Francisco, CA 94107",
    hours: "Mon-Fri, 9am - 6pm PST",
    freeShippingMin: 150,
    topBarText: "FREE GLOBAL SHIPPING ON ORDERS OVER $150"
};

const ALL_PRODUCTS = [
    {
        id: 1,
        name: "Alpine Pro Backpack",
        category: "BACKPACK",
        filterCategory: "Backpack",
        price: 149,
        description: "The ultimate all-rounder for work and travel.",
        image: "assets/images/products/alpine-pro-backpack.jpg",
        colors: ["Black", "Navy", "Grey"],
        defaultColor: "Black",
        stock: "in-stock",
        badge: null,
        trending: true
    },
    {
        id: 2,
        name: "City Commuter Tote",
        category: "TOTE BAG",
        filterCategory: "Tote",
        price: 89,
        description: "Spacious enough for your laptop, sleek enough for the office.",
        image: "assets/images/products/city-commuter-tote.jpg",
        colors: ["Tan", "Black", "Olive"],
        defaultColor: "Tan",
        stock: "in-stock",
        badge: null,
        trending: true
    },
    {
        id: 3,
        name: "Weekender Duffel",
        category: "DUFFEL BAG",
        filterCategory: "Duffel",
        price: 199,
        description: "Perfect for short getaways and gym sessions.",
        image: "assets/images/products/weekender-duffel.jpg",
        colors: ["Navy", "Black", "Olive"],
        defaultColor: "Navy",
        stock: "low-stock",
        badge: { text: "Low Stock", type: "low-stock" },
        trending: true
    },
    {
        id: 4,
        name: "Executive Leather Brief",
        category: "LEATHER GOODS",
        filterCategory: "Leather",
        price: 249,
        description: "Timeless professional style with modern functionality.",
        image: "assets/images/products/executive-leather-brief.jpg",
        colors: ["Brown", "Black", "Tan"],
        defaultColor: "Brown",
        stock: "in-stock",
        badge: null,
        trending: true
    },
    {
        id: 5,
        name: "Urban Daypack",
        category: "DAYPACK",
        filterCategory: "Backpack",
        price: 129,
        description: "Minimalist design for the city explorer.",
        image: "assets/images/products/urban-daypack.jpg",
        colors: ["Black", "Grey", "Navy"],
        defaultColor: "Black",
        stock: "in-stock",
        badge: null,
        trending: true
    },
    {
        id: 6,
        name: "Studio Canvas Tote",
        category: "CANVAS TOTE",
        filterCategory: "Tote",
        price: 69,
        description: "Eco-friendly canvas for creative minds.",
        image: "assets/images/products/studio-canvas-tote.jpg",
        colors: ["Natural", "Black", "Olive"],
        defaultColor: "Natural",
        stock: "in-stock",
        badge: null,
        trending: true
    },
    {
        id: 7,
        name: "Expedition Travel Duffel",
        category: "TRAVEL BAG",
        filterCategory: "Travel Bag",
        price: 219,
        description: "Heavy-duty duffel for the serious traveler.",
        image: "assets/images/products/voyager-travel-bag.jpg",
        colors: ["Olive", "Black", "Navy"],
        defaultColor: "Olive",
        stock: "out-of-stock",
        badge: { text: "Out of Stock", type: "out-of-stock" },
        trending: false
    },
    {
        id: 8,
        name: "Heritage Leather Satchel",
        category: "SATCHEL",
        filterCategory: "Leather",
        price: 279,
        description: "Handcrafted leather that gets better with age.",
        image: "assets/images/products/classic-leather-messenger.jpg",
        colors: ["Tan", "Brown", "Black"],
        defaultColor: "Tan",
        stock: "in-stock",
        badge: null,
        trending: false
    },
    {
        id: 9,
        name: "Nomad Camera Backpack",
        category: "CAMERA BAG",
        filterCategory: "Backpack",
        price: 189,
        description: "Customizable compartments for photographers.",
        image: "assets/images/products/metro-laptop-bag.jpg",
        colors: ["Black", "Grey", "Olive"],
        defaultColor: "Black",
        stock: "low-stock",
        badge: { text: "Low Stock", type: "low-stock" },
        trending: false
    }
];

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
