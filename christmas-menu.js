/* =============================================================================
   christmas-menu.js — Becca's Cakes and Bakes
   Single source of truth for the Christmas preorder menu.
   Used by contact.html (order form) AND netlify/functions/send-contact.js
   (server re-prices every order from this file, so prices can't be tampered with).
   Update prices, items, photos or dates here only.
   ============================================================================= */

var CUPCAKE_FLAVOURS = [
    { id: 'vanilla', label: 'Vanilla' },
    { id: 'chocolate', label: 'Chocolate' },
];
var CUPCAKE_MIX = { id: 'mix', label: 'Vanilla & chocolate mix' };

// Treats customers choose from to fill pick & mix boxes (and the 4 treats in the Bundle).
// Any combination is allowed — the only rule is a box holds exactly its number of treats.
var PICK_MIX_TREATS = [
    { id: 'choc-orange-brownie', name: 'Chocolate Orange Brownies', image: 'img/christmas/treats/choc-orange-brownies.jpg' },
    { id: 'old-school-cake', name: 'Old School Cake', image: 'img/christmas/treats/old-school-cake.jpg' },
    { id: 'christmas-cookie', name: 'Christmas Cookies', image: 'img/christmas/treats/christmas-cookies.jpg' },
    { id: 'cinnamon-blondie', name: 'Cinnamon Roll Blondies', image: 'img/christmas/treats/cinnamon-roll-blondies.jpg' },
    { id: 'candy-cane-krispie', name: 'Candy Cane Rice Krispie Bars', note: 'White chocolate', image: 'img/christmas/treats/candy-cane-krispie-bars.jpg' },
    { id: 'brookie', name: 'Brookies', image: 'img/christmas/treats/brookies.jpg' },
];

var CHRISTMAS_MENU = {
    // Preorders close at midnight on 20th December (UK time = UTC in winter)
    CLOSES_AT: '2026-12-21T00:00:00Z',
    CLOSES_LABEL: 'midnight on 20th December',

    COLLECTION_LOCATION: 'Comber',

    // id is what the form sends; the server looks the slot up here
    COLLECTION_SLOTS: [
        { id: '23-dec', day: 'Wednesday 23rd December', short: '23rd Dec', hours: '9am – 9pm' },
        { id: '24-dec', day: 'Thursday 24th December', short: '24th Dec', hours: '9am – 5pm' },
    ],

    // Max of any single option per order — anything bigger, Becca can arrange by message
    MAX_QTY: 20,

    PICK_MIX_TREATS: PICK_MIX_TREATS,

    PRODUCTS: [
        {
            name: 'Becca\'s Christmas Bundle',
            desc: '4 pick & mix treats, 4 festive cake bites, a branded tote bag, bookmark and an exclusive GF/DF recipe card.',
            image: 'img/christmas/bundle.jpg',
            // Star item: shown first, highlighted, with a badge
            featured: true,
            badge: 'Star item',
            // picks = how many pick & mix treats the customer chooses per bundle
            options: [
                { id: 'bundle', label: 'Bundle', price: 35, picks: 4 },
            ],
        },
        {
            name: 'Christmas Pick & Mix Treat Box',
            desc: 'Choose your own festive favourites to fill the box.',
            image: 'img/christmas/pick-mix.jpg',
            // picks = how many treats the customer chooses for each box
            options: [
                { id: 'pickmix-4', label: 'Box of 4', price: 13, picks: 4 },
                { id: 'pickmix-6', label: 'Box of 6', price: 19, picks: 6 },
                { id: 'pickmix-8', label: 'Box of 8', price: 25, picks: 8 },
            ],
        },
        {
            name: 'Christmas Cupcake Box',
            desc: 'Festive decorated cupcakes — one flavour per box, or mix vanilla & chocolate in a box of 12.',
            image: 'img/christmas/cupcakes.jpg',
            // Each box is one flavour; only the box of 12 can be a mix
            options: [
                { id: 'cupcake-4', label: 'Box of 4', price: 14, flavours: CUPCAKE_FLAVOURS },
                { id: 'cupcake-6', label: 'Box of 6', price: 20, flavours: CUPCAKE_FLAVOURS },
                { id: 'cupcake-12', label: 'Box of 12', price: 38, flavours: CUPCAKE_FLAVOURS.concat([CUPCAKE_MIX]) },
            ],
        },
        {
            name: 'Traditional Christmas Fruit Cake',
            desc: 'A rich, generously fruit-filled Christmas cake, finished with white fondant.',
            image: 'img/christmas/fruit-cake.jpg',
            options: [
                { id: 'fruitcake', label: 'Whole cake', price: 25 },
            ],
        },
    ],

    // Custom Christmas cake — priced on request, same deadline + collection as the menu
    CUSTOM_CAKE: {
        name: 'Custom Christmas Cake',
        desc: 'A one-off Christmas cake designed just for you — the perfect festive centrepiece. Priced on request.',
        flavours: ['Vanilla', 'Chocolate', 'Vanilla & Jam', 'Vanilla & Chocolate'], // + "Other" (free text)
        MAX_SERVINGS: 200,
    },

    // Id of one orderable unit: an option, or an option in a given flavour (e.g. "cupcake-4:vanilla")
    unitId: function (option, flavour) {
        return flavour ? option.id + ':' + flavour.id : option.id;
    },

    // Every orderable unit as a flat list: { id, product, label, price }.
    // Used by the form AND the server so both price orders identically.
    listOrderOptions: function () {
        var menu = this;
        var units = [];
        menu.PRODUCTS.forEach(function (p) {
            p.options.forEach(function (o) {
                (o.flavours || [null]).forEach(function (f) {
                    units.push({
                        id: menu.unitId(o, f),
                        product: p.name,
                        label: f ? o.label + ', ' + f.label : o.label,
                        price: o.price,
                        picks: o.picks || 0, // > 0 = customer fills each box with this many treats
                    });
                });
            });
        });
        return units;
    },
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CHRISTMAS_MENU;
}
