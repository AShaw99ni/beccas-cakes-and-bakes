const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcb8IWT6CYXEtl_EGSEyD0ww0bEaQgQvONoDZai5DF-3_Svt83stdQR2Esb89jd5OgJKTCGYDlguBa/pub?gid=1774292445&single=true&output=csv';

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

async function fetchPriceMap() {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) throw new Error('Failed to fetch product sheet');

    const text = await res.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('Empty product sheet');

    const headers = parseCSVRow(lines[0]).map(h => h.trim());
    const nameIdx = headers.indexOf('name');
    const priceIdx = headers.indexOf('price');

    if (nameIdx === -1 || priceIdx === -1) {
        throw new Error('CSV is missing a "name" or "price" column');
    }

    const priceMap = {};
    for (let i = 1; i < lines.length; i++) {
        const vals = parseCSVRow(lines[i]);
        const name = (vals[nameIdx] || '').trim();
        const price = parseFloat((vals[priceIdx] || '').trim());
        if (name && !isNaN(price)) {
            priceMap[name] = Math.round(price * 100); // store as pence
        }
    }
    return priceMap;
}

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, body: 'Invalid JSON' };
    }

    const { name, email, collectionDate, items } = payload;

    if (!name || !email || !collectionDate || !items || !items.length) {
        return { statusCode: 400, body: 'Missing required fields' };
    }

    // Fetch authoritative prices server-side — never trust the client
    let priceMap;
    try {
        priceMap = await fetchPriceMap();
    } catch (err) {
        console.error('Price fetch error:', err);
        return { statusCode: 503, body: 'Could not verify product prices. Please try again.' };
    }

    // Resolve each cart item against the server price
    const resolvedItems = [];
    for (const item of items) {
        const serverPrice = priceMap[item.name];
        if (serverPrice === undefined) {
            console.warn(`Unknown product at checkout: "${item.name}"`);
            return { statusCode: 400, body: `Product "${item.name}" is not available.` };
        }
        resolvedItems.push({ name: item.name, quantity: item.quantity, price: serverPrice });
    }

    const formattedDate = new Date(collectionDate).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
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
                }
            }
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
