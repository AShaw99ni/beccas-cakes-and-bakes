/* =============================================================================
   components.js — Becca's Cakes and Bakes
   Injects the shared navbar, footer, and newsletter signup overlay into every page.

   HOW TO USE IN EACH HTML PAGE:
   1. Add <div id="site-nav"></div> where the navbar should appear.
   2. Add <div id="site-footer"></div> where the footer should appear.
   3. Include this script: <script src="./components.js"></script>
   4. Set the active nav link by adding data-page="pageName" to <body>.
      e.g. <body data-page="gallery">
      Valid values: home | our-story | allergen-advice | upcoming-events | gallery | contact

   TO UPDATE NAV OR FOOTER: edit this file only — changes apply to all pages.
   ============================================================================= */

(function () {

    /* ── Navigation links ─────────────────────────────────────────────────── */
    const NAV_LINKS = [
        { label: 'Home', href: './new-index.html', page: 'home' },
        { label: 'Our Story', href: './our-story.html', page: 'our-story' },
        { label: 'Allergen Advice', href: './allergen-advice.html', page: 'allergen-advice' },
        { label: 'Upcoming Events', href: './upcoming-events.html', page: 'upcoming-events' },
        { label: 'Gallery', href: './gallery.html', page: 'gallery' },
        { label: 'Contact Us', href: './contact.html', page: 'contact' },
    ];

    const LEFT_LINKS = NAV_LINKS.slice(0, 3);
    const RIGHT_LINKS = NAV_LINKS.slice(3);

    /* ── Social links ─────────────────────────────────────────────────────── */
    const SOCIAL_LINKS = [
        { icon: 'fab fa-facebook-f', href: 'https://www.facebook.com/profile.php?id=61586782277669', cssClass: 'footer-social-facebook', label: 'Facebook' },
        { icon: 'fab fa-instagram', href: 'https://www.instagram.com/beccascakesandbakes.ni/', cssClass: 'footer-social-instagram', label: 'Instagram' },
        { icon: 'fab fa-tiktok', href: 'https://www.tiktok.com/@beccascakesandbakes.ni', cssClass: 'footer-social-tiktok', label: 'TikTok' },
        { icon: 'fab fa-linkedin-in', href: 'https://www.linkedin.com/in/rebecca-mcalees-1941843a7', cssClass: 'footer-social-linkedin', label: 'LinkedIn' },
        { icon: 'fa fa-envelope', href: 'mailto:beccascakesandbakes.ni@gmail.com', cssClass: 'footer-social-email', label: 'Email' },
    ];

    /* ── Helpers ──────────────────────────────────────────────────────────── */
    function activePage() {
        return document.body.dataset.page || '';
    }

    function navLinkHTML(link) {
        const isActive = link.page === activePage();
        return '<li class="nav-item fw-bold">' +
            '<a class="nav-link' + (isActive ? ' active' : '') + '" href="' + link.href + '">' + link.label + '</a>' +
            '</li>';
    }

    /* ── Navbar HTML ──────────────────────────────────────────────────────── */
    function buildNavbar() {
        return '<nav class="navbar navbar-expand-lg">' +
            '<div class="container-xl position-relative navbar-padding">' +
            '<a class="navbar-brand d-lg-none" href="./index.html"><img src="./img/Logo circle.png" alt="Beccas Cakes and Bakes"></a>' +
            '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>' +
            '<div class="collapse navbar-collapse" id="mainNavbar">' +
            '<ul class="navbar-nav me-auto">' + LEFT_LINKS.map(navLinkHTML).join('') + '</ul>' +
            '<a class="navbar-brand navbar-center d-none d-lg-block" href="./index.html"><img src="./img/Logo circle.png" alt="Beccas Cakes and Bakes"></a>' +
            '<ul class="navbar-nav ms-auto">' + RIGHT_LINKS.map(navLinkHTML).join('') + '</ul>' +
            '</div></div></nav>';
    }

    /* ── Footer HTML ──────────────────────────────────────────────────────── */
    function buildFooter() {
        const socialButtons = SOCIAL_LINKS.map(function (s) {
            return '<a class="btn text-white btn-floating m-1 ' + s.cssClass + '" href="' + s.href + '" role="button" aria-label="' + s.label + '"><i class="' + s.icon + '"></i></a>';
        }).join('');

        const footerLinks = NAV_LINKS.map(function (l) {
            return '<p><a href="' + l.href + '" class="text-reset">' + l.label + '</a></p>';
        }).join('');

        return '<footer class="bg-body-tertiary text-center">' +
            '<div class="container p-4 pb-0">' +

            '<section class="mb-4">' + socialButtons + '</section>' +

            '<section class="footer-newsletter mb-4">' +
            '<h6 class="text-uppercase fw-bold mb-3">Stay in the loop</h6>' +
            '<p class="footer-newsletter__sub">Get notified about new bakes, markets and special offers.</p>' +
            '<button class="btn btn-brand rounded-pill px-4" id="footer-signup-btn">' +
            '<i class="fa fa-envelope me-2"></i>Subscribe to our newsletter' +
            '</button>' +
            '</section>' +

            '<section><div class="container text-center"><div class="row mt-3"><div>' +
            '<h6 class="text-uppercase fw-bold mb-4">Pages</h6>' +
            footerLinks +
            '</div></div></div></section>' +
            '</div>' +
            '<div class="text-center p-3 footer-copyright">' +
            '&copy; 2026 Copyright: <a class="text-body" href="https://beccascakesandbakes.co.uk/">beccascakesandbakes.co.uk</a>' +
            '</div>' +
            '</footer>';
    }

    /* ── Brevo signup overlay HTML ────────────────────────────────────────── */
    function buildSignupOverlay() {
        return '<div id="sib-form-root">' +
            '<div class="sib-form">' +
            '<div id="sib-form-container" class="sib-form-container">' +
            '<div id="error-message" class="sib-form-message-panel sib-form-message-panel--error">' +
            '<div class="sib-form-message-panel__text sib-form-message-panel__text--center">' +
            '<svg viewBox="0 0 512 512" class="sib-icon sib-notification__icon"><path d="M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z"/></svg>' +
            '<span class="sib-form-message-panel__inner-text">Your subscription could not be saved. Please try again.</span>' +
            '</div></div>' +
            '<div id="success-message" class="sib-form-message-panel sib-form-message-panel--success">' +
            '<div class="sib-form-message-panel__text sib-form-message-panel__text--center">' +
            '<svg viewBox="0 0 512 512" class="sib-icon sib-notification__icon"><path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"/></svg>' +
            '<span class="sib-form-message-panel__inner-text">Your subscription has been successful.</span>' +
            '</div></div>' +
            '<div id="sib-container" class="sib-container--large sib-container--vertical">' +
            '<form id="sib-form" method="POST" action="https://da693347.sibforms.com/serve/MUIFABDuSbicOn4fLWsaq-jHgzn2y-H0P6aDkhYRZGbT0QbwUqw3-hYc07iARWG6B_fBhxl8984dSa87SojzSu-MIEQoa2_dp32Mmiz7MQCdPAjhqAaCEeptJ0Nv5JRKynvTh_H4wc0bOMI9543apz4UHHaR8U9wegutvD1O2iJV-CgoShI4I1alYOICMD5dooeg3fmXnS_hS73mrQ==" data-type="subscription">' +
            '<div class="sib-form-block sib-form-block--heading"><p>Get notified when we open</p></div>' +
            '<div class="sib-form-block sib-form-block--subheading"><p>Subscribe to our mailing list and stay updated</p></div>' +
            '<div class="sib-input sib-form-block"><div class="form__entry entry_block"><div class="form__label-row">' +
            '<label class="entry__label" for="EMAIL" data-required="*">Enter your email address to subscribe</label>' +
            '<div class="entry__field"><input class="input" type="text" id="EMAIL" name="EMAIL" autocomplete="off" placeholder="Email" data-required="true" required></div>' +
            '</div><label class="entry__error entry__error--primary"></label>' +
            '<label class="entry__specification">Provide your email address to subscribe. For e.g abc@xyz.com</label>' +
            '</div></div>' +
            '<div class="sib-optin sib-form-block" data-required="true"><div class="form__entry entry_mcq"><div class="form__label-row">' +
            '<label class="entry__label" for="OPT_IN" data-required="*">Opt-in</label>' +
            '<div class="entry__choice"><label>' +
            '<input type="checkbox" class="input_replaced" value="1" id="OPT_IN" name="OPT_IN" required>' +
            '<span class="checkbox checkbox_tick_positive"></span>' +
            '<span><p>I agree to receive your emails and accept the data privacy statement.</p></span>' +
            '</label></div></div>' +
            '<label class="entry__error entry__error--primary"></label>' +
            '<label class="entry__specification">You may unsubscribe at any time using the link in our newsletter.</label>' +
            '</div></div>' +
            '<div class="sib-captcha sib-form-block"><div class="form__entry entry_block"><div class="form__label-row">' +
            '<div class="g-recaptcha sib-visible-recaptcha" id="sib-captcha" data-sitekey="6Ld5t1YsAAAAAGUzrGfnzBpzdrTNPM7vXNlXNwdS" data-callback="handleCaptchaResponse"></div>' +
            '</div><label class="entry__error entry__error--primary"></label></div></div>' +
            '<input type="text" name="email_address_check" value="" class="input--hidden">' +
            '<input type="hidden" name="locale" value="en">' +
            '<div class="sib-form-block" style="text-align:center;padding-top:0.5rem;">' +
            '<button class="sib-form-block__button sib-form-block__button-with-loader btn btn-brand" form="sib-form" type="submit">' +
            '<svg class="icon clickable__icon progress-indicator__icon sib-hide-loader-icon" viewBox="0 0 512 512"><path d="M460.116 373.846l-20.823-12.022c-5.541-3.199-7.54-10.159-4.663-15.874 30.137-59.886 28.343-131.652-5.386-189.946-33.641-58.394-94.896-95.833-161.827-99.676C261.028 55.961 256 50.751 256 44.352V20.309c0-6.904 5.808-12.337 12.703-11.982 83.556 4.306 160.163 50.864 202.11 123.677 42.063 72.696 44.079 162.316 6.031 236.832-3.14 6.148-10.75 8.461-16.728 5.01z"/></svg>' +
            'Subscribe</button></div>' +
            '</form></div></div></div></div>' +
            '<div id="signup-overlay" role="dialog" aria-modal="true">' +
            '<div id="signup-box">' +
            '<button id="signup-close" aria-label="Close">&times;</button>' +
            '<div id="signup-form-slot"></div>' +
            '</div></div>';
    }

    /* ── Overlay open / close ─────────────────────────────────────────────── */
    function openOverlay() {
        var overlay = document.getElementById('signup-overlay');
        var slot = document.getElementById('signup-form-slot');
        var formRoot = document.getElementById('sib-form-root');
        if (!overlay) return;

        // Teleport Brevo form into the visible slot (only if not already there)
        if (formRoot && formRoot.querySelector('.sib-form') && !slot.querySelector('.sib-form')) {
            slot.appendChild(formRoot.querySelector('.sib-form'));
        }

        overlay.classList.add('is-visible');
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                overlay.classList.add('is-open');
            });
        });
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay() {
        var overlay = document.getElementById('signup-overlay');
        if (!overlay) return;
        overlay.classList.remove('is-open');
        overlay.addEventListener('transitionend', function handler() {
            overlay.classList.remove('is-visible');
            overlay.removeEventListener('transitionend', handler);
            document.body.style.overflow = '';
        });
    }

    /* ── Brevo init ───────────────────────────────────────────────────────── */
    function initBrevo(showOnFirstVisit) {
        window.REQUIRED_CODE_ERROR_MESSAGE = 'Please choose a country code';
        window.LOCALE = 'en';
        window.EMAIL_INVALID_MESSAGE = window.SMS_INVALID_MESSAGE = 'The information provided is invalid. Please review the field format and try again.';
        window.REQUIRED_ERROR_MESSAGE = 'This field cannot be left blank. ';
        window.GENERIC_INVALID_MESSAGE = 'The information provided is invalid. Please review the field format and try again.';
        window.translation = {
            common: {
                selectedList: '{quantity} list selected', selectedLists: '{quantity} lists selected',
                selectedOption: '{quantity} selected', selectedOptions: '{quantity} selected',
            }
        };
        window.AUTOHIDE = Boolean(0);

        window.handleCaptchaResponse = function () {
            var el = document.getElementById('sib-captcha');
            if (el) el.dispatchEvent(new Event('captchaChange'));
        };

        window.addEventListener('load', function () {
            var s = document.createElement('script');
            s.onload = function () {
                // Auto-close overlay 2s after successful subscription
                var successPanel = document.getElementById('success-message');
                if (successPanel) {
                    new MutationObserver(function (mutations, obs) {
                        if (successPanel.style.display !== 'none' && successPanel.offsetParent !== null) {
                            setTimeout(closeOverlay, 2000);
                            obs.disconnect();
                        }
                    }).observe(successPanel, { attributes: true, attributeFilter: ['style'] });
                }

                // Show automatically on homepage first visit only
                if (showOnFirstVisit && !localStorage.getItem('firstVisitShown')) {
                    localStorage.setItem('firstVisitShown', 'true');
                    setTimeout(openOverlay, 800);
                }
            };
            s.src = 'https://sibforms.com/forms/end-form/build/main.js';
            document.body.appendChild(s);
        });
    }

    /* ── Inject on DOM ready ──────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
        var navSlot = document.getElementById('site-nav');
        var footerSlot = document.getElementById('site-footer');

        // Inject Brevo stylesheet on every page if not already present
        if (!document.querySelector('link[href*="sib-styles"]')) {
            var sibCss = document.createElement('link');
            sibCss.rel = 'stylesheet';
            sibCss.href = 'https://sibforms.com/forms/end-form/build/sib-styles.css';
            document.head.appendChild(sibCss);
        }

        // Inject reCAPTCHA script on every page if not already present
        if (!document.querySelector('script[src*="recaptcha"]')) {
            var rcScript = document.createElement('script');
            rcScript.src = 'https://www.google.com/recaptcha/api.js?hl=en';
            rcScript.async = true;
            document.head.appendChild(rcScript);
        }

        if (navSlot) navSlot.innerHTML = buildNavbar();
        if (footerSlot) footerSlot.innerHTML = buildFooter();

        // Inject overlay + hidden Brevo form at top of body
        document.body.insertAdjacentHTML('afterbegin', buildSignupOverlay());

        // Wire up close interactions
        var overlay = document.getElementById('signup-overlay');
        var closeBtn = document.getElementById('signup-close');
        if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
        if (overlay) overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeOverlay();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeOverlay();
        });

        // Footer subscribe button opens overlay on any page
        document.addEventListener('click', function (e) {
            if (e.target && e.target.id === 'footer-signup-btn') openOverlay();
        });

        // Init Brevo — auto-show popup on homepage only
        initBrevo(activePage() === 'home');
    });

})();