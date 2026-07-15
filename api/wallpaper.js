/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 👤 المطور الثانوي: Zyro core (الياس) 🦇
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 🤖 اسم البوت: ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 📝 الوظيفة: جلب خلفية عشوائية وعرضها كصورة مباشرة في المتصفح
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const API_URL = 'https://api-nanzz.my.id/docs/api/random/random-wallpaper.php';

// ─── الـ Endpoint الأساسي ────────────────────────────────────────────────
router.all('/api/wallpaper', async (req, res) => {
    try {
        // 1. طلب بيانات الخلفية العشوائية من الـ API الأساسي
        const response = await axios.get(API_URL, {
            timeout: 15000 // مهلة 15 ثانية
        });

        const data = response.data;

        // 2. التحقق من صحة الاستجابة ووجود رابط الصورة
        if (!data.status || !data.result || !data.result.url) {
            return res.status(502).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: 'فشل جلب رابط الصورة العشوائية من المصدر.'
            });
        }

        const imageUrl = data.result.url;

        // 3. تحميل ملف الصورة كـ ArrayBuffer (بيانات ثنائية) لإعادة توجيهها للمتصفح
        const imageStream = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 20000
        });

        // 4. تحديد نوع الملف (Mime-Type) المناسب للصورة
        const contentType = imageStream.headers['content-type'] || 'image/jpeg';

        // 5. إعداد ترويسات الاستجابة لعرض الصورة مباشرة في صفحة المتصفح
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // لضمان عدم حفظ الصورة مؤقتاً وظهور خلفية جديدة دائماً عند التحديث
        res.setHeader('X-Developer', 'ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭'); // بصمتك البرمجية الخاصة في ترويسات الاستجابة

        // 6. إرسال الصورة مباشرة للمتصفح ليتم عرضها تلقائياً
        return res.send(Buffer.from(imageStream.data, 'binary'));

    } catch (error) {
        console.error('Wallpaper API Error:', error);

        return res.status(500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: 'حدث خطأ أثناء معالجة وعرض الخلفية العشوائية.',
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

// التصدير الافتراضي لتوجيه Vercel
export default router;
