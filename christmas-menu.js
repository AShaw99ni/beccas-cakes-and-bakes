/* =============================================================================
   christmas-menu.js — Becca's Cakes and Bakes
   Single source of truth for the Christmas preorder menu.
   Used by contact.html (order form) AND netlify/functions/send-contact.js
   (server re-prices every order from this file, so prices can't be tampered with).
   Update prices, items or dates here only.
   ============================================================================= */

var CHRISTMAS_MENU = {
    // Preorders close at midnight on 20th December (UK time = UTC in winter)
    CLOSES_AT: '2026-12-21T00:00:00Z',

    COLLECTION_LOCATION: 'Comber',

    COLLECTION_DAYS: [
        'Wednesday 23rd December',
        'Thursday 24th December',
    ],

    // Max of any single option per order — anything bigger, Becca can arrange by message
    MAX_QTY: 20,

    PRODUCTS: [
        {
            name: 'Christmas Pick & Mix Treat Box',
            desc: 'A festive mix of Becca\'s treats.',
            options: [
                { id: 'pickmix-4', label: 'Box of 4', price: 13 },
                { id: 'pickmix-6', label: 'Box of 6', price: 19 },
                { id: 'pickmix-8', label: 'Box of 8', price: 25 },
            ],
        },
        {
            name: 'Christmas Cupcake Box',
            desc: 'Festive decorated cupcakes.',
            options: [
                { id: 'cupcake-4', label: 'Box of 4', price: 14 },
                { id: 'cupcake-6', label: 'Box of 6', price: 20 },
                { id: 'cupcake-12', label: 'Box of 12', price: 38 },
            ],
        },
        {
            name: 'Traditional Christmas Fruit Cake',
            desc: 'A rich, generously fruit-filled Christmas cake, finished with white fondant.',
            options: [
                { id: 'fruitcake', label: 'Whole cake', price: 25 },
            ],
        },
        {
            name: 'Becca\'s Christmas Bundle',
            desc: '4 pick & mix treats, 4 festive cake bites, a branded tote bag, bookmark and an exclusive GF/DF recipe card.',
            options: [
                { id: 'bundle', label: 'Bundle', price: 35 },
            ],
        },
    ],
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CHRISTMAS_MENU;
}
