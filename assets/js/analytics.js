/*
=========================================================
MK Bags World — Analytics (GA4 + Search Console)
Replace GA_ID and GSC_CONTENT before going live.
=========================================================
*/
(function () {
    "use strict";

    // TODO: Replace with your real Google Analytics 4 Measurement ID
    var GA_ID = "G-XXXXXXXXXX";

    // TODO: Replace with Google Search Console verification content (index only needed)
    var GSC_CONTENT = "";

    if (GSC_CONTENT) {
        var meta = document.createElement("meta");
        meta.name = "google-site-verification";
        meta.content = GSC_CONTENT;
        document.head.appendChild(meta);
    }

    if (!GA_ID || /X{4,}/i.test(GA_ID)) {
        return;
    }

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
