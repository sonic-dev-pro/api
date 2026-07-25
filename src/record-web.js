/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 📝 الوظيفة: جلب رابط تسجيل شاشة المواقع كفيديو من السيرفر بمختلف الوضعيات والأجهزة
 * 🛡️ المطور: فول ستاك (Full Stack) - وحيد
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const RECORD_API_URL = 'https://api-nanzz.my.id/docs/api/tools/record-web.php';

// مصفوفة الأجهزة المتاحة للتحقق منها والتحكم بالقيم الافتراضية
const validDevices = [
    "desktop_hd", "desktop_fhd", "laptop_15", 
    "macbook_pro", "ipad_pro", "iphone_15_pro", "samsung_s24"
];

// ─── الدالة الموحدة لمعالجة تسجيل شاشة المواقع ─────────────────────────
async function handleRecordWeb(params, res) {
    try {
        let { url, device, scroll, dark_mode } = params;

        // 1. التحقق من توفر الرابط في الطلب
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير رابط الموقع المطلوب تصويره عبر معامل url."
            });
        }

        // إضافة بروتوكول http/https تلقائياً إن لم يتوفر
        let targetUrl = url.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        // 2. تعيين وتدقيق القيم الافتراضية للخيارات
        const finalDevice = validDevices.includes(device) ? device : "desktop_hd";
        const finalScroll = scroll === 'true' || scroll === true ? 'true' : 'false';
        const finalDark = dark_mode === 'true' || dark_mode === true ? 'true' : 'false';

        // 3. طلب البيانات من الـ API الرئيسي الموفر للخدمة
        const encodedUrl = encodeURIComponent(targetUrl);
        const requestUrl = `${RECORD_API_URL}?url=${encodedUrl}&device=${finalDevice}&scroll=${finalScroll}&dark_mode=${finalDark}`;

        const response = await axios.get(requestUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 60000 // مهلة 60 ثانية نظراً لأن المعالجة بالفيديو تستغرق وقتاً أطول
        });

        const data = response.data;

        // 4. التحقق من صحة الاستجابة
        if (!data || data.status !== true || !data.result || !data.result.url) {
            return res.status(502).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "فشل السيرفر المزود للخدمة في معالجة وتسجيل هذا الموقع."
            });
        }

        // 5. إرجاع النتيجة بشكل منسق مع حقوق المطور
        return res.status(200).json({
            status: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            result: {
                targetUrl: targetUrl,
                device: finalDevice,
                scroll: finalScroll === 'true',
                dark_mode: finalDark === 'true',
                videoUrl: data.result.url
            }
        });

    } catch (error) {
        console.error('Record Web API Error:', error.message);
        return res.status(500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ داخلي أثناء معالجة طلب تسجيل الموقع.",
            details: error.message
        });
    }
}

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/api/record-web', async (req, res) => {
    const { url, device, scroll, dark_mode } = req.query;
    await handleRecordWeb({ url, device, scroll, dark_mode }, res);
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/api/record-web', async (req, res) => {
    const { url, device, scroll, dark_mode } = req.body || {};
    await handleRecordWeb({ url, device, scroll, dark_mode }, res);
});

// ─── هيكلية التصدير المنظمة والمتوافقة مع Vercel و ES Modules ───────────
export const apiMetadata = {
    path: '/api/record-web',
    name: 'Record Web to Video API',
    type: 'utility / tools',
    urlExample: '/api/record-web?url=https://google.com&device=desktop_hd&scroll=true&dark_mode=false',
    logo: 'https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z'
};

// التصدير الافتراضي المطلوب لـ Vercel Routing
export default router;
