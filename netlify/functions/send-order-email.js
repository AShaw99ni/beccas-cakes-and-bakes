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

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NOTIFY_EMAIL_USER,
            pass: process.env.NOTIFY_EMAIL_PASS,
        },
    });

    // ── Shared colours ──────────────────────────────────────────────────────
    const pink = '#AB1D79';
    const pinkDark = '#7c1457';
    const cream = '#FFEAFE';
    const deep = '#2a1a2e';
    const muted = '#5a3a6e';
    const pinkLight = '#e2c4f9';

    // ── HTML helpers ────────────────────────────────────────────────────────
    function row(label, value) {
        if (!value) return '';
        return `
            <tr>
                <td style="padding:8px 0;vertical-align:top;width:160px;
                    font-family:Arial,sans-serif;font-size:13px;font-weight:700;
                    color:${muted};text-transform:uppercase;letter-spacing:0.06em;">
                    ${label}
                </td>
                <td style="padding:8px 0;vertical-align:top;
                    font-family:Arial,sans-serif;font-size:15px;color:${deep};">
                    ${value}
                </td>
            </tr>`;
    }

    function section(title, content) {
        return `
            <div style="margin:24px 0 0;">
                <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                    letter-spacing:0.14em;text-transform:uppercase;color:${pink};
                    margin-bottom:12px;">
                    ${title}
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="border-top:1px solid ${pinkLight};">
                    <tbody>${content}</tbody>
                </table>
            </div>`;
    }

    function emailWrapper(preheader, bodyContent) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Becca's Cakes and Bakes</title>
