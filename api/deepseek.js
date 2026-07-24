Enter/*
   المطور الوحيد:
   - محمد (SONIC DEV) 🇲🇦
   حقوق التطوير محفوظة بالكامل
   ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
*/

import express from 'express';
import axios from 'axios';

const router = express.Router();
const DEEPSEEK_API = "https://nikai-api-main.vercel.app/api/deepseek";

// ─── الدالة الأساسية لمعالجة طلب الذكاء الاصطناعي ──────────────────────
async function processDeepSeek(text, res) {
    try {
        // 1. التحقق من وجود النص
        if (!text || text.trim() === '') {
            return res.status(400).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير نص السؤال عبر معامل text."
            });
        }

        // 2. إرسال الطلب إلى الـ API الخارجي
        const response = await axios.get(DEEPSEEK_API, {
            params: { text: text.trim() },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000 // 30 ثانية كحد أقصى
        });

        const data = response.data;

        // 3. التحقق من صحة الرد
        if (!data.ok) {
            return res.status(502).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: data.error || 'فشل الحصول على رد من الذكاء الاصطناعي'
            });
        }

        // 4. استخراج الرد
        const answer = data.answer || data.reply || data.result || data.text;
        if (!answer) {
            return res.status(502).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: 'لم يتم العثور على رد في استجابة الـ API'
            });
        }

        // 5. إرجاع النتيجة بنجاح
        return res.status(200).json({
            status: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            result: {
                answer: answer,
                sessionId: data.sessionId || null,
                source: 'DeepSeek AI'
            }
        });

    } catch (error) {
        console.error('DeepSeek API Error:', error.message);
        
        if (error.response) {
            return res.status(502).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: `خطأ من الخادم الخارجي: ${error.response.status}`,
                details: error.response.statusText
            });
        } else if (error.request) {
            return res.status(504).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: 'الخادم الخارجي لا يستجيب، يرجى المحاولة لاحقاً'
            });
        } else {
            return res.status(500).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: 'حدث خطأ داخلي أثناء معالجة الطلب',
                details: error.message
            });
        }
    }
}

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/api/deepseek', async (req, res) => {
    const text = req.query.text;
    await processDeepSeek(text, res);
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/api/deepseek', async (req, res) => {
    const { text } = req.body || {};
    await processDeepSeek(text, res);
});

// ─── هيكلية التصدير ──────────────────────────────────────────────────
export const apiMetadata = {
    path: '/api/deepseek',
    name: 'DeepSeek AI Chat',
    type: 'AI / Chat',
    urlExample: '/api/deepseek?text=مرحبا من أنت؟',
    logo: 'https://i.imgur.com/ai-logo.png'
};

export default router;
