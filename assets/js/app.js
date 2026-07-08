/*
=========================================================
BagsProMax — App UI
=========================================================
*/

"use strict";

function setActiveNavLink() {
    const page = document.body.dataset.page;
    if (!page) return;

    document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
        const href = link.getAttribute("href");
        const isActive = (page === "home" && (href === "index.html" || href === "./" || href === "/")) ||
            (page !== "home" && href && href.includes(page));
        link.classList.toggle("active", isActive);
    });
}

function initTopBar() {
    const closeTopBar = document.getElementById("closeTopBar");
    const topBar = document.getElementById("topBar");
    const topBarText = document.getElementById("topBarText");

    if (topBarText && typeof SITE_CONFIG !== "undefined") {
        topBarText.textContent = SITE_CONFIG.topBarText;
    }

    if (closeTopBar && topBar) {
        closeTopBar.addEventListener("click", () => topBar.classList.add("hidden"));
    }
}

function initBackToTop() {
    const backToTop = document.getElementById("backToTop");
    if (!backToTop) return;

    window.addEventListener("scroll", () => {
        backToTop.classList.toggle("show", window.scrollY > 400);
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function initLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;

    window.addEventListener("load", () => {
        loader.classList.add("hidden");
    });
}

function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        const firstName = form.querySelector("#firstName").value.trim();
        const lastName = form.querySelector("#lastName").value.trim();
        const email = form.querySelector("#contactEmail").value.trim();
        const phone = form.querySelector("#contactPhone").value.trim();
        const orderNumber = form.querySelector("#orderNumber").value.trim();
        const message = form.querySelector("#contactMessage").value.trim();

        let text = `Hello BagsProMax,%0A%0AName: ${firstName} ${lastName}%0AEmail: ${email}%0APhone: ${phone}`;
        if (orderNumber) text += `%0AOrder: ${orderNumber}`;
        text += `%0A%0AMessage:%0A${message}`;

        window.open(`https://wa.me/${SITE_CONFIG.whatsapp}?text=${text}`, "_blank");
        form.reset();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
    setActiveNavLink();
    initTopBar();
    initBackToTop();
    initLoader();
    initContactForm();
});
