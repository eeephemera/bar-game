import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Only POST
    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const { name, phone, bar, city, comment, website } = req.body;

    // Honeypot — bot filled hidden field
    if (website) {
        return res.status(200).json({ ok: true });
    }

    // Validation
    if (!name || !phone) {
        return res.status(400).json({ ok: false, error: 'Укажите имя и телефон' });
    }

    // Yandex SMTP transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.yandex.ru',
        port: 465,
        secure: true, // SSL
        auth: {
            user: process.env.SMTP_USER,     // z.magomedovv@yandex.com
            pass: process.env.SMTP_PASSWORD,  // App password from Yandex
        },
    });

    // HTML email
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;">
        <h2 style="color:#FF2D6B;">🎮 Новая заявка BARPLAY</h2>
        <table style="border-collapse:collapse;width:100%;">
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;color:#888;width:40%;">Имя</td>
                <td style="padding:10px;font-weight:bold;">${name}</td>
            </tr>
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;color:#888;">Телефон / Telegram</td>
                <td style="padding:10px;font-weight:bold;">${phone}</td>
            </tr>
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;color:#888;">Заведение</td>
                <td style="padding:10px;">${bar || '—'}</td>
            </tr>
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;color:#888;">Город</td>
                <td style="padding:10px;">${city || '—'}</td>
            </tr>
            <tr>
                <td style="padding:10px;color:#888;">Комментарий</td>
                <td style="padding:10px;">${comment || '—'}</td>
            </tr>
        </table>
        <p style="color:#aaa;margin-top:20px;font-size:12px;">
            Отправлено с сайта BARPLAY · ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
        </p>
    </div>`;

    try {
        await transporter.sendMail({
            from: `"BARPLAY" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // себе же на почту
            replyTo: `"${name}" <noreply@barplay.ru>`,
            subject: `🎮 BARPLAY — Заявка от ${name}`,
            html: html,
        });

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('SMTP Error:', error);
        return res.status(500).json({ ok: false, error: 'Ошибка отправки' });
    }
}
