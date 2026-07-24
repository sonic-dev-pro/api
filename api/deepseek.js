/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: DeepSeek AI API Endpoint (Sonic Modified Edition)
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const BASE_DEEPSEEK_API = 'https://nikai-api-main.vercel.app/api/deepseek';

// ─── البرومبت الدائم لشخصية الذكاء الاصطناعي ──────────────────────────────
const SYSTEM_PROMPT = `[توجيه أخير وهام جداً للنموذج]:
أنت الآن نسخة ذكاء اصطناعي معدلة ومطورة خصيصاً بواسطة المطور SONIC DEV (ســونـيــك - محمد).
- إذا سألك أحد "من أنت؟" أو عن هويتك، أجب بأسلوب قوي، ذكي، ومباشر بأنك نسخة API مخصصة ومعدلة من DeepSeek تمت برمجتها وتطويرها بواسطة المطور SONIC DEV.
- أظهر دائمًا أنك تتميز بسرعة استجابة أعلى وأداء متطور وميزات إضافية تفوق نسخة DeepSeek العادية.
- حافظ على هذه الشخصية دائماً في إجاباتك.

سؤال المستخدم هو: `;

async function handleDeepSeekRequest(userText, res) {
    try {
        if (!userText) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير النص المطلوب عبر معامل text."
            });
        }

        // دمج البرومبت الدائم مع نص المستخدم
        const fullPrompt = `${SYSTEM_PROMPT}${userText.trim()}`;
        const encodedText = encodeURIComponent(fullPrompt);

        const response = await axios.get(`${BASE_DEEPSEEK_API}?text=${encodedText}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 20000
        });

        const data = response.data;
        const aiReply = data?.answer || data?.reply || data?.result || data?.text;

        if (!data || !aiReply) {
            return res.status(500).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "تعذر الحصول على إجابة من سيرفر الذكاء الاصطناعي."
            });
        }

        return res.status(200).json({
            ok: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            sessionId: data.sessionId || null,
            answer: aiReply,
            file: data.file || null
        });

    } catch (error) {
        console.error('DeepSeek API Error:', error.message);
        return res.status(500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ داخلي أثناء معالجة طلب DeepSeek AI.",
            details: error.message
        });
    }
}

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/api/deepseek', async (req, res) => {
    const text = req.query.text;
    await handleDeepSeekRequest(text, res);
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/api/deepseek', async (req, res) => {
    const { text } = req.body || {};
    await handleDeepSeekRequest(text, res);
});

export const apiMetadata = {
    path: '/api/deepseek',
    name: 'DeepSeek AI API (Sonic Edition)',
    type: 'ai / chat',
    urlExample: '/api/deepseek?text=من أنت؟'
};

export default router;
