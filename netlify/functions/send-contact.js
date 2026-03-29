const nodemailer = require('nodemailer');

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

    const { fname, lname, email, phone, topic, topicLabel, occasion, eventDate,
        servings, flavours, cakeDesc, traybakes, traybakeDate, traybakeQty,
        message, images } = payload;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NOTIFY_EMAIL_USER,
            pass: process.env.NOTIFY_EMAIL_PASS,
        },
    });

    // Build email body
    const lines = [
        `ENQUIRY TYPE: ${topicLabel}`,
        '',
        `Name:  ${fname} ${lname}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
    ];

    if (topic === 'custom') {
        lines.push('',
            `Occasion: ${occasion || '—'}`,
            `Date:     ${eventDate || '—'}`,
            `Servings: ${servings}`,
            `Flavours: ${flavours || '—'}`,
            '',
            `Design ideas:`,
            cakeDesc || '—'
        );
    }

    if (topic === 'traybake') {
        lines.push('',
            `Items:    ${traybakes || '—'}`,
            `Quantity: ${traybakeQty || '—'}`,
            `Date:     ${traybakeDate || '—'}`
        );
    }

    if (message) {
        lines.push('', `Message:`, message);
    }

    // Build attachments from base64 images
    const attachments = (images || []).map(function (img, i) {
        const matches = img.data.match(/^data:image\/(jpeg|png);base64,(.+)$/);
        if (!matches) return null;
        return {
            filename: `inspiration-${i + 1}.${matches[1] === 'jpeg' ? 'jpg' : 'png'}`,
            content: matches[2],
            encoding: 'base64',
        };
    }).filter(Boolean);

    try {
        // Email to Becca
        await transporter.sendMail({
            from: `"Becca's Cakes and Bakes" <${process.env.NOTIFY_EMAIL_USER}>`,
            to: "aaronshawni0@gmail.com",
            subject: `New Enquiry — ${topicLabel} from ${fname} ${lname}`,
            text: lines.join('\n'),
            attachments,
        });

        // Confirmation email to customer
        await transporter.sendMail({
            from: `"Becca's Cakes and Bakes" <${process.env.NOTIFY_EMAIL_USER}>`,
            to: email,
            subject: `We've received your enquiry!`,
            text: [
                `Hi ${fname},`,
                '',
                `Thanks for getting in touch! Becca has received your enquiry and will get back to you within 48 hours.`,
                '',
                `Here's a summary of what you sent:`,
                '',
                ...lines,
                '',
                'Becca x',
            ].join('\n'),
        });

        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (err) {
        console.error('Mail error:', err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};