/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 📝 الوظيفة: جلب وتحليل بيانات أي قناة واتساب (WhatsApp Channel Stalker)
 * 🛡️ المطور: فول ستاك (Full Stack) - وحيد
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const WHATSAPP_API_LIMIT = 'https://api-nanzz.my.id/docs/api/stalker/whatsapp-channel.php';

// ─── الدالة الموحدة لمعالجة جلب معلومات القناة ───────────────────────────
async function fetchChannelInfo(targetUrl, res) {
    try {
        // 1. التحقق من صحة توفر الرابط في الطلب
        if (!targetUrl) {
            return res.status(400).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير رابط قناة واتساب صالح عبر معامل url."
            });
        }

        // 2. التحقق من مطابقة الرابط لروابط قنوات الواتساب الرسمية
        if (!targetUrl.includes('whatsapp.com/channel/')) {
            return res.status(400).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "الرابط الموفر ليس رابط قناة واتساب رسمي وصحيح."
            });
        }

        // 3. ترميز الرابط وطلب البيانات من السيرفر الأساسي
        const encodedUrl = encodeURIComponent(targetUrl.trim());
        const response = await axios.get(`${WHATSAPP_API_LIMIT}?url=${encodedUrl}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000 // مهلة 15 ثانية
        });

        const data = response.data;

        // 4. التحقق من هيكلية استجابة الـ API بنجاح
        if (!data || data.status !== true || !data.result) {
            return res.status(404).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "لم يتم العثور على بيانات لهذه القناة، تأكد من أن القناة عامة وليست خاصة."
            });
        }

        const result = data.result;

        // 5. إرجاع النتيجة بشكل JSON منسق ونظيف مع توثيق بصمتك وحقوقك
        return res.status(200).json({
            status: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            result: {
                name: result.name || 'قناة غير معروفة',
                url: targetUrl,
                image: result.image || '',
                description: result.desc || 'لا يوجد وصف متاح لهذه القناة.'
            }
        });

    } catch (error) {
        console.error('WhatsApp Channel Stalker API Error:', error.message);
        return res.status(500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ داخلي أثناء معالجة طلب جلب بيانات قناة الواتساب.",
            details: error.message
        });
    }
}

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/api/stalkchannel', async (req, res) => {
    // جلب الرابط الافتراضي لقناتك في حال عدم توفير رابط لتسهيل الفحص والتجربة
    const url = req.query.url || 'https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z';
    await fetchChannelInfo(url, res);
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/api/stalkchannel', async (req, res) => {
    const { url } = req.body || {};
    await fetchChannelInfo(url, res);
});

// ─── هيكلية التصدير المنظمة والمتوافقة مع Vercel و ES Modules ───────────
export const apiMetadata = {
    path: '/api/stalkchannel',
    name: 'WhatsApp Channel Stalker API',
    type: 'stalker / lookup',
    urlExample: '/api/stalkchannel?url=https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z',
    logo: 'https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z'
};

// التصدير الافتراضي المطلوب لـ Vercel Routing
export default router;
