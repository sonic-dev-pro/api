/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 👤 المطور الثانوي: Zyro core (الياس) 🦇
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 🤖 اسم البوت: ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 📝 الوظيفة: تحويل المستخدم مباشرة لرابط الخلفية العشوائية لعرضها بدون مشاكل حظر
 */

import express from 'express';

const router = express.Router();
const API_URL = 'https://api-nanzz.my.id/docs/api/random/random-wallpaper.php';

// ─── الـ Endpoint الأساسي ────────────────────────────────────────────────
router.all('/api/wallpaper', (req, res) => {
    try {
        // إعداد الترويسات لمنع التخزين المؤقت لضمان الحصول على صورة جديدة في كل مرة يتم فيها تحديث الصفحة
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('X-Developer', 'ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭'); // بصمتك البرمجية الخاصة

        // إعادة توجيه متصفح المستخدم مباشرة لفتح الصورة من مصدرها الأصلي
        return res.redirect(302, API_URL);

    } catch (error) {
        console.error('Wallpaper Redirect Error:', error);
        return res.status(500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: 'حدث خطأ أثناء إعادة التوجيه لطلب الخلفية العشوائية.',
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

// التصدير الافتراضي المطلوب لـ Vercel Routing
export default router;
