/*
=========================================================
MK Bags World — SEO Structured Data (JSON-LD)
=========================================================
*/

"use strict";

var SEO_SITE_URL = "https://www.mkbagsworld.com";
var SEO_OG_IMAGE = SEO_SITE_URL + "/assets/images/hero/hero-bg.jpg";

function injectJsonLd(data) {
    if (!data) return;
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
}

function getOrganizationSchema() {
    var brand = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.brand) || "MK Bags World";
    var email = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.email) || "support@mkbagsworld.com";
    var phone = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.phone) || "+923020519396";
    var address = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.address) || "Islamabad / Rawalpindi, Pakistan";

    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": brand,
        "url": SEO_SITE_URL + "/",
        "logo": SEO_SITE_URL + "/assets/images/logo/logo.svg",
        "image": SEO_OG_IMAGE,
        "email": email,
        "telephone": phone,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": address,
            "addressCountry": "PK"
        },
        "sameAs": [
            "https://www.instagram.com/bagsmkimported",
            "https://www.facebook.com/profile.php?id=61591058685973",
            "https://www.tiktok.com/@mkimported.bags"
        ]
    };
}

function getWebSiteSchema() {
    var brand = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.brand) || "MK Bags World";
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": brand,
        "url": SEO_SITE_URL + "/",
        "potentialAction": {
            "@type": "SearchAction",
            "target": SEO_SITE_URL + "/products.html?search={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };
}

function getLocalBusinessSchema() {
    var brand = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.brand) || "MK Bags World";
    var email = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.email) || "support@mkbagsworld.com";
    var phone = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.phone) || "+923020519396";

    return {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": brand,
        "url": SEO_SITE_URL + "/",
        "image": SEO_OG_IMAGE,
        "telephone": phone,
        "email": email,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Islamabad",
            "addressRegion": "Islamabad Capital Territory",
            "addressCountry": "PK"
        },
        "priceRange": "PKR",
        "currenciesAccepted": "PKR",
        "paymentAccepted": "Cash, Cash on Delivery",
        "areaServed": {
            "@type": "Country",
            "name": "Pakistan"
        }
    };
}

function getBreadcrumbSchema(items) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map(function (item, index) {
            return {
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": item.url
            };
        })
    };
}

function getFaqSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Do you deliver imported bags across Pakistan?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. MK Bags World delivers imported handbags nationwide across Pakistan, including Islamabad, Rawalpindi, Lahore, Karachi, Faisalabad, Multan, Peshawar, and other major cities."
                }
            },
            {
                "@type": "Question",
                "name": "Can I buy imported handbags with cash on delivery (COD)?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. You can order ladies handbags, tote bags, and crossbody bags with cash on delivery. Add items to your cart and checkout via WhatsApp to confirm your order and COD details."
                }
            },
            {
                "@type": "Question",
                "name": "Are your bags original imported bags?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. MK Bags World specializes in original imported bags and premium imported handbags for women — carefully selected for quality, design, stitching, and everyday durability."
                }
            },
            {
                "@type": "Question",
                "name": "What types of women's bags do you sell?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our collection includes ladies handbags, fashion handbags, tote bags, crossbody bags, sling bags, shoulder bags, long-strap handbags, and related fashion accessories for women in Pakistan."
                }
            },
            {
                "@type": "Question",
                "name": "How do I place an order on MK Bags World?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Browse our products, choose your color and quantity, add items to the cart, then tap Checkout via WhatsApp. Our team will confirm availability, shipping, and payment details."
                }
            },
            {
                "@type": "Question",
                "name": "How long does delivery take for imported bags in Pakistan?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Delivery usually takes a few business days depending on your city. Orders to major cities such as Islamabad, Lahore, and Karachi are typically processed faster after WhatsApp confirmation."
                }
            },
            {
                "@type": "Question",
                "name": "What is your return or exchange policy?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Eligible returns and exchanges follow the MK Bags World Return Policy. Contact us via WhatsApp or the Contact page if you need help with an order."
                }
            },
            {
                "@type": "Question",
                "name": "Why choose MK Bags World for imported handbags?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "MK Bags World offers premium imported handbags for women, cash on delivery, nationwide shipping, and easy WhatsApp ordering — so you can shop stylish bags online in Pakistan with confidence."
                }
            }
        ]
    };
}

