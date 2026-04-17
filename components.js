/* =============================================================================
   components.js — Becca's Cakes and Bakes
   Injects the shared navbar, footer, newsletter signup overlay, cart drawer,
   and checkout modal into every page.

   HOW TO USE IN EACH HTML PAGE:
   1. Add <div id="site-nav"></div> where the navbar should appear.
   2. Add <div id="site-footer"></div> where the footer should appear.
   3. Include this script: <script src="./components.js"></script>
   4. Set the active nav link by adding data-page="pageName" to <body>.
      e.g. <body data-page="gallery">
      Valid values: home | our-story | allergen-advice | upcoming-events | gallery | contact | shop

   TO UPDATE NAV OR FOOTER: edit this file only — changes apply to all pages.
   ============================================================================= */


var ALLERGEN_SYNONYMS = {
    'nuts': ['almond', 'almonds', 'walnut', 'walnuts', 'hazelnut', 'hazelnuts',
        'cashew', 'cashews', 'pecan', 'pecans', 'pistachio', 'pistachios',
        'macadamia', 'brazil nut', 'brazil nuts', 'pine nut', 'pine nuts'],
    'tree nuts': ['almond', 'almonds', 'walnut', 'walnuts', 'hazelnut', 'hazelnuts',
        'cashew', 'cashews', 'pecan', 'pecans', 'pistachio', 'pistachios'],
    'gluten': ['wheat', 'barley', 'rye', 'oat', 'oats', 'spelt'],
    'wheat': ['wheat', 'wheat flour', 'wholemeal'],
    'milk': ['milk', 'butter', 'cream', 'cheese', 'yogurt', 'lactose', 'whey', 'casein'],
    'dairy': ['milk', 'butter', 'cream', 'cheese', 'yogurt', 'lactose', 'whey', 'casein'],
};

function highlightAllergens(ingredients, allergens) {
    if (!ingredients) return '';

    var safe = ingredients
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    var terms = (allergens || []).filter(Boolean);

    // Expand each allergen into its synonyms if available, keeping the original too
    var allTerms = [];
    terms.forEach(function (term) {
        var lower = term.toLowerCase();
        allTerms.push(term);
        if (ALLERGEN_SYNONYMS[lower]) {
            allTerms = allTerms.concat(ALLERGEN_SYNONYMS[lower]);
        }
        // Also add singular/plural variant
        if (lower.endsWith('s')) {
            allTerms.push(term.slice(0, -1));
        } else {
            allTerms.push(term + 's');
        }
    });

    // Deduplicate and sort longest first
    allTerms = allTerms.filter(function (v, i, a) {
        return a.findIndex(function (x) { return x.toLowerCase() === v.toLowerCase(); }) === i;
    });
    allTerms.sort(function (a, b) { return b.length - a.length; });

    allTerms.forEach(function (term) {
        var escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var regex = new RegExp('\\b(' + escaped + ')\\b', 'gi');
        safe = safe.replace(regex, '<strong><em>$1</em></strong>');
    });

    return safe;
}

