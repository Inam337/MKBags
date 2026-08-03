/*
=========================================================
MK Bags — App UI
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

function initHeroSwiper() {
    const heroSwiperEl = document.querySelector(".hero-swiper");
    if (!heroSwiperEl || typeof Swiper === "undefined") return;

    new Swiper(".hero-swiper", {
        effect: "fade",
        fadeEffect: { crossFade: true },
        loop: true,
        speed: 900,
        autoplay: {
            delay: 5500,
            disableOnInteraction: false
        },
        pagination: {
            el: ".hero-pagination",
            clickable: true
        }
    });
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

    const hideLoader = () => loader.classList.add("hidden");

    if (document.readyState === "complete") {
        hideLoader();
        return;
    }

    window.addEventListener("load", hideLoader, { once: true });
}

function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const contact = {
            firstName: form.querySelector("#firstName").value.trim(),
            lastName: form.querySelector("#lastName").value.trim(),
            email: form.querySelector("#contactEmail").value.trim(),
            phone: form.querySelector("#contactPhone").value.trim(),
            orderNumber: form.querySelector("#orderNumber").value.trim(),
            message: form.querySelector("#contactMessage").value.trim()
        };

        try {
            await shareContactToWhatsApp(contact);
            form.reset();
        } catch (error) {
            console.error(error);
            openWhatsAppText(buildContactTextSummary(contact));
            form.reset();
        }
    });
}

function initApp() {
    updateCartUI();
    setActiveNavLink();
    initTopBar();
    initHeroSwiper();
    initBackToTop();
    initContactForm();
}

document.addEventListener("DOMContentLoaded", () => {
    initLoader();

    dataReady
        .then(initApp)
        .catch(error => {
            console.error("Failed to load site data:", error);
            initApp();
        });
});
