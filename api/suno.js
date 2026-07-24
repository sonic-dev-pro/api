/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Suno / Sonu3 AI Music Generation API Endpoint
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const BASE_SUNO_API = 'https://omegatech-api.dixonomega.tech/api/ai/sonu3';

async function handleSunoRequest(prompt, action, res) {
    try {
        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير وصف الأغنية عبر معامل prompt."
            });
        }

        const act = action || 'full';
        const encodedPrompt = encodeURIComponent(prompt.trim());
        const response = await axios.get(`${BASE_SUNO_API}?action=${act}&prompt=${encodedPrompt}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 60000 // 60 ثانية نظراً لأن إنشاء الأغاني قد يستغرق وقتاً
        });

        const data = response.data;

        if (!data || !data.success || !data.url) {
            return res.status(500).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "فشل توليد الأغنية والموسيقى من السيرفر الأساسي."
            });
        }

        return res.status(200).json({
            status: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            prompt: prompt,
            title: data.title || 'Sonic AI Track',
            tags: data.tags || 'music',
            duration: data.duration || 0,
            thumbnail: data.thumbnail || '',
            url: data.url,
            lyrics: data.lyrics || '',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Suno Music API Error:', error.message);
        return res.status(500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ داخلي أثناء معالجة طلب إنشاء الأغنية.",
            details: error.message
        });
    }
}

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/api/suno', async (req, res) => {
    const prompt = req.query.prompt;
    const action = req.query.action;
    await handleSunoRequest(prompt, action, res);
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/api/suno', async (req, res) => {
    const { prompt, action } = req.body || {};
    await handleSunoRequest(prompt, action, res);
});

export const apiMetadata = {
    path: '/api/suno',
    name: 'AI Suno Music Generation API (Sonic Edition)',
    type: 'ai / audio',
    urlExample: '/api/suno?prompt=Morocco'
};

export default router;
