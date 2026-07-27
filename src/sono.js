/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Sono / Suno Music AI Generation Endpoint
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const SONO_API = 'https://engez.a7a.online/api/v1/ai/ai/sono';

async function handleSonoRequest(prompt, style, gender, res) {
    try {
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير النص أو وصف الأغنية عبر معامل prompt."
            });
        }

        const musicStyle = style || 'pop';
        const genderType = gender ? parseInt(gender) : 1; // 1: ذكر, 2: أنثى, 0: محايد

        const response = await axios.get(SONO_API, {
            params: {
                prompt: prompt.trim(),
                musicStyle: musicStyle,
                genderType: genderType
            },
            timeout: 120000 // 2 minutes timeout for AI generation
        });

        const data = response.data;

        if (data && data.success && data.response && data.response.success) {
            const results = data.response.results;

            return res.status(200).json({
                ok: true,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                model: "Suno / Sono Music AI",
                prompt: prompt,
                style: musicStyle,
                results: results
            });
        } else {
            return res.status(502).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: data.error || "فشل الحصول على نتائج من سيرفر التوليد."
            });
        }

    } catch (error) {
        console.error('Sono API Error:', error.message);
        const isTimeout = error.code === 'ECONNABORTED';

        return res.status(isTimeout ? 504 : 500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: isTimeout ? "انتهت مهلة الانتظار أثناء توليد الأغنية." : "حدث خطأ داخلي أثناء معالجة طلب الموسيقى.",
            details: error.message
        });
    }
}

// ─── Endpoints ────────────────────────────────────────────────────────
router.get('/api/sono', async (req, res) => {
    const prompt = req.query.prompt || req.query.text;
    const style = req.query.style || req.query.musicStyle;
    const gender = req.query.gender || req.query.genderType;
    await handleSonoRequest(prompt, style, gender, res);
});

router.post('/api/sono', async (req, res) => {
    const { prompt, text, style, musicStyle, gender, genderType } = req.body || {};
    await handleSonoRequest(prompt || text, style || musicStyle, gender || genderType, res);
});

export const apiMetadata = {
    path: '/api/sono',
    name: 'Suno Music AI (Sonic Edition)',
    type: 'ai / music',
    urlExample: '/api/sono?prompt=أغنية راب على الصداقة&style=rap&gender=1'
};

export default router;
