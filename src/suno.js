/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Suno AI Music Generator Endpoint (Sonu3 Engine)
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const OMEGATECH_SUNO_URL = 'https://omegatech-api.dixonomega.tech/api/ai/sonu3';

async function handleSunoRequest(prompt, action = 'full', res) {
    try {
        if (!prompt) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير وصف الأغنية عبر معامل prompt."
            });
        }

        const encodedPrompt = encodeURIComponent(prompt.trim());
        const targetUrl = `${OMEGATECH_SUNO_URL}?action=${encodeURIComponent(action)}&prompt=${encodedPrompt}`;

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 60000 // مهلة 60 ثانية لتوليد الموسيقى
        });

        const data = response.data;

        if (!data || !data.success || !data.url) {
            return res.status(500).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "فشل توليد الأغنية من السيرفر الرئيسي."
            });
        }

        // إرجاع النتيجة بتنسيق منظم وموحد
        return res.status(200).json({
            ok: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            model: "Suno AI (Sonu3 Engine)",
            prompt: prompt,
            title: data.title || "Untitled",
            tags: data.tags || "",
            duration: data.duration || 0,
            thumbnail: data.thumbnail || null,
            audioUrl: data.url,
            lyrics: data.lyrics || "",
            attribution: data.attribution || "@Omegatech-01"
        });

    } catch (error) {
        console.error('Suno API Error:', error.message);
        return res.status(500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ أثناء الاتصال بسيرفر توليد الموسيقى.",
            details: error.message
        });
    }
}

// ─── Endpoints ────────────────────────────────────────────────────────
router.get('/api/suno', async (req, res) => {
    const { prompt, action } = req.query;
    await handleSunoRequest(prompt, action, res);
});

router.post('/api/suno', async (req, res) => {
    const { prompt, action } = req.body || {};
    await handleSunoRequest(prompt, action, res);
});

export default router;
