/* =============================================================================
   components.js — Becca's Cakes and Bakes
   Injects the shared navbar and footer into every page.

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
        { label: 'Home',            href: './new-index.html',            page: 'home' },
        { label: 'Our Story',       href: './our-story.html',        page: 'our-story' },
        { label: 'Allergen Advice', href: './allergen-advice.html',  page: 'allergen-advice' },
        { label: 'Upcoming Events', href: './upcoming-events.html',  page: 'upcoming-events' },
        { label: 'Gallery',         href: './gallery.html',          page: 'gallery' },
        { label: 'Contact Us',      href: './contact.html',          page: 'contact' },
    ];

    /* Split into left (first 3) and right (last 3) for the split-logo layout */
    const LEFT_LINKS  = NAV_LINKS.slice(0, 3);
    const RIGHT_LINKS = NAV_LINKS.slice(3);

    /* ── Social links ─────────────────────────────────────────────────────── */
    const SOCIAL_LINKS = [
        { icon: 'fab fa-facebook-f',  href: 'https://www.facebook.com/profile.php?id=61586782277669', cssClass: 'footer-social-facebook',  label: 'Facebook' },
        { icon: 'fab fa-instagram',   href: 'https://www.instagram.com/beccascakesandbakes.ni/',       cssClass: 'footer-social-instagram', label: 'Instagram' },
        { icon: 'fab fa-tiktok',      href: 'https://www.tiktok.com/@beccascakesandbakes.ni',          cssClass: 'footer-social-tiktok',    label: 'TikTok' },
        { icon: 'fab fa-linkedin-in', href: 'https://www.linkedin.com/in/rebecca-mcalees-1941843a7',   cssClass: 'footer-social-linkedin',  label: 'LinkedIn' },
        { icon: 'fa fa-envelope',     href: 'mailto:beccascakesandbakes.ni@gmail.com',                 cssClass: 'footer-social-email',     label: 'Email' },
    ];

    /* ── Helpers ──────────────────────────────────────────────────────────── */
    function activePage() {
        return document.body.dataset.page || '';
    }

    function navLinkHTML(link) {
        const isActive = link.page === activePage();
        return `<li class="nav-item fw-bold">
                    <a class="nav-link${isActive ? ' active' : ''}" href="${link.href}">${link.label}</a>
                </li>`;
    }

    /* ── Navbar HTML ──────────────────────────────────────────────────────── */
    function buildNavbar() {
        return `
        <nav class="navbar navbar-expand-lg">
            <div class="container-xl position-relative navbar-padding">

                <!-- Mobile logo (hidden on desktop) -->
                <a class="navbar-brand d-lg-none" href="./index.html">
                    <img src="./img/Logo circle.png" alt="Becca's Cakes and Bakes">
                </a>

                <!-- Hamburger toggle -->
                <button class="navbar-toggler" type="button"
                        data-bs-toggle="collapse" data-bs-target="#mainNavbar"
                        aria-controls="mainNavbar" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="mainNavbar">

                    <!-- Left links -->
                    <ul class="navbar-nav me-auto">
                        ${LEFT_LINKS.map(navLinkHTML).join('')}
                    </ul>

                    <!-- Center logo (desktop only, overhangs navbar) -->
                    <a class="navbar-brand navbar-center d-none d-lg-block" href="./index.html">
                        <img src="./img/Logo circle.png" alt="Becca's Cakes and Bakes">
                    </a>

                    <!-- Right links -->
                    <ul class="navbar-nav ms-auto">
                        ${RIGHT_LINKS.map(navLinkHTML).join('')}
                    </ul>

                </div>
            </div>
        </nav>`;
    }

    /* ── Footer HTML ──────────────────────────────────────────────────────── */
    function buildFooter() {
        const socialButtons = SOCIAL_LINKS.map(s => `
            <a class="btn text-white btn-floating m-1 ${s.cssClass}"
               href="${s.href}"
               role="button"
               aria-label="${s.label}">
                <i class="${s.icon}"></i>
            </a>`).join('');

        const footerLinks = NAV_LINKS.map(l => `
            <p><a href="${l.href}" class="text-reset">${l.label}</a></p>`).join('');

        return `
        <footer class="bg-body-tertiary text-center">
            <div class="container p-4 pb-0">

                <!-- Social icons -->
                <section class="mb-4">
                    ${socialButtons}
                </section>

                <!-- Page links -->
                <section>
                    <div class="container text-center">
                        <div class="row mt-3">
                            <div>
                                <h6 class="text-uppercase fw-bold mb-4">Pages</h6>
                                ${footerLinks}
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            <!-- Copyright bar -->
            <div class="text-center p-3 footer-copyright">
                © 2026 Copyright:
                <a class="text-body" href="https://beccascakesandbakes.co.uk/">beccascakesandbakes.co.uk</a>
            </div>
        </footer>`;
    }

    /* ── Inject on DOM ready ──────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
        const navSlot    = document.getElementById('site-nav');
        const footerSlot = document.getElementById('site-footer');

        if (navSlot)    navSlot.innerHTML    = buildNavbar();
        if (footerSlot) footerSlot.innerHTML = buildFooter();
    });

})();