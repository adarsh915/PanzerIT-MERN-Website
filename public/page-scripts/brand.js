/* Brand page route adjustments. */
(function () {
    function whenReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    }

    whenReady(function () {
        var ctaTitle = document.querySelector(".tv-cta-section .sec-title");
        var ctaText = document.querySelector(".tv-cta-section .cta-content-wrapper p");
        var footerCopy = document.querySelector(".footer-bottom .copyright .mb-0");

        if (ctaTitle) {
            ctaTitle.textContent = "Let's Make IT Secure";
        }

        if (ctaText) {
            ctaText.textContent = "Panzer IT helps organizations achieve continuous secure data accessibility and availability with the right protection, backup and response strategy.";
        }

        if (footerCopy) {
            footerCopy.textContent = "Copyright Panzer IT - Make IT Secure. All Rights Reserved.";
        }
    });
})();
