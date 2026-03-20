const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: 'Invalid JSON' };
    }

    const { name, email, collectionDate, items } = payload;

    if (!name || !email || !collectionDate || !items || !items.length) {
        return { statusCode: 400, body: 'Missing required fields' };
    }

    // Format date nicely for display e.g. "Tuesday 10 June 2025"
    const formattedDate = new Date(collectionDate).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email,
            line_items: items.map(item => ({
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: item.name,
                        description: 'Collection: ' + formattedDate,
                    },
                    unit_amount: item.price, // already in pence from frontend
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