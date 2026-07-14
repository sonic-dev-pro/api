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

        // جلب الصورة مع إرسال Headers تمنع الـ Rate Limit والـ 429 Block
        const response = await axios.get(externalApiUrl, {
            responseType: 'arraybuffer',
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
                'Referer': 'https://apis.xditya.me/',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'image',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'cross-site'
            }
        });

        // إرسال الصورة مباشرة للمتصفح أو البوت
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // تخزين مؤقت لتقليل الطلبات على الـ API الأساسي

        return res.send(Buffer.from(response.data));

    } catch (error) {
        console.error('API Write Error:', error);
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            status: false,
            message: '❌ حدث خطأ أثناء معالجة الصورة (ربما ضغط كبير على السيرفر الأساسي).',
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
