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
        bakeTypes, cakeServings, cakeFlavour, cakeDesign,
        cupcakeServings, cupcakeFlavours, cupcakeDesign,
        traybakeItems, traybakeDate,
        message, images } = payload;

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

    // ── Shared HTML helpers ─────────────────────────────────────────────────
    function row(label, value) {
        if (!value || value === '—') return '';
        return `
            <tr>
                <td style="padding:8px 0;vertical-align:top;width:140px;
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

    function section(title, rows) {
        return `
            <div style="margin:24px 0 0;">
                <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                    letter-spacing:0.14em;text-transform:uppercase;color:${pink};
                    margin-bottom:12px;">
                    ${title}
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="border-top:1px solid ${pinkLight};">
                    <tbody>${rows}</tbody>
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
<!-- preheader -->
<div style="display:none;max-height:0;overflow:hidden;color:#f7edf7;">
    ${preheader}
</div>
<!-- wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#f7edf7;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="max-width:560px;">

    <!-- Header -->
    <tr>
        <td align="center"
            style="background:linear-gradient(135deg,${pink} 0%,${pinkDark} 100%);
                border-radius:16px 16px 0 0;padding:36px 32px 28px;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;
                font-weight:700;color:#ffffff;letter-spacing:0.02em;margin-bottom:4px;">
                Becca's Cakes and Bakes
            </div>
            <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:400;
                color:rgba(255,255,255,0.75);letter-spacing:0.14em;text-transform:uppercase;">
                Gluten &amp; dairy free &middot; Made in Northern Ireland
            </div>
        </td>
    </tr>

    <!-- Body -->
    <tr>
        <td style="background:#ffffff;padding:36px 36px 28px;border-radius:0 0 16px 16px;
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

    // ── Build detail rows ───────────────────────────────────────────────────
    const contactRows = row('Name', `${fname} ${lname}`) +
        row('Email', `<a href="mailto:${email}" style="color:${pink};text-decoration:none;">${email}</a>`) +
        row('Phone', phone);

    function designBlock(label, text) {
        if (!text) return '';
        return `<tr><td colspan="2" style="padding:12px 0;">
            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                letter-spacing:0.1em;text-transform:uppercase;color:${muted};margin-bottom:6px;">
                ${label}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:15px;color:${deep};
                line-height:1.65;white-space:pre-wrap;">${text}</div>
        </td></tr>`;
    }

    let detailRows = '';
    if (topic === 'custom') {
        let orderRows = row('Occasion', occasion) + row('Date needed', eventDate);

        if (Array.isArray(bakeTypes) && bakeTypes.includes('cake')) {
            orderRows += `<tr><td colspan="2" style="padding:10px 0 2px;">
                <strong style="font-family:Arial,sans-serif;font-size:13px;color:${pink};">🎂 Cake</strong>
            </td></tr>`;
            orderRows += row('Servings', cakeServings);
            orderRows += row('Flavour', cakeFlavour);
            orderRows += designBlock('Design ideas', cakeDesign);
        }

        if (Array.isArray(bakeTypes) && bakeTypes.includes('cupcake')) {
            orderRows += `<tr><td colspan="2" style="padding:10px 0 2px;">
                <strong style="font-family:Arial,sans-serif;font-size:13px;color:${pink};">🧁 Cupcakes</strong>
            </td></tr>`;
            orderRows += row('Servings', cupcakeServings);
            orderRows += row('Flavours', Array.isArray(cupcakeFlavours) ? cupcakeFlavours.join(', ') : cupcakeFlavours);
            orderRows += designBlock('Design ideas', cupcakeDesign);
        }

        detailRows = section('Order details', orderRows);
    }

    if (topic === 'traybake') {
        let traybakeRows = '';
        if (Array.isArray(traybakeItems) && traybakeItems.length) {
            traybakeRows += traybakeItems.map(item =>
                row(item.name, `${item.qty} servings`)
            ).join('');
        }
        traybakeRows += row('Date needed', traybakeDate);
        detailRows = section('Event details', traybakeRows);
    }

    const messageBlock = message ? section('Message',
        `<tr><td colspan="2" style="padding:12px 0;font-family:Arial,sans-serif;
            font-size:15px;color:${deep};line-height:1.65;white-space:pre-wrap;">
            ${message}
        </td></tr>`
    ) : '';

    const imageNote = images && images.length > 0
        ? `<div style="margin-top:20px;padding:14px 16px;background:${cream};
            border-radius:10px;font-family:Arial,sans-serif;font-size:13px;color:${muted};">
            📸 <strong style="color:${deep};">${images.length} inspiration image${images.length > 1 ? 's' : ''}</strong>
            attached to this email.
          </div>`
        : '';

    // ── Build attachments ───────────────────────────────────────────────────
    const attachments = (images || []).map(function (img, i) {
        const matches = img.data.match(/^data:image\/(jpeg|png);base64,(.+)$/);
        if (!matches) return null;
        return {
            filename: `inspiration-${i + 1}.${matches[1] === 'jpeg' ? 'jpg' : 'png'}`,
            content: matches[2],
            encoding: 'base64',
        };
    }).filter(Boolean);

    // ── Plain text fallback ─────────────────────────────────────────────────
    const textLines = [
        `ENQUIRY TYPE: ${topicLabel}`, '',
        `Name:  ${fname} ${lname}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
    ];
    if (topic === 'custom') {
        textLines.push('',
            `Occasion: ${occasion || '—'}`,
            `Date:     ${eventDate || '—'}`
        );
        if (Array.isArray(bakeTypes) && bakeTypes.includes('cake')) {
            textLines.push('', '🎂 Cake',
                `  Servings: ${cakeServings || '—'}`,
                `  Flavour:  ${cakeFlavour || '—'}`,
                `  Design:   ${cakeDesign || '—'}`
            );
        }
        if (Array.isArray(bakeTypes) && bakeTypes.includes('cupcake')) {
            textLines.push('', '🧁 Cupcakes',
                `  Servings: ${cupcakeServings || '—'}`,
                `  Flavours: ${Array.isArray(cupcakeFlavours) ? cupcakeFlavours.join(', ') : (cupcakeFlavours || '—')}`,
                `  Design:   ${cupcakeDesign || '—'}`
            );
        }
    }
    if (topic === 'traybake') {
        textLines.push('');
        if (Array.isArray(traybakeItems) && traybakeItems.length) {
            traybakeItems.forEach(item => textLines.push(`  ${item.name}: ${item.qty} servings`));
        }
        textLines.push(`Date: ${traybakeDate || '—'}`);
    }
    if (message) textLines.push('', `Message:`, message);

    // ── Becca's email ───────────────────────────────────────────────────────
    const beccaBody = `
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;
            color:${deep};margin:0 0 6px;">New enquiry received</h1>
        <p style="font-family:Arial,sans-serif;font-size:15px;color:${muted};
            margin:0 0 24px;line-height:1.6;">
            A new <strong style="color:${deep};">${topicLabel}</strong> enquiry
            has come in from the website.
        </p>
        ${section('Contact details', contactRows)}
        ${detailRows}
        ${messageBlock}
        ${imageNote}
        <div style="margin-top:28px;padding-top:20px;border-top:1px solid ${pinkLight};">
            <a href="mailto:${email}?subject=Re: Your enquiry with Becca's Cakes and Bakes"
                style="display:inline-block;background:${pink};color:#ffffff;
                font-family:Arial,sans-serif;font-size:14px;font-weight:700;
                text-decoration:none;padding:12px 28px;border-radius:50px;">
                Reply to ${fname}
            </a>
        </div>`;

    // ── Customer confirmation email ──────────────────────────────────────────
    const customerBody = `
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;
            color:${deep};margin:0 0 6px;">Thanks for getting in touch, ${fname}!</h1>
        <p style="font-family:Arial,sans-serif;font-size:15px;color:${muted};
            margin:0 0 24px;line-height:1.6;">
            Becca has received your enquiry and will get back to you within
            <strong style="color:${deep};">72 hours</strong>.
            Here's a summary of what you sent.
        </p>
        ${section('Your details', contactRows)}
        ${detailRows}
        ${messageBlock}
        ${images && images.length > 0 ? `
        <div style="margin-top:20px;padding:14px 16px;background:${cream};
            border-radius:10px;font-family:Arial,sans-serif;font-size:13px;color:${muted};">
            📸 You attached <strong style="color:${deep};">${images.length} inspiration image${images.length > 1 ? 's' : ''}</strong> — Becca will take a look!
        </div>` : ''}
        <div style="margin-top:28px;padding:20px 24px;background:${cream};
            border-radius:12px;text-align:center;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;
                color:${deep};margin:0 0 14px;font-style:italic;">
                "Baking without barriers"
            </p>
            <a href="https://beccascakesandbakes.co.uk/shop.html"
                style="display:inline-block;background:${pink};color:#ffffff;
                font-family:Arial,sans-serif;font-size:14px;font-weight:700;
                text-decoration:none;padding:12px 28px;border-radius:50px;">
                Browse the Shop
            </a>
        </div>`;

    try {
        await transporter.sendMail({
            from: `"Becca's Cakes and Bakes" <${process.env.NOTIFY_EMAIL_USER}>`,
            to: 'aaronshawni0@gmail.com',
            subject: `New Enquiry — ${topicLabel} from ${fname} ${lname}`,
            text: textLines.join('\n'),
            html: emailWrapper(`New ${topicLabel} enquiry from ${fname} ${lname}`, beccaBody),
            attachments,
        });

        await transporter.sendMail({
            from: `"Becca's Cakes and Bakes" <${process.env.NOTIFY_EMAIL_USER}>`,
            to: email,
            subject: `We've received your enquiry! 🎂`,
            text: [`Hi ${fname},`, '', `Thanks for getting in touch! Becca has received your enquiry and will get back to you within 72 hours.`, '', ...textLines, '', 'Becca x'].join('\n'),
            html: emailWrapper(`We've got your enquiry, ${fname}!`, customerBody),
        });

        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (err) {
        console.error('Mail error:', err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};