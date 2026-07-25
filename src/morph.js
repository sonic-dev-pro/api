/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Morph AI Image Editing Endpoint
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const OMEGATECH_MORPH_URL = 'https://omegatech-api.dixonomega.tech/api/ai/Morphai';

async function handleMorphRequest(imageUrl, prompt, action = 'edit', res) {
    try {
        if (!imageUrl) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير رابط الصورة عبر معامل imageUrl."
            });
        }

        if (!prompt) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير وصف التعديل عبر معامل prompt."
            });
        }

        const encodedImageUrl = encodeURIComponent(imageUrl.trim());
        const encodedPrompt = encodeURIComponent(prompt.trim());
        const encodedAction = encodeURIComponent(action);

        const targetUrl = `${OMEGATECH_MORPH_URL}?action=${encodedAction}&imageUrl=${encodedImageUrl}&prompt=${encodedPrompt}`;

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 45000
        });

        const data = response.data;

        if (!data || !data.success || !data.data || !data.data.url) {
            return res.status(500).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "فشل تعديل الصورة من السيرفر الرئيسي."
            });
        }

        // إرجاع النتيجة بتنسيق منظم وموحد
        return res.status(200).json({
            ok: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            model: "Morph AI Image Editor",
            prompt: prompt,
            originalImage: imageUrl,
            resultImage: data.data.url,
            attribution: data.attribution || "@Omegatech-01"
        });

    } catch (error) {
        console.error('Morph AI Error:', error.message);
        return res.status(500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ أثناء الاتصال بسيرفر تعديل الصور.",
            details: error.message
        });
    }
}

// ─── Endpoints ────────────────────────────────────────────────────────
router.get('/api/morph', async (req, res) => {
    const { imageUrl, prompt, action } = req.query;
    await handleMorphRequest(imageUrl, prompt, action, res);
});

router.post('/api/morph', async (req, res) => {
    const { imageUrl, prompt, action } = req.body || {};
    await handleMorphRequest(imageUrl, prompt, action, res);
});

export default router;
