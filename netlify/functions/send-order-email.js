const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

exports.handler = async function (event) {
    const sig = event.headers['stripe-signature'];
    let stripeEvent;

    try {
        stripeEvent = stripe.webhooks.constructEvent(
            event.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature failed:', err.message);
        return { statusCode: 400, body: 'Webhook error: ' + err.message };
    }

    if (stripeEvent.type !== 'checkout.session.completed') {
        return { statusCode: 200, body: 'Ignored' };
    }

    const session = stripeEvent.data.object;
    const customerName = session.metadata.customerName || 'Customer';
    const customerEmail = session.customer_email || 'Not provided';
    const collectionDate = session.metadata.collectionDate || 'Not specified';
    const amountPaid = '£' + (session.amount_total / 100).toFixed(2);

    // Fetch line items from Stripe for the email
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const itemsList = lineItems.data.map(item =>
        item.description
            ? item.quantity + ' × ' + item.quantity_description
            : item.quantity + ' × ' + item.price.product_data?.name || item.description
    );

    const orderLines = lineItems.data.map(item =>
        '  • ' + item.quantity + ' × ' + item.description + ' — £' + (item.amount_total / 100).toFixed(2)
    ).join('\n');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NOTIFY_EMAIL_USER,
            pass: process.env.NOTIFY_EMAIL_PASS,
        },
    });

    // Email to Becca
    await transporter.sendMail({
        from: '"Becca\'s Cakes and Bakes" <' + process.env.NOTIFY_EMAIL_USER + '>',
        to: process.env.NOTIFY_EMAIL_USER,
        subject: '🎂 New Order from ' + customerName,
        text: [
            'You have a new order!',
            '',
            'Customer: ' + customerName,
            'Email: ' + customerEmail,
            'Collection date: ' + collectionDate,
            '',
            'Order:',
            orderLines,
            '',
            'Total paid: ' + amountPaid,
            '',
            'View in Stripe: https://dashboard.stripe.com/payments',
        ].join('\n'),
    });

    // Confirmation email to customer
    await transporter.sendMail({
        from: '"Becca\'s Cakes and Bakes" <' + process.env.NOTIFY_EMAIL_USER + '>',
        to: customerEmail,
        subject: 'Your order is confirmed! 🎂',
        text: [
            'Hi ' + customerName + ',',
            '',
            'Thank you for your order! Here\'s a summary:',
            '',
            orderLines,
            '',
            'Total: ' + amountPaid,
            'Collection: ' + collectionDate + ', 12pm–6pm',
            '',
            'If you have any questions just reply to this email.',
            '',
            'Becca x',
        ].join('\n'),
    });

    return { statusCode: 200, body: 'OK' };
};