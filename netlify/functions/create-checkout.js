const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getStore } = require('@netlify/blobs');

const SHEET_CSV_URL = process.env.PRODUCTS_CSV_URL;

/* ── CSV helpers ──────────────────────────────────────────────────────────── */
function parseCSVRow(line) {
    const result = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
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

/* ── Timezone helper ──────────────────────────────────────────────────────── */
function parseUkLocal(isoLocal) {
    const m = isoLocal.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
    if (!m) throw new Error('Invalid datetime format: ' + isoLocal);
    const [, yr, mo, dy, hr, mn, sc] = m.map(Number);
    const approxUtc = new Date(Date.UTC(yr, mo - 1, dy, hr, mn, sc));
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        timeZoneName: 'shortOffset',
    }).formatToParts(approxUtc);
    const tzName = (parts.find(p => p.type === 'timeZoneName') || {}).value || 'GMT';
    const match = tzName.match(/GMT([+-]\d+)?/);
    const offsetHours = match && match[1] ? parseInt(match[1], 10) : 0;
    return new Date(approxUtc.getTime() - offsetHours * 3600000);
}

/* ── Sheet fetcher — prices + max_qty in one request ─────────────────────── */
async function fetchProductData() {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) throw new Error('Failed to fetch product sheet');

    const text = await res.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('Empty product sheet');

    const headers = parseCSVRow(lines[0]).map(h => h.trim());
    const nameIdx = headers.indexOf('name');
    const priceIdx = headers.indexOf('price');
    const maxQtyIdx = headers.indexOf('max_qty');

    if (nameIdx === -1 || priceIdx === -1) {
        throw new Error('CSV is missing a "name" or "price" column');
    }

    const priceMap = {};
    const maxQtyMap = {};
    for (let i = 1; i < lines.length; i++) {
        const vals = parseCSVRow(lines[i]);
        const name = (vals[nameIdx] || '').trim();
        const price = parseFloat((vals[priceIdx] || '').trim());
        if (name && !isNaN(price)) {
            priceMap[name] = Math.round(price * 100);
        }
        if (name && maxQtyIdx !== -1) {
            const raw = (vals[maxQtyIdx] || '').trim();
            maxQtyMap[name] = raw === '' ? null : parseInt(raw, 10);
        }
    }
    return { priceMap, maxQtyMap };
}

/* ── Config fetcher ───────────────────────────────────────────────────────── */
async function fetchConfig() {
    const configUrl = process.env.CONFIG_CSV_URL;
    if (!configUrl) throw new Error('CONFIG_CSV_URL env var is not set');
    const res = await fetch(configUrl);
    if (!res.ok) throw new Error('Failed to fetch order-window config sheet');
    const text = await res.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('order-window config sheet is empty');
    const headers = parseCSVRow(lines[0]).map(h => h.trim());
    const vals = parseCSVRow(lines[1]);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
    return obj;
}

/* ── Handler ──────────────────────────────────────────────────────────────── */
exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { name, email, collectionDate, items } = payload;

    if (!name || !email || !collectionDate || !items || !items.length) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // ── Server-side order window check ────────────────────────────────────────
    let config;
    try {
        config = await fetchConfig();
    } catch (err) {
        console.error('Config fetch error:', err);
        return { statusCode: 503, body: JSON.stringify({ error: 'Could not verify order window. Please try again.' }) };
    }

    const now = Date.now();
    const openMs = parseUkLocal(config.open_from).getTime();
    const closeMs = parseUkLocal(config.closing_at).getTime();
    const windowOpen = now >= openMs && now <= closeMs;

    if (!windowOpen) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Orders are not currently open.' }) };
    }

    // ── Fetch authoritative prices + max_qty server-side ─────────────────────
    let priceMap, maxQtyMap;
    try {
        ({ priceMap, maxQtyMap } = await fetchProductData());
    } catch (err) {
        console.error('Product data fetch error:', err);
        return { statusCode: 503, body: JSON.stringify({ error: 'Could not verify product prices. Please try again.' }) };
    }

    // ── Per-product capacity check ────────────────────────────────────────────
    let soldCounts = {};
    try {
        const store = getStore({ name: 'shop', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_TOKEN });
        const raw = await store.get('sold_counts');
        soldCounts = raw ? JSON.parse(raw) : {};
    } catch (err) {
        console.error('Blobs read error:', err);
        // Non-fatal — if Blobs is unavailable we skip the capacity check rather than
        // blocking all orders. The webhook will still enforce limits post-payment.
    }

    // Resolve each cart item against server price and check capacity
    const resolvedItems = [];
    for (const item of items) {
        const serverPrice = priceMap[item.name];
        if (serverPrice === undefined) {
            return { statusCode: 400, body: JSON.stringify({ error: `"${item.name}" is not a recognised product.` }) };
        }

        const maxQty = maxQtyMap[item.name];
        if (maxQty !== null && maxQty !== undefined) {
            const currentSold = soldCounts[item.name] || 0;
            if (currentSold + item.quantity > maxQty) {
                return { statusCode: 400, body: JSON.stringify({ error: `Sorry, "${item.name}" has sold out.` }) };
            }
        }

        resolvedItems.push({ name: item.name, quantity: item.quantity, price: serverPrice });
    }

    // ── Create Stripe session ─────────────────────────────────────────────────
    const formattedDate = new Date(collectionDate).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email,
            line_items: resolvedItems.map(item => ({
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: item.name,
                        description: 'Collection: ' + formattedDate,
                    },
                    unit_amount: item.price,
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: process.env.URL + '/order-success.html?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: process.env.URL + '/order-cancel.html',
            metadata: {
                customerName: name,
                collectionDate: formattedDate,
            },
            payment_intent_data: {
                metadata: {
                    customerName: name,
                    collectionDate: formattedDate,
                },
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: session.url }),
        };
    } catch (err) {
        console.error('Stripe error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
