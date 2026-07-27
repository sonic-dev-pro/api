/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Real SimSimi Endpoint
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

// الرابط الأساسي لخدمة سمسمي الحقيقية
const SIMSIMI_REAL_API = 'https://virix-api.vercel.app/api/simsimi/chat';

async function handleSimSimiRequest(userText, res) {
    try {
        if (!userText || typeof userText !== 'string' || !userText.trim()) {
            return res.status(400).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير النص المطلوب عبر معامل message أو prompt أو text."
            });
        }

        const cleanText = userText.trim();

        // إرسال الطلب لـ API سمسمي الحقيقي
        const response = await axios.get(SIMSIMI_REAL_API, {
            params: { message: cleanText },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        const data = response.data;
        const simsimiReply = data?.reply || data?.raw?.reply;

        if (!data || !data.status || !simsimiReply) {
            return res.status(502).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "تعذر الحصول على رد من خادم سمسمي الرئيسي."
            });
        }

        // تنسيق الرد النهائي بنفس أسلوب مشروك
        return res.status(200).json({
            status: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            prompt: cleanText,
            reply: simsimiReply,
            raw: data.raw || null,
            metadata: data.metadata || {
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Real SimSimi API Error:', error.message);
        
        const isTimeout = error.code === 'ECONNABORTED';

        return res.status(isTimeout ? 504 : 500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: isTimeout ? "انتهت مهلة الانتظار." : "حدث خطأ داخلي أثناء الاتصال بالخادم.",
            details: error.message
        });
    }
}

// ─── Endpoints ────────────────────────────────────────────────────────
router.get('/api/simsimi', async (req, res) => {
    // قبول المعامل بسواء كان message أو prompt أو text لتسهيل الاستخدام
    const text = req.query.message || req.query.prompt || req.query.text;
    await handleSimSimiRequest(text, res);
});

router.post('/api/simsimi', async (req, res) => {
    const { message, prompt, text } = req.body || {};
    await handleSimSimiRequest(message || prompt || text, res);
});

export const apiMetadata = {
    path: '/api/simsimi',
    name: 'Real SimSimi Chat',
    type: 'ai / chat',
    urlExample: '/api/simsimi?message=من انت'
};

export default router;
