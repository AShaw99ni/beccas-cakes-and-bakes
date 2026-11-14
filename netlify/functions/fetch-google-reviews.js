const { getStore } = require('@netlify/blobs');

// Scheduled daily via netlify.toml. Fetches Becca's Google reviews from
// Places API (New) and caches them in the 'reviews' blob store under 'latest'.
// On any failure the existing cache is left untouched.

const MIN_STARS = 4;

/* ── Google fetch ─────────────────────────────────────────────────────────── */
async function fetchPlace() {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;
    if (!apiKey || !placeId) throw new Error('GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID env var is not set');

    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`, {
        headers: {
            'X-Goog-Api-Key': apiKey,
            // Field mask sets the billing SKU — keep it to exactly these fields
            'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
        },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = body.error ? `${body.error.status}: ${body.error.message}` : `HTTP ${res.status}`;
        throw new Error('Places API error — ' + msg);
    }
    return body;
}

function toReview(r) {
    const author = r.authorAttribution || {};
    const text = (r.text && r.text.text) || (r.originalText && r.originalText.text) || '';
    return {
        name: (author.displayName || '').trim(),
        profileUrl: author.uri || '',
        photoUrl: author.photoUri || '',
        rating: r.rating,
        text: text.trim(),
        when: r.relativePublishTimeDescription || '',
    };
}

/* ── Handler ──────────────────────────────────────────────────────────────── */
exports.handler = async function () {
    try {
        const place = await fetchPlace();

        const reviews = (place.reviews || [])
            .map(toReview)
            .filter(r => r.name && r.text && r.rating >= MIN_STARS);

        // Never overwrite good cached data with an empty or malformed result
        if (!reviews.length) {
            throw new Error('Places API returned no usable reviews — keeping existing cache');
        }

        const data = {
            fetchedAt: new Date().toISOString(),
            overallRating: place.rating,
            totalReviews: place.userRatingCount,
            reviews,
        };

        const store = getStore({ name: 'reviews', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_TOKEN });
        await store.set('latest', JSON.stringify(data));

        console.log(`fetch-google-reviews: cached ${reviews.length} reviews (rating ${data.overallRating}, ${data.totalReviews} total)`);
        return { statusCode: 200 };
    } catch (err) {
        console.error('fetch-google-reviews error:', err);
        return { statusCode: 500 };
    }
};
