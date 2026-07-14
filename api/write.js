/**
 * 📝 Write Text on Paper API — كود كتابة نص على ورق بالذكاء الاصطناعي
 * ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 👤 المطور الثانوي: Zyro core (الياس) 🦇
 */

import express from 'express';
import axios from 'axios';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// يدعم كلاً من الـ GET لإظهار الواجهة والتجربة، والـ POST للاستدعاء البرمجي
app.get('/api/write', async (req, res) => {
    try {
        const text = req.query.text;
        
        if (!text) {
            return res.status(200).json({
                status: false,
                message: '⚠️ يرجى تزويد النص المطلوب كتابته عبر المعامل "text".',
                example: '/api/write?text=Sonic Bot is here'
            });
        }

        const encodedText = encodeURIComponent(text);
        const externalApiUrl = `https://apis.xditya.me/write?text=${encodedText}`;

        const response = await axios.get(externalApiUrl, {
            responseType: 'arraybuffer',
            timeout: 20000 
        });

        const imageBase64 = Buffer.from(response.data).toString('base64');
        const finalImageUri = `data:image/png;base64,${imageBase64}`;

        return res.status(200).json({
            status: true,
            developer: '𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد) & Zyro core (الياس)',
            source_channel: 'https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z',
            result: {
                text: text,
                image_url: externalApiUrl, 
                image_base64: finalImageUri 
            }
        });

    } catch (error) {
        console.error('API Write Error:', error);
        return res.status(500).json({
            status: false,
            message: '❌ حدث خطأ داخلي أثناء محاولة معالجة النص.',
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
