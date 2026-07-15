/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 📝 الوظيفة: توليد ميم بايدن بناءً على النص المرسل
 * 🛡️ المطور: فول ستاك (Full Stack) - وحيد
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const POPCAT_BIDEN_API = 'https://api.popcat.xyz/biden';

// ─── الدالة الموحدة لمعالجة توليد الميم ───────────────────────────
async function handleBidenMeme(textInput, res) {
    try {
        // 1. التحقق من توفير النص في الطلب
        if (!textInput) {
            return res.status(400).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى كتابة النص المطلوب لتوليد ميم بايدن عبر معامل text."
            });
        }

        const cleanText = textInput.trim();
        const encodedText = encodeURIComponent(cleanText);
        const targetMemeUrl = `${POPCAT_BIDEN_API}?text=${encodedText}`;

        // 2. التحقق من استجابة السيرفر وتوليد الميم بنجاح
        await axios.head(targetMemeUrl, { timeout: 10000 });

        // 3. إرسال استجابة JSON تحتوي على رابط الصورة المباشر والمعلومات وحقوقك
        return res.status(200).json({
            status: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            result: {
                text: cleanText,
                imageUrl: targetMemeUrl
            }
        });

    } catch (error) {
        console.error('Biden Meme API Error:', error.message);
        return res.status(500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ داخلي أثناء معالجة وتوليد ميم بايدن.",
            details: error.message
        });
    }
}

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/api/biden', async (req, res) => {
    const text = req.query.text;
    await handleBidenMeme(text, res);
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/api/biden', async (req, res) => {
    const { text } = req.body || {};
    await handleBidenMeme(text, res);
});

// ─── هيكلية التصدير المنظمة والمتوافقة مع Vercel و ES Modules ───────────
export const apiMetadata = {
    path: '/api/biden',
    name: 'Biden Meme Maker API',
    type: 'maker / meme',
    urlExample: '/api/biden?text=Hello World',
    logo: 'https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z'
};

// التصدير الافتراضي المطلوب لـ Vercel Routing
export default router;