(function () {

    /* ── Navigation links ─────────────────────────────────────────────────── */
    const NAV_LINKS = [
        { label: 'Our Story', href: './our-story.html', page: 'our-story' },
        { label: 'Allergen Advice', href: './allergen-advice.html', page: 'allergen-advice' },
        { label: 'Upcoming Events', href: './upcoming-events.html', page: 'upcoming-events' },
        { label: 'Gallery', href: './gallery.html', page: 'gallery' },
        { label: 'Contact Us', href: './contact.html', page: 'contact' },
    ];

    const SHOP_LINK = { label: 'Shop', href: './shop.html', page: 'shop' };

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

    /* ── Reviews ──────────────────────────────────────────────────────────── */
    const REVIEWS = [
        {
            name: 'Tracy',
            text: 'Amazing cake, online communication was spot on and everything was explained and made clear from order to payment to collection.',
            food: 5,
            service: 5,
            atmosphere: 5,
            stars: 5
        },
        {
            name: 'Cliodhna Curley',
            text: "Ordered some Cupcakes from Beccas Cakes and Bakes for Mother's Day and can honestly say I loved everything about them! Being someone with ceoliac and who also struggles with diary finding a nice treat is very far few inbetween so when i came across this bakery i was so happy! They tasted amazing! The texture was perfect! I would highly highly recommend you will not be disappointed! And Becca herself is so lovely and so educated in everything around allergens etc which really puts you at ease!",
            food: 5,
            service: 5,
            atmosphere: 5,
            stars: 5
        },
        {
            name: 'Nichola Miller',
            text: 'The BEST caramel square I have ever tasted! Can’t wait to try all the other bakes!!!',
            food: 5,
            service: 5,
            atmosphere: 5,
            stars: 5
        },
        {
            name: 'Taylor Pollock',
            text: "Unreal school cake, great people and service!",
            service: 5,
            atmosphere: 5,
            stars: 5
        },
        {
            name: 'Jordyn Berryman',
            text: 'I recently tried this dairy-free, gluten-free bakery and was really impressed. I ordered their chocolate Bueno cupcakes for a party, and they were a great choice. The cupcakes were soft and moist with a rich chocolate flavour, and the topping was creamy and really tasty. They looked great and went down really well with everyone at the party. You honestly wouldn’t guess they were dairy-free and gluten-free. I’d definitely order from them again!',
            food: 5,
            service: 5,
            atmosphere: 5,
            stars: 5
        },
        {
            name: 'Leah McCorry',
            text: "I recently tried a range of treats from my friend’s home bakery and honestly everything has been incredible. I’ve had the caramel squares, themed Barbie cupcakes, cake, crispy treats and brownies — and every single one has been delicious. The caramel squares were perfectly rich and gooey, the brownies were indulgent and chocolatey, and the cupcakes looked amazing while tasting just as good. What’s even more impressive is that everything is gluten- and dairy-free, yet you genuinely wouldn’t be able to tell. The texture and flavour are just as good (if not better) than traditional bakes. The themed Barbie cupcakes were such a hit and beautifully done. It’s clear a lot of care and attention goes into both the look and taste of the bakes.",
            food: 5,
            service: 5,
            atmosphere: 5,
            stars: 5
        },
        {
            name: 'Abby Butterworth',
            text: 'Delicious bakes! Amazing inclusivity. GF and DF bakes but everyone can definitely enjoy! Yum!',
            food: 5,
            service: 5,
            atmosphere: 5,
            stars: 5
        },
        {
            name: 'Ronan Clarke',
            text: 'The strawberry and white chocolate rice crispy treats were amazing',
            food: 5,
            service: 5,
            atmosphere: 5,
            stars: 5
        },
    ];

    const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?sca_esv=f0f46d557053f7c4&hl=en-GB&biw=1710&bih=869&sxsrf=ANbL-n5KTD8M81eVa07DmgdPKr4hIo2noQ:1776109519384&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOXP594UY-BtZVyFDr-osKsLqQjhBFHtcFuRy-D62f_2SLIZ0L9UL8-Pw0_hLwQyATTG4gcJmC1ykmjB-90IVn8YcpqZbraNtpnBmiqSd8DbCK6N5Mw%3D%3D&q=Becca%27s+Cakes+and+Bakes+Reviews&sa=X&ved=2ahUKEwiuuPDHy-uTAxXWVkEAHVfaNfMQ0bkNegQIHxAH';

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

    function shopButtonHTML() {
        const isActive = activePage() === 'shop';
        return '<li class="nav-item nav-item--shop ms-2">' +
            '<a href="' + SHOP_LINK.href + '" ' +
            'class="btn btn-brand rounded-pill nav-shop-btn' + (isActive ? ' nav-shop-btn--active' : '') + '">' +
            '<i class="fas fa-shopping-bag me-1"></i>' + SHOP_LINK.label +
            '</a>' +
            '</li>';
    }

    /* ── Navbar HTML ──────────────────────────────────────────────────────── */
    function buildNavbar() {
        return '<nav class="navbar navbar-expand-lg">' +
            '<div class="container-xl position-relative navbar-padding">' +
            '<a class="navbar-brand d-lg-none" href="./new-index.html"><img src="./img/Logo circle.png" alt="Beccas Cakes and Bakes"></a>' +
            '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">' +
            '<span class="navbar-toggler-icon"></span>' +
            '</button>' +
            '<div class="collapse navbar-collapse" id="mainNavbar">' +
            '<ul class="navbar-nav me-auto">' +
            '<li class="nav-item fw-bold d-lg-none"><a class="nav-link' + (activePage() === 'home' ? ' active' : '') + '" href="./new-index.html">Home</a></li>' +
            LEFT_LINKS.map(navLinkHTML).join('') + '</ul>' +
            '<a class="navbar-brand navbar-center d-none d-lg-block" href="./new-index.html"><img src="./img/Logo circle.png" alt="Beccas Cakes and Bakes"></a>' +
            '<ul class="navbar-nav ms-auto align-items-center">' +
            RIGHT_LINKS.map(navLinkHTML).join('') +
            shopButtonHTML() +
            '</ul>' +
            '</div></div></nav>';
    }

    /* ── Footer HTML ──────────────────────────────────────────────────────── */
    function buildFooter() {
        const socialButtons = SOCIAL_LINKS.map(function (s) {
            return '<a class="btn text-white btn-floating m-1 ' + s.cssClass + '" href="' + s.href + '" role="button" aria-label="' + s.label + '"><i class="' + s.icon + '"></i></a>';
        }).join('');

        const HOME_LINK = { label: 'Home', href: './new-index.html' };
        const allFooterLinks = [HOME_LINK, ...NAV_LINKS, SHOP_LINK];
        const footerLinks = allFooterLinks.map(function (l) {
            return '<p><a href="' + l.href + '" class="text-reset">' + l.label + '</a></p>';
        }).join('');

        return '<footer class="bg-body-tertiary text-center">' +
            '<div class="container p-4 pb-0">' +
            '<section class="mb-4">' + socialButtons + '</section>' +
            '<section class="footer-newsletter mb-4">' +
            '<h6 class="text-uppercase fw-bold mb-3">Stay in the loop</h6>' +
            '<p class="footer-newsletter__sub">Join our community and get the latest on new bakes, market appearances, and special offers.</p>' +
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
            '<div class="text-center p-3 footer-copyright">' +
            'Created by: <a class="text-body" href="https://webshaw.co.uk/">webshaw.co.uk</a>' +
            '</div>' +
            '</footer>';
    }

    /* ── Cart + Checkout HTML ─────────────────────────────────────────────── */
    function buildCartAndCheckout() {
        return '' +
            '<div id="cart-overlay"></div>' +
            '<div id="cart-drawer" aria-label="Your cart">' +
            '<div class="cart-header">' +
            '<h2>Your Cart</h2>' +
            '<button id="cart-close" aria-label="Close cart"><i class="fas fa-times"></i></button>' +
            '</div>' +
            '<div class="cart-body" id="cart-body">' +
            '<div class="cart-empty" id="cart-empty">' +
            '<i class="fas fa-shopping-basket"></i>' +
            '<p>Your cart is empty</p>' +
            '<a href="./shop.html" class="btn btn-brand rounded-pill px-4 mt-2" style="font-size:0.9rem;">Go to Shop</a>' +
            '</div>' +
            '<div id="cart-items"></div>' +
            '</div>' +
            '<div class="cart-footer" id="cart-footer" style="display:none;">' +
            '<div class="cart-total"><span>Total</span><span id="cart-total-amount">£0.00</span></div>' +
            '<button class="btn btn-brand w-100 rounded-pill" id="cart-checkout-btn">' +
            '<i class="fas fa-lock me-2"></i>Proceed to Checkout' +
            '</button>' +
            '<button class="cart-clear-btn" id="cart-clear-btn">Clear cart</button>' +
            '</div>' +
            '</div>' +
            '<button class="cart-fab" id="cart-fab" aria-label="Open cart">' +
            '<i class="fas fa-shopping-basket"></i>' +
            '<span class="cart-fab__count" id="cart-fab-count">0</span>' +
            '</button>' +
            '<div id="checkout-overlay" role="dialog" aria-modal="true">' +
            '<div id="checkout-modal">' +
            '<button id="checkout-close" aria-label="Close">&times;</button>' +
            '<h2 class="checkout-title">Checkout</h2>' +
            '<div id="checkout-form-wrap">' +
            '<div class="checkout-section-label">Your details</div>' +
            '<div class="checkout-field">' +
            '<label for="co-name">Full name <span class="req">*</span></label>' +
            '<input type="text" id="co-name" class="form-control" placeholder="e.g. Sarah Murphy">' +
            '<div class="checkout-error" id="err-co-name">Please enter your name.</div>' +
            '</div>' +
            '<div class="checkout-field">' +
            '<label for="co-email">Email address <span class="req">*</span></label>' +
            '<input type="email" id="co-email" class="form-control" placeholder="e.g. sarah@email.com">' +
            '<div class="checkout-error" id="err-co-email">Please enter a valid email.</div>' +
            '</div>' +
            '<div class="checkout-section-label mt-4">Collection date</div>' +
            '<p class="checkout-hint">Collection is every <strong>Tuesday 12pm\u20136pm</strong>. Pick your Tuesday below \u2014 please allow at least 5\u20137 days.</p>' +
            '<div class="checkout-field">' +
            '<label for="co-date">Collection date <span class="req">*</span></label>' +
            '<select id="co-date" class="form-select"><option value="">Select a Tuesday\u2026</option></select>' +
            '<div class="checkout-error" id="err-co-date">Please select a collection date.</div>' +
            '</div>' +
            '<div class="checkout-section-label mt-4">Order summary</div>' +
            '<div id="checkout-summary"></div>' +
            '<div class="checkout-total"><span>Total</span><span id="checkout-total-amount"></span></div>' +
            '<button class="btn btn-brand w-100 rounded-pill mt-4" id="pay-btn">' +
            '<i class="fas fa-lock me-2"></i>Pay securely with Stripe' +
            '</button>' +
            '<p class="checkout-stripe-note"><i class="fas fa-lock"></i> Payments are processed securely by Stripe. We never store your card details.</p>' +
            '</div>' +
            '<div id="checkout-loading" style="display:none;">' +
            '<i class="fas fa-spinner fa-spin fa-2x"></i><p>Redirecting to payment\u2026</p>' +
            '</div>' +
            '<div id="checkout-error-msg" style="display:none;">' +
            '<i class="fas fa-exclamation-circle fa-2x" style="color:var(--pink)"></i>' +
            '<p id="checkout-error-text">Something went wrong. Please try again.</p>' +
            '<button class="btn btn-brand rounded-pill px-4 mt-2" id="checkout-retry-btn">Try again</button>' +
            '</div>' +
            '</div>' +
            '</div>';
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

    function buildReviews() {
        var stars = '<i class="fas fa-star"></i>'.repeat(5);

        var cards = REVIEWS.map(function (r) {
            var initial = r.name.charAt(0).toUpperCase();
            return '<div class="review-card">' +
                '<div class="review-card__header">' +
                '<div class="review-card__avatar">' + initial + '</div>' +
                '<div>' +
                '<div class="review-card__name">' + r.name + '</div>' +
                '<div class="review-card__stars">' + stars + '</div>' +
                '</div>' +
                '</div>' +
                '<p class="review-card__text">\u201c' + r.text + '\u201d</p>' +
                '</div>';
        }).join('');

        return '<section class="section-reviews">' +
            '<div class="container">' +
            '<div class="text-center mb-5">' +
            '<span class="section-label">What people are saying</span>' +
            '<h2 class="section-heading">Reviews from our customers</h2>' +
            '<div class="reviews-stars-header">' + stars +
            '<span class="reviews-rating-text">5.0 on Google</span>' +
            '</div>' +
            '</div>' +
            '<div class="reviews-grid">' + cards + '</div>' +
            '<div class="text-center mt-5">' +
            '<a href="https://g.page/r/CSBdm8qyxasfEAE/review" target="_blank" rel="noopener" class="btn btn-brand rounded-pill px-4">' +
            '<i class="fab fa-google me-2"></i>Leave us a review on Google' +
            '</a>' +
            '<div class="mt-3">' +
            '<a href="' + GOOGLE_REVIEWS_URL + '" target="_blank" rel="noopener" class="btn btn-brand-outline rounded-pill px-4">' +
            '<i class="fab fa-google me-2"></i>View all reviews on Google' +
            '</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</section>';
    }

    // Reviews — home page only
    if (activePage() === 'home') {
        var ctaBanner = document.querySelector('.section-cta');
        if (ctaBanner) {
            ctaBanner.insertAdjacentHTML('beforebegin', buildReviews());
        }
    }

    /* ── Cart state & logic ───────────────────────────────────────────────── */
    window.BeccaCart = (function () {
        var cart = {};
        try {
            var saved = localStorage.getItem('becca_cart');
            if (saved) cart = JSON.parse(saved);
        } catch (e) { cart = {}; }

        function persist() {
            try { localStorage.setItem('becca_cart', JSON.stringify(cart)); } catch (e) { }
        }

        function getUnitPrice(item) {
            if (_priceMapCache && _priceMapCache.hasOwnProperty(item.product.name)) {
                return _priceMapCache[item.product.name];
            }
            return parseFloat(item.product.price) || 0;
        }

        function cartTotal() {
            return Object.values(cart).reduce(function (sum, item) {
                return sum + (getUnitPrice(item) * item.qty);
            }, 0);
        }

        function cartCount() {
            return Object.values(cart).reduce(function (sum, item) { return sum + item.qty; }, 0);
        }

        function updateCartUI() {
            var count = cartCount();
            var total = cartTotal();
            var fab = document.getElementById('cart-fab');
            var fabCount = document.getElementById('cart-fab-count');
            if (fab) fab.classList.toggle('has-items', count > 0);
            if (fabCount) fabCount.textContent = count;

            var items = document.getElementById('cart-items');
            var empty = document.getElementById('cart-empty');
            var footer = document.getElementById('cart-footer');
            var totalEl = document.getElementById('cart-total-amount');
            if (!items) return;

            if (count === 0) {
                if (empty) empty.style.display = 'flex';
                items.innerHTML = '';
                if (footer) footer.style.display = 'none';
            } else {
                if (empty) empty.style.display = 'none';
                if (footer) footer.style.display = 'block';
                if (totalEl) totalEl.textContent = '\u00a3' + total.toFixed(2);

                items.innerHTML = Object.values(cart).map(function (item) {
                    var escapedName = item.product.name
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;');
                    return '<div class="cart-item">' +
                        '<div class="cart-item__info">' +
                        '<div class="cart-item__name">' + escapedName + '</div>' +
                        '<div class="cart-item__price">£' + (getUnitPrice(item) * item.qty).toFixed(2) + '</div>' +
                        '</div>' +
                        '<div class="cart-item__qty">' +
                        '<button class="qty-btn qty-btn--minus cart-qty-btn" data-name="' + escapedName + '">−</button>' +
                        '<span>' + item.qty + '</span>' +
                        '<button class="qty-btn qty-btn--plus cart-qty-btn" data-name="' + escapedName + '">+</button>' +
                        '</div>' +
                        '</div>';
                }).join('');

                items.querySelectorAll('.cart-qty-btn').forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        var name = btn.dataset.name
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"');
                        var product = cart[name] ? cart[name].product : null;
                        if (!product) return;
                        if (btn.classList.contains('qty-btn--plus')) addToCart(product);
                        else removeFromCart(product);
                    });
                });
            }
        }

        function addToCart(product) {
            var key = product.name;
            if (cart[key]) { cart[key].qty++; } else { cart[key] = { product: product, qty: 1 }; }
            persist();
            updateCartUI();
            if (window.shopUpdateQtyDisplay) window.shopUpdateQtyDisplay(product.name);
        }

        function removeFromCart(product) {
            var key = product.name;
            if (!cart[key]) return;
            cart[key].qty--;
            if (cart[key].qty <= 0) delete cart[key];
            persist();
            updateCartUI();
            if (window.shopUpdateQtyDisplay) window.shopUpdateQtyDisplay(product.name);
        }

        function clearCart() { cart = {}; persist(); updateCartUI(); }
        function getCart() { return cart; }
        function getCartTotal() { return cartTotal(); }
        function getCartCount() { return cartCount(); }

        return { addToCart, removeFromCart, clearCart, getCart, getCartTotal, getCartCount, updateCartUI };
    })();

    window.addToCart = window.BeccaCart.addToCart;
    window.removeFromCart = window.BeccaCart.removeFromCart;

    /* ── Cart open / close ────────────────────────────────────────────────── */
    function openCart() {
        document.getElementById('cart-drawer').classList.add('is-open');
        document.getElementById('cart-overlay').classList.add('is-visible');
        document.getElementById('cart-fab').style.display = 'none';
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        document.getElementById('cart-drawer').classList.remove('is-open');
        document.getElementById('cart-overlay').classList.remove('is-visible');
        document.getElementById('cart-fab').style.display = 'flex';
        document.body.style.overflow = '';
    }

    window.openCart = openCart;
    window.closeCart = closeCart;

    /* ── Tuesday date picker ──────────────────────────────────────────────── */
    function populateTuesdayDates() {
        var select = document.getElementById('co-date');
        if (!select) return;
        var today = new Date();
        var cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() + 7);
        var day = cutoff.getDay();
        var daysUntilTuesday = (2 - day + 7) % 7 || 7;
        var next = new Date(cutoff);
        next.setDate(cutoff.getDate() + (daysUntilTuesday === 0 ? 7 : daysUntilTuesday));
        for (var i = 0; i < 8; i++) {
            var d = new Date(next);
            d.setDate(next.getDate() + (i * 7));
            var label = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            var value = d.toISOString().split('T')[0];
            var opt = document.createElement('option');
            opt.value = value;
            opt.textContent = label + ' \u00b7 12pm\u20136pm';
            select.appendChild(opt);
        }
    }

    /* ── Authoritative price fetch ────────────────────────────────────────── */
    var PRICE_SHEET_CSV_URL = SITE_CONFIG.PRODUCTS_CSV_URL;

    var _priceMapCache = null;

    function parseCSVRowSimple(line) {
        var result = [], cur = '', inQuotes = false;
        for (var i = 0; i < line.length; i++) {
            var ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
                else inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                result.push(cur); cur = '';
            } else { cur += ch; }
        }
        result.push(cur);
        return result;
    }

    function fetchPriceMap() {
        if (_priceMapCache) return Promise.resolve(_priceMapCache);
        return fetch(PRICE_SHEET_CSV_URL)
            .then(function (res) { if (!res.ok) throw new Error('fetch failed'); return res.text(); })
            .then(function (text) {
                var lines = text.trim().split('\n');
                if (lines.length < 2) throw new Error('empty sheet');
                var headers = parseCSVRowSimple(lines[0]).map(function (h) { return h.trim(); });
                var nameIdx = headers.indexOf('name');
                var priceIdx = headers.indexOf('price');
                if (nameIdx === -1 || priceIdx === -1) throw new Error('missing columns');
                var map = {};
                for (var i = 1; i < lines.length; i++) {
                    var vals = parseCSVRowSimple(lines[i]);
                    var n = (vals[nameIdx] || '').trim();
                    var p = parseFloat((vals[priceIdx] || '').trim());
                    if (n && !isNaN(p)) map[n] = p;
                }
                _priceMapCache = map;
                return map;
            });
    }

    // Prefetch prices immediately so the cart drawer shows correct amounts as soon as possible
    fetchPriceMap().then(function () {
        if (window.BeccaCart) window.BeccaCart.updateCartUI();
    }).catch(function () {});

    /* ── Checkout modal ───────────────────────────────────────────────────── */
    function openCheckout() {
        closeCart();

        // Show modal immediately with a loading state in the summary
        var summary = document.getElementById('checkout-summary');
        var totalEl = document.getElementById('checkout-total-amount');
        summary.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--muted);font-size:0.9rem;">' +
            '<i class="fas fa-spinner fa-spin"></i> Loading prices…</div>';
        if (totalEl) totalEl.textContent = '';

        document.getElementById('checkout-form-wrap').style.display = 'block';
        document.getElementById('checkout-loading').style.display = 'none';
        document.getElementById('checkout-error-msg').style.display = 'none';
        var overlay = document.getElementById('checkout-overlay');
        overlay.classList.add('is-visible');
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { overlay.classList.add('is-open'); });
        });
        document.body.style.overflow = 'hidden';

        // Fetch authoritative prices, then render summary
        var cart = window.BeccaCart.getCart();
        fetchPriceMap()
            .then(function (priceMap) {
                var rows = Object.values(cart);
                summary.innerHTML = rows.map(function (item) {
                    var unitPrice = priceMap.hasOwnProperty(item.product.name)
                        ? priceMap[item.product.name]
                        : parseFloat(item.product.price) || 0;
                    return '<div class="checkout-summary-row">' +
                        '<span>' + item.product.name + ' \u00d7 ' + item.qty + '</span>' +
                        '<span>\u00a3' + (unitPrice * item.qty).toFixed(2) + '</span>' +
                        '</div>';
                }).join('');
                var total = rows.reduce(function (sum, item) {
                    var unitPrice = priceMap.hasOwnProperty(item.product.name)
                        ? priceMap[item.product.name]
                        : parseFloat(item.product.price) || 0;
                    return sum + unitPrice * item.qty;
                }, 0);
                if (totalEl) totalEl.textContent = '\u00a3' + total.toFixed(2);
            })
            .catch(function () {
                // Fall back to stored prices if the fetch fails
                var rows = Object.values(cart);
                summary.innerHTML = rows.map(function (item) {
                    return '<div class="checkout-summary-row">' +
                        '<span>' + item.product.name + ' \u00d7 ' + item.qty + '</span>' +
                        '<span>\u00a3' + (parseFloat(item.product.price) * item.qty).toFixed(2) + '</span>' +
                        '</div>';
                }).join('');
                if (totalEl) totalEl.textContent = '\u00a3' + window.BeccaCart.getCartTotal().toFixed(2);
            });
    }

    function closeCheckout() {
        var overlay = document.getElementById('checkout-overlay');
        overlay.classList.remove('is-open');
        overlay.addEventListener('transitionend', function handler() {
            overlay.classList.remove('is-visible');
            overlay.removeEventListener('transitionend', handler);
            document.body.style.overflow = '';
        });
    }

    window.openCheckout = openCheckout;
    window.closeCheckout = closeCheckout;

    /* ── Checkout validation ──────────────────────────────────────────────── */
    function showFieldError(fieldId, errId) {
        var f = document.getElementById(fieldId);
        var e = document.getElementById(errId);
        if (f) f.classList.add('is-invalid');
        if (e) e.style.display = 'block';
    }

    function clearFieldError(fieldId, errId) {
        var f = document.getElementById(fieldId);
        var e = document.getElementById(errId);
        if (f) f.classList.remove('is-invalid');
        if (e) e.style.display = 'none';
    }

    function validateCheckout() {
        var ok = true;
        var rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!document.getElementById('co-name').value.trim()) { showFieldError('co-name', 'err-co-name'); ok = false; }
        if (!rx.test(document.getElementById('co-email').value.trim())) { showFieldError('co-email', 'err-co-email'); ok = false; }
        if (!document.getElementById('co-date').value) { showFieldError('co-date', 'err-co-date'); ok = false; }
        return ok;
    }

    /* ── Signup overlay open / close ──────────────────────────────────────── */
    function openOverlay() {
        var overlay = document.getElementById('signup-overlay');
        var slot = document.getElementById('signup-form-slot');
        var formRoot = document.getElementById('sib-form-root');
        if (!overlay) return;
        if (formRoot && formRoot.querySelector('.sib-form') && !slot.querySelector('.sib-form')) {
            slot.appendChild(formRoot.querySelector('.sib-form'));
        }
        overlay.classList.add('is-visible');
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { overlay.classList.add('is-open'); });
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
                var successPanel = document.getElementById('success-message');
                if (successPanel) {
                    new MutationObserver(function (mutations, obs) {
                        if (successPanel.style.display !== 'none' && successPanel.offsetParent !== null) {
                            setTimeout(closeOverlay, 2000);
                            obs.disconnect();
                        }
                    }).observe(successPanel, { attributes: true, attributeFilter: ['style'] });
                }
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

        if (!document.querySelector('link[href*="sib-styles"]')) {
            var sibCss = document.createElement('link');
            sibCss.rel = 'stylesheet';
            sibCss.href = 'https://sibforms.com/forms/end-form/build/sib-styles.css';
            document.head.appendChild(sibCss);
        }
        if (!document.querySelector('script[src*="recaptcha"]')) {
            var rcScript = document.createElement('script');
            rcScript.src = 'https://www.google.com/recaptcha/api.js?hl=en';
            rcScript.async = true;
            document.head.appendChild(rcScript);
        }

        if (navSlot) navSlot.innerHTML = buildNavbar();
        if (footerSlot) footerSlot.innerHTML = buildFooter();

        document.body.insertAdjacentHTML('beforeend', buildCartAndCheckout());
        document.body.insertAdjacentHTML('afterbegin', buildSignupOverlay());

        // Cart events
        document.getElementById('cart-fab').addEventListener('click', openCart);
        document.getElementById('cart-close').addEventListener('click', closeCart);
        document.getElementById('cart-overlay').addEventListener('click', closeCart);
        document.getElementById('cart-checkout-btn').addEventListener('click', openCheckout);
        document.getElementById('cart-clear-btn').addEventListener('click', function () {
            window.BeccaCart.clearCart();
        });

        // Checkout events
        document.getElementById('checkout-close').addEventListener('click', closeCheckout);
        document.getElementById('checkout-overlay').addEventListener('click', function (e) {
            if (e.target === document.getElementById('checkout-overlay')) closeCheckout();
        });
        document.getElementById('checkout-retry-btn').addEventListener('click', function () {
            document.getElementById('checkout-form-wrap').style.display = 'block';
            document.getElementById('checkout-error-msg').style.display = 'none';
        });

        ['co-name', 'co-email', 'co-date'].forEach(function (id) {
            document.getElementById(id).addEventListener('input', function () {
                clearFieldError(id, 'err-' + id);
            });
        });

        // Pay button — Stripe
        document.getElementById('pay-btn').addEventListener('click', function () {
            if (!validateCheckout()) return;
            document.getElementById('checkout-form-wrap').style.display = 'none';
            document.getElementById('checkout-loading').style.display = 'flex';

            var cart = window.BeccaCart.getCart();
            var payload = {
                name: document.getElementById('co-name').value.trim(),
                email: document.getElementById('co-email').value.trim(),
                collectionDate: document.getElementById('co-date').value,
                items: Object.values(cart).map(function (item) {
                    return {
                        name: item.product.name,
                        price: Math.round(parseFloat(item.product.price) * 100),
                        quantity: item.qty,
                    };
                }),
            };

            fetch('/.netlify/functions/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
                .then(function (res) {
                    return res.json().then(function (data) {
                        return { ok: res.ok, data: data };
                    });
                })
                .then(function (result) {
                    if (!result.ok) {
                        throw new Error(result.data.error || 'Something went wrong. Please try again.');
                    }
                    if (result.data.url) { window.location.href = result.data.url; }
                    else { throw new Error(result.data.error || 'Something went wrong. Please try again.'); }
                })
                .catch(function (err) {
                    console.error(err);
                    document.getElementById('checkout-loading').style.display = 'none';
                    document.getElementById('checkout-error-msg').style.display = 'flex';
                    document.getElementById('checkout-error-text').textContent = err.message;
                });
        });

        // Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            var co = document.getElementById('checkout-overlay');
            if (co && co.classList.contains('is-open')) { closeCheckout(); return; }
            closeOverlay();
        });

        // Signup overlay events
        var signupOverlay = document.getElementById('signup-overlay');
        var closeBtn = document.getElementById('signup-close');
        if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
        if (signupOverlay) signupOverlay.addEventListener('click', function (e) {
            if (e.target === signupOverlay) closeOverlay();
        });
        document.addEventListener('click', function (e) {
            if (e.target && e.target.id === 'footer-signup-btn') openOverlay();
        });

        populateTuesdayDates();
        window.BeccaCart.updateCartUI();
        initBrevo(activePage() === 'home');
    });

})();