/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 👤 المطور الثانوي: Zyro core (الياس) 🦇
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 🤖 اسم البوت: ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 📝 الوظيفة: جلب صورة الخلفية العشوائية كـ Buffer مباشر وبثها للمتصفح (طريقة write المستقرة)
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const API_URL = 'https://api-nanzz.my.id/docs/api/random/random-wallpaper.php';

// ─── الـ Endpoint الأساسي ────────────────────────────────────────────────
router.all('/api/wallpaper', async (req, res) => {
    try {
        // 1. جلب الصورة مباشرة كـ ArrayBuffer مع استخدام نفس هيدرز طريقة write لتجنب أي حظر أو تلف للملف
        const response = await axios({
            method: 'get',
            url: API_URL,
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            timeout: 30000 // مهلة كافية لتحميل الصورة بالكامل
        });

        // 2. قراءة نوع الصورة المسترجع ديناميكياً من السيرفر
        const contentType = response.headers['content-type'] || 'image/jpeg';

        // 3. تعيين ترويسات الاستجابة لضمان عرضها كصورة مباشرة في المتصفح ومنع التخزين المؤقت (لكي تتغير في كل تحديث)
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('X-Developer', 'ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭'); // بصمتك البرمجية

        // 4. إرسال الـ Buffer المكتوب مباشرة إلى المتصفح بدون أي تلف
        return res.send(Buffer.from(response.data));

    } catch (error) {
        console.error('Wallpaper direct fetch error:', error);
        
        // في حال حدوث خطأ، نعيد الصورة المكسورة أو رسالة خطأ منظمة
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

// التصدير الافتراضي المطلوب لـ Vercel Routing
export default router;
