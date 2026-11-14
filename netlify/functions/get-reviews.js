const { getStore } = require('@netlify/blobs');

// Public endpoint for the homepage. Returns the reviews cached daily by
// fetch-google-reviews. 404 if nothing is cached yet — the page then keeps
// its built-in fallback reviews.

exports.handler = async function (event) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const store = getStore({ name: 'reviews', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_TOKEN });
        const cached = await store.get('latest');

        if (!cached) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
                body: JSON.stringify({ reviews: [] }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                // Data only changes once a day — cache at Netlify's edge for an hour
                'Netlify-CDN-Cache-Control': 'public, s-maxage=3600',
                'Cache-Control': 'public, max-age=300',
            },
            body: cached,
        };
    } catch (err) {
        console.error('get-reviews error:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
            body: JSON.stringify({ error: 'Could not fetch reviews' }),
        };
    }
};
