/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Dev AI Assistant - خبير ومطور هيكلة وأكواد البوت
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const BASE_DEEPSEEK_API = 'https://nikai-api-main.vercel.app/api/deepseek';

async function handleDevAIRequest(req, res) {
    try {
        const text = req.body?.text || req.query?.text;
        let codeContext = req.body?.codeContext || req.query?.codeContext || '';

        if (!text) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير النص المطلوب عبر معامل text."
            });
        }

        // قص الكود تلقائياً لعدم تجاوز حد 15,000 حرف لتجنب تحطم السيرفر الوسيط
        if (codeContext.length > 15000) {
            codeContext = codeContext.substring(0, 15000) + "\n\n...[تم قص باقي الكود لتجنب تجاوز حد السيرفر]...";
        }

        // صياغة البرومبت النهائي
        let fullPrompt = `[توجيه أخير للنموذج]:\n`;
        fullPrompt += `أنت خبير ومطور برمجيات متعمق في بوتات الواتساب (Baileys / Node.js) المطور بواسطة SONIC DEV.\n`;
        fullPrompt += `أجب على سؤال المستخدم بناءً على الأكواد المرفقة بكفاءة ودقة عالية.\n\n`;

        if (codeContext) {
            fullPrompt += `━━━ 📂 أكواد وهيكلة البوت المرفقة ━━━\n${codeContext}\n\n`;
        }

        fullPrompt += `━━━ 👤 السؤال: ${text.trim()} ━━━`;

        // إرسال الطلب لـ DeepSeek
        const encodedText = encodeURIComponent(fullPrompt);
        const response = await axios.get(`${BASE_DEEPSEEK_API}?text=${encodedText}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 40000
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
            error: "حدث خطأ أثناء معالجة البيانات، حاول إرسال سؤال محدد أكثر.",
            details: error.message
        });
    }
}

router.post('/api/dev-ai', async (req, res) => {
    await handleDevAIRequest(req, res);
});

router.get('/api/dev-ai', async (req, res) => {
    await handleDevAIRequest(req, res);
});

export const apiMetadata = {
    path: '/api/dev-ai',
    name: 'Sonic Dev AI Endpoint',
    type: 'ai / developer'
};

export default router;
