/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Islam AI Chatbot Endpoint
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const OMEGATECH_ISLAM_URL = 'https://omegatech-api.dixonomega.tech/api/ai/islam-ai';

async function handleIslamAiRequest(message, sessionId, clearSession, res) {
    try {
        if (!message) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير الرسالة أو السؤال عبر معامل message."
            });
        }

        const encodedMessage = encodeURIComponent(message.trim());
        let targetUrl = `${OMEGATECH_ISLAM_URL}?message=${encodedMessage}`;

        if (sessionId) {
            targetUrl += `&sessionId=${encodeURIComponent(sessionId)}`;
        }
        if (clearSession) {
            targetUrl += `&clearSession=${encodeURIComponent(clearSession)}`;
        }

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 20000
        });

        const data = response.data;

        if (!data || !data.success || !data.answer) {
            return res.status(500).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "فشل الحصول على إجابة من السيرفر الرئيسي."
            });
        }

        // إرجاع النتيجة بتنسيق سونيك المنظم
        return res.status(200).json({
            ok: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            model: "Islam AI Chatbot",
            sessionId: data.sessionId || null,
            message: message,
            answer: data.answer,
            historyCount: data.historyCount || 0
        });

    } catch (error) {
        console.error('Islam AI Error:', error.message);
        return res.status(500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ أثناء الاتصال بسيرفر الذكاء الاصطناعي الإسلامي.",
            details: error.message
        });
    }
}

// ─── Endpoints ────────────────────────────────────────────────────────
router.get('/api/islam-ai', async (req, res) => {
    const { message, sessionId, clearSession } = req.query;
    await handleIslamAiRequest(message, sessionId, clearSession, res);
});

router.post('/api/islam-ai', async (req, res) => {
    const { message, sessionId, clearSession } = req.body || {};
    await handleIslamAiRequest(message, sessionId, clearSession, res);
});

export default router;
