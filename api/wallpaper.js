/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 🤖 اسم البوت: ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 📝 الوظيفة: جلب خلفية عشوائية كـ Buffer ومشاركتها مباشرة في المتصفح
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const WALLPAPER_API = 'https://api-nanzz.my.id/docs/api/random/random-wallpaper.php';

// ─── الـ Endpoint الأساسي ────────────────────────────────────────────────
router.all('/api/wallpaper', async (req, res) => {
    try {
        // 1. جلب الصورة كـ Buffer بنفس طريقتك الناجحة في البوت
        const response = await axios.get(WALLPAPER_API, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 30000 // مهلة 30 ثانية
        });

        const imageBuffer = Buffer.from(response.data);

        // 2. التحقق من جودة الـ Buffer المستلم
        if (!imageBuffer || imageBuffer.length < 500) {
            throw new Error('الملف المستلم ليس صورة صالحة أو تالف.');
        }

        // 3. تحديد نوع المحتوى تلقائياً أو افتراضياً كـ image/jpeg
        const contentType = response.headers['content-type'] || 'image/jpeg';

        // 4. تعيين ترويسات الاستجابة لعرض الصورة مباشرة ومنع التخزين المؤقت لتتغير في كل مرة
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('X-Developer', 'ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭'); // بصمتك البرمجية الخاصة

        // 5. إرسال الصورة مباشرة للمتصفح
        return res.send(imageBuffer);

    } catch (error) {
        console.error('API Wallpaper Error:', error.message);
        
        // في حال حدوث خطأ، يتم إرجاع رسالة الخطأ بصيغة JSON مع الحفاظ على حقوقك
        return res.status(500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "فشل في جلب وبث صورة الخلفية العشوائية من المصدر.",
            details: error.message
        });
    }
});

// ─── هيكلية التصدير المنظمة والمتوافقة مع Vercel و ES Modules ───────────
export const apiMetadata = {
    path: '/api/wallpaper',
    name: '𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (Random Wallpaper)',
    type: 'Image / Random Wallpaper',
    urlExample: '/api/wallpaper',
    logo: 'https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z'
};

// التصدير الافتراضي لـ Vercel
export default router;
