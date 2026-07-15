/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 📝 الوظيفة: توليد ميم بايدن وإرسال الصورة مباشرة
 * 🛡️ المطور: فول ستاك (Full Stack) - وحيد
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const POPCAT_BIDEN_API = 'https://api.popcat.xyz/biden';

// ─── الدالة الموحدة لمعالجة توليد الميم وإرسال الصورة مباشرة ───────────
async function handleBidenMeme(textInput, res) {
    if (!textInput) {
        return res.status(400).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "يرجى كتابة النص المطلوب عبر معامل text."
        });
    }

    try {
        const cleanText = textInput.trim();
        const encodedText = encodeURIComponent(cleanText);
        const targetMemeUrl = `${POPCAT_BIDEN_API}?text=${encodedText}`;

        // 1. تحميل الصورة كـ Buffer من المصدر
        const response = await axios.get(targetMemeUrl, {
            responseType: 'arraybuffer',
            timeout: 15000
        });

        // 2. إرسال الصورة مباشرة مع تحديد نوع المحتوى
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline; filename="biden-meme.png"');
        res.send(Buffer.from(response.data));

    } catch (error) {
        console.error('Biden Meme API Error:', error.message);
        // في حال حدوث خطأ نرسل JSON ليفهم البوت أن هناك مشكلة
        res.status(500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ أثناء توليد الصورة.",
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

// ─── التصدير ──────────────────────────────────────────────────────────
export default router;
