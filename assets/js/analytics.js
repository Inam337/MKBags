/*
=========================================================
MK Bags World — Analytics (GA4 + Search Console)
Google tag (gtag.js) — Measurement ID: G-ETJ8PK8HQ4
=========================================================
*/
(function () {
    "use strict";

    var GA_ID = "G-ETJ8PK8HQ4";

    // Optional: paste Google Search Console verification content here
    var GSC_CONTENT = "";

    if (GSC_CONTENT) {
        var meta = document.createElement("meta");
        meta.name = "google-site-verification";
        meta.content = GSC_CONTENT;
        document.head.appendChild(meta);
    }

    if (!GA_ID) return;

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID);
})();
