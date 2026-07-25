/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Imagine AI Image Generator (Nano Banana Engine)
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const OMEGATECH_API_URL = 'https://omegatech-api.dixonomega.tech/api/ai/nano-banana-pro';

async function handleImagineRequest(prompt, res) {
    try {
        if (!prompt) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير وصف الصورة عبر معامل prompt."
            });
        }

        const encodedPrompt = encodeURIComponent(prompt.trim());

        const response = await axios.get(`${OMEGATECH_API_URL}?prompt=${encodedPrompt}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        });

        const data = response.data;

        if (!data || !data.success || !data.image) {
            return res.status(500).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "فشل توليد الصورة من السيرفر الرئيسي."
            });
        }

        // إرجاع النتيجة بتنسيق منظم ومحمي
        return res.status(200).json({
            ok: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            model: "Imagine Pro (Nano Banana Engine)",
            prompt: prompt,
            image: data.image
        });

    } catch (error) {
        console.error('Imagine API Error:', error.message);
        return res.status(500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ أثناء الاتصال بسيرفر توليد الصور.",
            details: error.message
        });
    }
}

// ─── Endpoints ────────────────────────────────────────────────────────
router.get('/api/imagine', async (req, res) => {
    const prompt = req.query.prompt;
    await handleImagineRequest(prompt, res);
});

router.post('/api/imagine', async (req, res) => {
    const { prompt } = req.body || {};
    await handleImagineRequest(prompt, res);
});

export default router;
