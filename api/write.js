/**
 * 📝 Write Text on Paper API — كود كتابة نص على ورق وإرساله كصورة مباشرة
 * ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 👤 المطور الثانوي: Zyro core (الياس) 🦇
 */

import express from 'express';
import axios from 'axios';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/write', async (req, res) => {
    try {
        const text = req.query.text;
        
        if (!text) {
            return res.status(400).json({
                status: false,
                message: '⚠️ يرجى تزويد النص المطلوب كتابته عبر المعامل "text".',
                example: '/api/write?text=Sonic Bot'
            });
        }

        const encodedText = encodeURIComponent(text);
        const externalApiUrl = `https://apis.xditya.me/write?text=${encodedText}`;

        // جلب الصورة كـ arraybuffer
        const response = await axios.get(externalApiUrl, {
            responseType: 'arraybuffer',
            timeout: 20000 
        });

        // ⚠️ السر هنا: نخبر المتصفح أو البوت أن هذه صورة مباشرة وليست صفحة JSON
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // كاش لتسريع الطلبات المتكررة

        // إرسال الـ Buffer مباشرة كصورة
        return res.send(Buffer.from(response.data));

    } catch (error) {
        console.error('API Write Error:', error);
        // في حال حدوث خطأ فقط نرجع JSON يوضح المشكلة
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            status: false,
            message: '❌ حدث خطأ أثناء معالجة الصورة.',
            error: error.message || error
        });
    }
});

export const metadata = {
    path: '/api/write',
    name: 'Write on Paper AI',
    type: 'GET',
    url_example: '/api/write?text=Sonic Bot is here',
    logo: 'https://telegra.ph/file/sonic-bot-icon.png'
};

export default app;
