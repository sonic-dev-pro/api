/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: AI Image Generation API Endpoint
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const BASE_IMAGE_API = 'https://omegatech-api.dixonomega.tech/api/ai/nano-banana-pro';

async function handleImagineRequest(prompt, res) {
    try {
        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير وصف الصورة عبر معامل prompt."
            });
        }

        const encodedPrompt = encodeURIComponent(prompt.trim());
        const response = await axios.get(`${BASE_IMAGE_API}?prompt=${encodedPrompt}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000 // 30 ثانية لتوليد الصورة
        });

        const data = response.data;

        if (!data || !data.success || !data.image) {
            return res.status(500).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "فشل توليد الصورة من السيرفر الأساسي."
            });
        }

        return res.status(200).json({
            status: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            model: "Sonic NanoBanana 2",
            prompt: prompt,
            image: data.image,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Imagine API Error:', error.message);
        return res.status(500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ داخلي أثناء معالجة طلب إنشاء الصورة.",
            details: error.message
        });
    }
}

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/api/imagine', async (req, res) => {
    const prompt = req.query.prompt;
    await handleImagineRequest(prompt, res);
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/api/imagine', async (req, res) => {
    const { prompt } = req.body || {};
    await handleImagineRequest(prompt, res);
});

export const apiMetadata = {
    path: '/api/imagine',
    name: 'AI Image Generation API (Sonic Edition)',
    type: 'ai / image',
    urlExample: '/api/imagine?prompt=نهر%20انمي%20صافي'
};

export default router;