function buildProductItemListSchema(products) {
    if (!Array.isArray(products) || !products.length) return null;

    var list = products.slice(0, 24).map(function (product, index) {
        var imagePath = product.image || "";
        var imageUrl = imagePath.indexOf("http") === 0
            ? imagePath
            : SEO_SITE_URL + "/" + String(imagePath).replace(/^\//, "");

        return {
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Product",
                "name": product.name,
                "description": product.description || (product.name + " — imported bag from MK Bags World"),
                "image": imageUrl,
                "sku": String(product.id || ""),
                "brand": {
                    "@type": "Brand",
                    "name": "MK Bags World"
                },
                "offers": {
                    "@type": "Offer",
                    "url": SEO_SITE_URL + "/products.html",
                    "priceCurrency": "PKR",
                    "price": String(product.price || 0),
                    "availability": product.soldOut
                        ? "https://schema.org/OutOfStock"
                        : "https://schema.org/InStock",
                    "itemCondition": "https://schema.org/NewCondition"
                }
            }
        };
    });

    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "MK Bags World — Ladies Handbags & Imported Bags",
        "itemListOrder": "https://schema.org/ItemListOrderAscending",
        "numberOfItems": list.length,
        "itemListElement": list
    };
}

function getPageBreadcrumbs() {
    var page = document.body && document.body.dataset ? document.body.dataset.page : "";
    var map = {
        products: [{ name: "Home", url: SEO_SITE_URL + "/" }, { name: "Products", url: SEO_SITE_URL + "/products.html" }],
        about: [{ name: "Home", url: SEO_SITE_URL + "/" }, { name: "About Us", url: SEO_SITE_URL + "/about.html" }],
        contact: [{ name: "Home", url: SEO_SITE_URL + "/" }, { name: "Contact Us", url: SEO_SITE_URL + "/contact.html" }],
        privacy: [{ name: "Home", url: SEO_SITE_URL + "/" }, { name: "Privacy Policy", url: SEO_SITE_URL + "/privacy-policy.html" }],
        terms: [{ name: "Home", url: SEO_SITE_URL + "/" }, { name: "Terms of Service", url: SEO_SITE_URL + "/terms-of-service.html" }],
        return: [{ name: "Home", url: SEO_SITE_URL + "/" }, { name: "Return Policy", url: SEO_SITE_URL + "/return-policy.html" }],
        returns: [{ name: "Home", url: SEO_SITE_URL + "/" }, { name: "Return Policy", url: SEO_SITE_URL + "/return-policy.html" }],
        "404": [{ name: "Home", url: SEO_SITE_URL + "/" }, { name: "Page Not Found", url: SEO_SITE_URL + "/404.html" }]
    };
    return map[page] || null;
}

function initSeoSchemas() {
    injectJsonLd(getOrganizationSchema());
    injectJsonLd(getWebSiteSchema());

    var page = document.body && document.body.dataset ? document.body.dataset.page : "";

    if (page === "home" || page === "contact") {
        injectJsonLd(getLocalBusinessSchema());
    }

    if (page === "home") {
        injectJsonLd(getFaqSchema());
    }

    var crumbs = getPageBreadcrumbs();
    if (crumbs) {
        injectJsonLd(getBreadcrumbSchema(crumbs));
    }

    if (page === "products" || page === "home") {
        if (typeof ALL_PRODUCTS !== "undefined" && ALL_PRODUCTS.length) {
            var products = page === "home"
                ? ALL_PRODUCTS.filter(function (p) { return p.trending; }).slice(0, 12)
                : ALL_PRODUCTS;
            injectJsonLd(buildProductItemListSchema(products.length ? products : ALL_PRODUCTS.slice(0, 12)));
        }
    }
}

function initSeo() {
    if (typeof dataReady !== "undefined" && dataReady && typeof dataReady.then === "function") {
        dataReady.then(initSeoSchemas).catch(initSeoSchemas);
        return;
    }
    initSeoSchemas();
}

document.addEventListener("DOMContentLoaded", initSeo);
