/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 📝 الوظيفة: تحميل مقاطع الفيديو والصور من منصة X (تويتر سابقاً)
 * 🛡️ المطور: فول ستاك (Full Stack) - وحيد
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const TWITTER_API_URL = 'https://api.siputzx.my.id/api/d/twitter';

// ─── الدالة الموحدة لمعالجة تحميل الفيديو ───────────────────────────
async function handleTwitterDownload(targetUrl, res) {
    try {
        // 1. التحقق من توفر الرابط في الطلب
        if (!targetUrl) {
            return res.status(400).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير رابط فيديو منصة X أو تويتر عبر معامل url."
            });
        }

        // 2. التحقق الأولي من صحة الرابط لتجنب الطلبات العشوائية للمزود
        if (!/twitter\.com|x\.com/.test(targetUrl)) {
            return res.status(400).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "الرابط الموفر غير صالح. يجب أن يكون رابطاً من منصة X (تويتر)."
            });
        }

        // 3. طلب البيانات من السيرفر الأساسي للمزود
        const encodedUrl = encodeURIComponent(targetUrl.trim());
        const response = await axios.get(`${TWITTER_API_URL}?url=${encodedUrl}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000 // مهلة 30 ثانية للتحميل
        });

        const data = response.data;

        // 4. التحقق من صحة ومطابقة استجابة السيرفر
        if (!data || data.status !== true || !data.data || !data.data.downloadLink) {
            return res.status(422).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "فشل السيرفر المزود للخدمة في معالجة الرابط وتوليد تحميل الفيديو."
            });
        }

        const result = data.data;

        // 5. إرجاع النتيجة بالكامل بشكل JSON فخم ومنظم يحمل بصمتك
        return res.status(200).json({
            status: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            result: {
                title: result.videoTitle || 'فيديو من منصة X',
                description: result.videoDescription || '',
                downloadUrl: result.downloadLink,
                sourceUrl: targetUrl
            }
        });

    } catch (error) {
        console.error('Twitter Downloader API Error:', error.message);
        return res.status(500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ داخلي أثناء معالجة طلب تحميل الفيديو من تويتر.",
            details: error.message
        });
    }
}

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/api/twitter', async (req, res) => {
    const url = req.query.url;
    await handleTwitterDownload(url, res);
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/api/twitter', async (req, res) => {
    const { url } = req.body || {};
    await handleTwitterDownload(url, res);
});

// ─── هيكلية التصدير المنظمة والمتوافقة مع Vercel و ES Modules ───────────
export const apiMetadata = {
    path: '/api/twitter',
    name: 'Twitter/X Downloader API',
    type: 'downloader',
    urlExample: '/api/twitter?url=https://twitter.com/9GAG/status/1661175429859012608',
    logo: 'https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z'
};

// التصدير الافتراضي المطلوب لـ Vercel Routing
export default router;