</head>
<body style="margin:0;padding:0;background-color:#f7edf7;">
<div style="display:none;max-height:0;overflow:hidden;color:#f7edf7;">${preheader}</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#f7edf7;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

    <!-- Header -->
    <tr>
        <td align="center"
            style="background:linear-gradient(135deg,${pink} 0%,${pinkDark} 100%);
                border-radius:16px 16px 0 0;padding:36px 32px 28px;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;
                font-weight:700;color:#ffffff;letter-spacing:0.02em;margin-bottom:4px;">
                Becca's Cakes and Bakes
            </div>
            <div style="font-family:Arial,sans-serif;font-size:12px;
                color:rgba(255,255,255,0.75);letter-spacing:0.14em;text-transform:uppercase;">
                Gluten &amp; dairy free &middot; Made in Northern Ireland
            </div>
        </td>
    </tr>

    <!-- Body -->
    <tr>
        <td style="background:#ffffff;padding:36px 36px 28px;
            border-radius:0 0 16px 16px;
            box-shadow:0 4px 24px rgba(171,29,121,0.08);">
            ${bodyContent}
        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td align="center" style="padding:20px 0 8px;">
            <p style="font-family:Arial,sans-serif;font-size:12px;color:${muted};margin:0 0 6px;">
                &copy; 2026 Becca's Cakes and Bakes &middot; Northern Ireland
            </p>
            <p style="font-family:Arial,sans-serif;font-size:12px;color:${muted};margin:0;">
                <a href="https://beccascakesandbakes.co.uk"
                    style="color:${pink};text-decoration:none;">beccascakesandbakes.co.uk</a>
            </p>
        </td>
    </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
    }

    // ── Build order items table ─────────────────────────────────────────────
    const orderRowsHtml = lineItems.data.map(function (item) {
        const itemTotal = '£' + (item.amount_total / 100).toFixed(2);
        return `
            <tr>
                <td style="padding:10px 0;font-family:Arial,sans-serif;font-size:15px;
                    color:${deep};border-bottom:1px solid ${pinkLight};">
                    ${item.description}
                </td>
                <td style="padding:10px 0;font-family:Arial,sans-serif;font-size:15px;
                    color:${muted};text-align:center;border-bottom:1px solid ${pinkLight};">
                    &times; ${item.quantity}
                </td>
                <td style="padding:10px 0;font-family:Arial,sans-serif;font-size:15px;
                    color:${deep};font-weight:700;text-align:right;
                    border-bottom:1px solid ${pinkLight};">
                    ${itemTotal}
                </td>
            </tr>`;
    }).join('');

    const orderTableHtml = `
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="border-top:1px solid ${pinkLight};margin-top:12px;">
            <thead>
                <tr>
                    <th style="padding:8px 0;font-family:Arial,sans-serif;font-size:11px;
                        font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
                        color:${muted};text-align:left;">Item</th>
                    <th style="padding:8px 0;font-family:Arial,sans-serif;font-size:11px;
                        font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
                        color:${muted};text-align:center;">Qty</th>
                    <th style="padding:8px 0;font-family:Arial,sans-serif;font-size:11px;
                        font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
                        color:${muted};text-align:right;">Price</th>
                </tr>
            </thead>
            <tbody>${orderRowsHtml}</tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding:12px 0 0;font-family:Arial,sans-serif;
                        font-size:15px;font-weight:700;color:${deep};">Total paid</td>
                    <td style="padding:12px 0 0;font-family:Arial,sans-serif;font-size:18px;
                        font-weight:700;color:${pink};text-align:right;">${amountPaid}</td>
                </tr>
            </tfoot>
        </table>`;

    // ── Plain text fallback ─────────────────────────────────────────────────
    const orderLines = lineItems.data.map(item =>
        '  • ' + item.quantity + ' × ' + item.description + ' — £' + (item.amount_total / 100).toFixed(2)
    ).join('\n');

    // ── Becca's notification email ──────────────────────────────────────────
    const beccaBody = `
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;
            color:${deep};margin:0 0 6px;">New order received! 🎂</h1>
        <p style="font-family:Arial,sans-serif;font-size:15px;color:${muted};
            margin:0 0 24px;line-height:1.6;">
            A new order has been placed and payment confirmed via Stripe.
        </p>
        ${section('Customer details',
        row('Name', customerName) +
        row('Email', `<a href="mailto:${customerEmail}" style="color:${pink};text-decoration:none;">${customerEmail}</a>`) +
        row('Collection', collectionDate + ', 12pm–6pm')
    )}
        <div style="margin:24px 0 0;">
            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                letter-spacing:0.14em;text-transform:uppercase;color:${pink};margin-bottom:12px;">
                Order summary
            </div>
            ${orderTableHtml}
        </div>
        <div style="margin-top:28px;padding-top:20px;border-top:1px solid ${pinkLight};
            display:flex;gap:12px;">
            <a href="mailto:${customerEmail}?subject=Your order from Becca's Cakes and Bakes"
                style="display:inline-block;background:${pink};color:#ffffff;
                font-family:Arial,sans-serif;font-size:14px;font-weight:700;
                text-decoration:none;padding:12px 24px;border-radius:50px;margin-right:10px;">
                Email ${customerName.split(' ')[0]}
            </a>
            <a href="https://dashboard.stripe.com/payments"
                style="display:inline-block;background:white;color:${pink};
                font-family:Arial,sans-serif;font-size:14px;font-weight:700;
                text-decoration:none;padding:12px 24px;border-radius:50px;
                border:2px solid ${pinkLight};">
                View in Stripe
            </a>
        </div>`;

    // ── Customer confirmation email ──────────────────────────────────────────
    const firstName = customerName.split(' ')[0];
    const customerBody = `
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;
            color:${deep};margin:0 0 6px;">Your order is confirmed! 🎂</h1>
        <p style="font-family:Arial,sans-serif;font-size:15px;color:${muted};
            margin:0 0 24px;line-height:1.6;">
            Hi ${firstName}, thank you for your order! Payment has been received and
            Becca is already looking forward to baking for you.
        </p>
        <div style="margin:0 0 24px;padding:18px 20px;
            background:linear-gradient(135deg,${cream} 0%,#f9d4ec 100%);
            border-radius:12px;border-left:4px solid ${pink};">
            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                letter-spacing:0.12em;text-transform:uppercase;color:${pink};margin-bottom:8px;">
                Collection details
            </div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;
                color:${deep};font-weight:700;">
                ${collectionDate}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:14px;color:${muted};margin-top:4px;">
                12pm – 6pm &middot; Belfast BT5
            </div>
        </div>
        <div style="margin:0 0 0;">
            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                letter-spacing:0.14em;text-transform:uppercase;color:${pink};margin-bottom:12px;">
                Your order
            </div>
            ${orderTableHtml}
        </div>
        <div style="margin-top:28px;padding:20px 24px;background:${cream};
            border-radius:12px;text-align:center;">
            <p style="font-family:Arial,sans-serif;font-size:14px;color:${muted};
                margin:0 0 14px;line-height:1.6;">
                Questions? Just reply to this email and Becca will get back to you.
            </p>
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;
                color:${deep};margin:0;font-style:italic;">
                "Baking without barriers"
            </p>
        </div>`;

    try {
        await transporter.sendMail({
            from: `"Becca's Cakes and Bakes" <${process.env.NOTIFY_EMAIL_USER}>`,
            to: process.env.NOTIFY_EMAIL_USER,
            subject: `New Order from ${customerName} — ${amountPaid}`,
            text: [
                'You have a new order!', '',
                'Customer: ' + customerName,
                'Email: ' + customerEmail,
                'Collection date: ' + collectionDate, '',
                'Order:', orderLines, '',
                'Total paid: ' + amountPaid, '',
                'View in Stripe: https://dashboard.stripe.com/payments',
            ].join('\n'),
            html: emailWrapper(`New order from ${customerName} — ${amountPaid}`, beccaBody),
        });

        await transporter.sendMail({
            from: `"Becca's Cakes and Bakes" <${process.env.NOTIFY_EMAIL_USER}>`,
            to: customerEmail,
            subject: `Your order is confirmed! 🎂`,
            text: [
                'Hi ' + firstName + ',', '',
                'Thank you for your order! Here\'s a summary:', '',
                orderLines, '',
                'Total: ' + amountPaid,
                'Collection: ' + collectionDate + ', 12pm–6pm', '',
                'If you have any questions just reply to this email.', '',
                'Becca x',
            ].join('\n'),
            html: emailWrapper(`Order confirmed — ${amountPaid}`, customerBody),
        });

        return { statusCode: 200, body: 'OK' };
    } catch (err) {
        console.error('Mail error:', err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};