/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: DeepSeek 2 AI Endpoint
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
// يمكنك استبدال هذا الرابط بالـ API الداخلي الذي جلبته
const EXTERNAL_API_URL = 'https://your-api-url.com/api/your-endpoint';

async function handleDeepSeek2Request(userText, res) {
    try {
        if (!userText || typeof userText !== 'string' || !userText.trim()) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱⁿᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير النص المطلوب عبر معامل text أو prompt."
            });
        }

        const response = await axios.get(EXTERNAL_API_URL, {
            params: { text: userText.trim() },
            timeout: 15000
        });

        const data = response.data;
        const aiReply = data?.reply || data?.answer || data?.result || data?.text;

        if (!data || !aiReply) {
            return res.status(502).json({
                ok: false,
                creator: "ˢᵒⁿⁱⁿᶜ ᴰᵉᵛ 𒉭",
                error: "تعذر الحصول على إجابة من سيرفر الذكاء الاصطناعي."
            });
        }

        return res.status(200).json({
            ok: true,
            creator: "ˢᵒⁿⁱⁿᶜ ᴰᵉᵛ 𒉭",
            model: "DeepSeek 2 AI",
            prompt: userText,
            response: aiReply
        });

    } catch (error) {
        console.error('DeepSeek2 API Error:', error.message);
        const isTimeout = error.code === 'ECONNABORTED';

        return res.status(isTimeout ? 504 : 500).json({
            ok: false,
            creator: "ˢᵒⁿⁱⁿᶜ ᴰᵉᵛ 𒉭",
            error: isTimeout ? "انتهت مهلة الانتظار." : "حدث خطأ داخلي أثناء معالجة الطلب.",
            details: error.message
        });
    }
}

// ─── Endpoints ────────────────────────────────────────────────────────
router.get('/api/deepseek2', async (req, res) => {
    const text = req.query.text || req.query.prompt;
    await handleDeepSeek2Request(text, res);
});

router.post('/api/deepseek2', async (req, res) => {
    const { text, prompt } = req.body || {};
    await handleDeepSeek2Request(text || prompt, res);
});

export const apiMetadata = {
    path: '/api/deepseek2',
    name: 'DeepSeek 2 AI (Sonic Edition)',
    type: 'ai / chat',
    urlExample: '/api/deepseek2?text=السلام عليكم'
};

export default router;
