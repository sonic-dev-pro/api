/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 👤 المطور الثانوي: Zyro core (الياس) 🦇
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 🤖 اسم البوت: ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 📝 الوظيفة: جلب خلفية عشوائية مباشرة من الـ Buffer وعرضها كصورة في المتصفح
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const API_URL = 'https://api-nanzz.my.id/docs/api/random/random-wallpaper.php';

// ─── الـ Endpoint الأساسي ────────────────────────────────────────────────
router.all('/api/wallpaper', async (req, res) => {
    try {
        // 1. طلب جلب ملف الصورة مباشرة كـ arraybuffer
        const imageResponse = await axios.get(API_URL, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 25000 // مهلة 25 ثانية
        });

        // 2. تحديد نوع الـ Content-Type من ترويسات الملف المسترجع (غالباً image/jpeg أو image/png)
        const contentType = imageResponse.headers['content-type'] || 'image/jpeg';

        // 3. إعداد ترويسات الاستجابة لعرض الصورة في متصفح المستخدم مباشرة وبشكل متجدد
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // لضمان عدم حفظ المتصفح للصورة وعرض واحدة جديدة عند كل تحديث
        res.setHeader('X-Developer', 'ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭'); // بصمتك البرمجية الخاصة

        // 4. إرسال الـ Buffer للمتصفح مباشرة
        return res.send(Buffer.from(imageResponse.data));

    } catch (error) {
        console.error('Wallpaper Direct Buffer Error:', error);

        // في حال حدوث خطأ طارئ، نقوم بتحويل المستخدم كـ Redirect أخير للرابط الأساسي لضمان الخدمة
        try {
            res.setHeader('X-Developer', 'ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭');
            return res.redirect(302, API_URL);
        } catch (redirectErr) {
            return res.status(500).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: 'حدث خطأ أثناء تحميل وبث صورة الخلفية العشوائية.',
                details: error.message
            });
        }
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

// التصدير الافتراضي المطلوب لـ Vercel Routing
export default router;
