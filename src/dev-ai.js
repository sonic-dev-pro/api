/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Dev AI Assistant - يستقبل سياق الكود من البوت ويحلله
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const BASE_DEEPSEEK_API = 'https://nikai-api-main.vercel.app/api/deepseek';

async function handleDevAIRequest(req, res) {
    try {
        const { text, codeContext } = req.body || {};

        if (!text) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير النص المطلوب عبر معامل text."
            });
        }

        // صياغة البرومبت النهائي المدمج بين الأكواد والسؤال
        let fullPrompt = `[توجيه هام جداً للنموذج]:\n`;
        fullPrompt += `أنت مساعد برمجي خبير ومطور متخصص تم إعدادك بواسطة SONIC DEV (محمد).\n`;
        fullPrompt += `وظيفتك الإجابة عن أسطر وأكواد وهيكلة البوت المرفقة أدناه بدقة عالية.\n\n`;

        if (codeContext) {
            fullPrompt += `━━━ 📂 هيكلة وأكواد البوت المرفقة ━━━\n\n${codeContext}\n\n`;
        }

        fullPrompt += `━━━ 👤 سؤال المبرمج ━━━\n${text.trim()}`;

        // إرسال الطلب لـ DeepSeek
        const encodedText = encodeURIComponent(fullPrompt);
        const response = await axios.get(`${BASE_DEEPSEEK_API}?text=${encodedText}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 35000
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
            answer: aiReply
        });

    } catch (error) {
        console.error('Dev AI API Error:', error.message);
        return res.status(500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ داخلي أثناء معالجة طلب Dev AI.",
            details: error.message
        });
    }
}

// الـ Endpoint يستقبل POST لحمل الأكواد الكبيرة
router.post('/api/dev-ai', async (req, res) => {
    await handleDevAIRequest(req, res);
});

export const apiMetadata = {
    path: '/api/dev-ai',
    name: 'Sonic Dev AI Endpoint',
    type: 'ai / developer'
};

export default router;
