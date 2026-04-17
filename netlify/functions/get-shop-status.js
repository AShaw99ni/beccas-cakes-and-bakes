const { getStore } = require('@netlify/blobs');

const PRODUCTS_CSV_URL = process.env.PRODUCTS_CSV_URL;

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

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = parseCSVRow(lines[0]).map(h => h.trim());
    return lines.slice(1).map(line => {
        const vals = parseCSVRow(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
        return obj;
    }).filter(r => Object.values(r).some(v => v));
}

/* ── Timezone helper ──────────────────────────────────────────────────────── */
// Parses "2026-04-19T12:00:00" as Europe/London local time and returns a UTC Date.
// Works correctly for both GMT (winter) and BST (summer, UTC+1).
function parseUkLocal(isoLocal) {
    const m = isoLocal.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
    if (!m) throw new Error('Invalid datetime format: ' + isoLocal);
    const [, yr, mo, dy, hr, mn, sc] = m.map(Number);

    // Treat the value as UTC first to get an approximate Date
    const approxUtc = new Date(Date.UTC(yr, mo - 1, dy, hr, mn, sc));

    // Find the Europe/London UTC offset at that approximate time
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        timeZoneName: 'shortOffset',
    }).formatToParts(approxUtc);
    const tzName = (parts.find(p => p.type === 'timeZoneName') || {}).value || 'GMT';
    const match = tzName.match(/GMT([+-]\d+)?/);
    const offsetHours = match && match[1] ? parseInt(match[1], 10) : 0;

    // UK local = UTC + offsetHours  →  UTC = UK local − offsetHours
    return new Date(approxUtc.getTime() - offsetHours * 3600000);
}

/* ── Sheet fetchers ───────────────────────────────────────────────────────── */
async function fetchConfig() {
    const configUrl = process.env.CONFIG_CSV_URL;
    if (!configUrl) throw new Error('CONFIG_CSV_URL env var is not set');
    const res = await fetch(configUrl);
    if (!res.ok) throw new Error('Failed to fetch order-window config sheet');
    const rows = parseCSV(await res.text());
    if (!rows.length) throw new Error('order-window config sheet is empty');
    return rows[0]; // { open_from: '...', closing_at: '...' }
}

async function fetchMaxQtyMap() {
    const res = await fetch(PRODUCTS_CSV_URL);
    if (!res.ok) throw new Error('Failed to fetch products sheet');
    const rows = parseCSV(await res.text());
    const map = {};
    rows.forEach(row => {
        if (!row.name) return;
        const raw = (row.max_qty || '').trim();
        map[row.name] = raw === '' ? null : parseInt(raw, 10);
    });
    return map;
}

/* ── Handler ──────────────────────────────────────────────────────────────── */
exports.handler = async function (event) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const store = getStore({ name: 'shop', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_TOKEN });

        // 1. Fetch config from the order-window sheet tab
        const config = await fetchConfig();
        const openFrom = config.open_from;
        const closingAt = config.closing_at;

        if (!openFrom || !closingAt) {
            throw new Error('order-window sheet is missing open_from or closing_at values');
        }

        // 2. Auto-reset: if open_from has changed since last time, wipe sold counts.
        //    On the very first run last_open_from is null, which also triggers the reset.
        const lastOpenFrom = await store.get('last_open_from');
        if (lastOpenFrom !== openFrom) {
            await store.set('sold_counts', JSON.stringify({}));
            await store.set('last_open_from', openFrom);
        }

        // 3. Determine whether the order window is currently open
        const now = Date.now();
        const openMs = parseUkLocal(openFrom).getTime();
        const closeMs = parseUkLocal(closingAt).getTime();
        const windowOpen = now >= openMs && now <= closeMs;

        // 4. Read sold counts (after the potential reset above)
        const soldCountsRaw = await store.get('sold_counts');
        const soldCounts = soldCountsRaw ? JSON.parse(soldCountsRaw) : {};

        // 5. Fetch max_qty per product from the products sheet
        const maxQtyMap = await fetchMaxQtyMap();

        // 6. Build per-product status
        const products = {};
        for (const [name, maxQty] of Object.entries(maxQtyMap)) {
            const soldQty = soldCounts[name] || 0;
            products[name] = {
                maxQty,
                soldQty,
                remaining: maxQty === null ? null : Math.max(0, maxQty - soldQty),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',
            },
            body: JSON.stringify({ windowOpen, openFrom, closingAt, products }),
        };
    } catch (err) {
        console.error('get-shop-status error:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Could not fetch shop status' }),
        };
    }
};
