/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 👤 المطور الثانوي: Zyro core (الياس) 🦇
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 🤖 اسم البوت: ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 📝 الوظيفة: تحويل الصورة إلى وصف نصي باستخدام الذكاء الاصطناعي (Image to Prompt)
 */

import express from 'express';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();
const API_URL = 'https://api-nanzz.my.id/docs/api/ai-image/image-2-prompt.php';

// ─── دالة التحقق من صحة الصورة ──────────────────────────────────────────
function isValidImage(buffer) {
    if (!buffer || buffer.length < 100) return false;
    const signatures = [
        [0xFF, 0xD8, 0xFF],       // JPEG
        [0x89, 0x50, 0x4E, 0x47], // PNG
        [0x47, 0x49, 0x46, 0x38], // GIF
        [0x42, 0x4D],             // BMP
        [0x52, 0x49, 0x46, 0x46], // WEBP
    ];
    const firstBytes = buffer.slice(0, 4);
    for (const sig of signatures) {
        if (sig.every((byte, i) => firstBytes[i] === byte)) return true;
    }
    return false;
}

// ─── دالة تحويل الصورة إلى وصف مع إعادة المحاولة ──────────────────────
async function imageToPromptWithRetry(imageBuffer, fileName, retries = 3) {
    let lastError = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🔄 محاولة ${attempt} من ${retries}...`);

            const formData = new FormData();
            formData.append('file', imageBuffer, { filename: fileName });

            const response = await axios.post(API_URL, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 120000 // 120 ثانية
            });

            const data = response.data;
            console.log('📥 استجابة API:', JSON.stringify(data, null, 2));

            if (data.status === true && data.result) {
                console.log(`✅ نجحت المحاولة ${attempt}`);
                return data;
            }

            throw new Error(data.message || data.error || 'فشل تحليل الصورة');

        } catch (error) {
            console.error(`❌ محاولة ${attempt} فشلت:`, error.message);
            lastError = error;

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            }
        }
    }

    throw lastError || new Error('فشلت جميع محاولات تحليل الصورة');
}

// ─── الـ Endpoint الأساسي ────────────────────────────────────────────────
router.all('/api/img2prompt', async (req, res) => {
    try {
        // جلب الرابط من الـ Query Parameters أو من الـ JSON Body
        const imageUrl = req.query.url || req.body?.url;

        if (!imageUrl) {
            return res.status(400).json({
                status: false,
                error: 'الرجاء توفير رابط الصورة في الـ parameter باسم (url) لكي يتم تحليلها.',
                usage_example: '/api/img2prompt?url=https://example.com/image.jpg'
            });
        }

        // 1. تحميل الصورة من الرابط وتحويلها إلى Buffer
        let imageBuffer;
        try {
            const imageResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 20000 // 20 ثانية كحد أقصى للتحميل
            });
            imageBuffer = Buffer.from(imageResponse.data, 'binary');
        } catch (downloadErr) {
            return res.status(400).json({
                status: false,
                error: `فشل تحميل الصورة من الرابط الموفر: ${downloadErr.message}`
            });
        }

        // 2. فحص نوع وحجم الصورة
        if (!isValidImage(imageBuffer)) {
            return res.status(400).json({
                status: false,
                error: 'الملف الذي تم تحميله ليس صورة صالحة. الصيغ المدعومة: JPG, PNG, GIF, WEBP.'
            });
        }

        const maxSize = 10 * 1024 * 1024; // 10 ميجابايت
        if (imageBuffer.length > maxSize) {
            return res.status(400).json({
                status: false,
                error: `حجم الصورة كبير جداً (${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB). الحد الأقصى المسموح به هو 10 MB.`
            });
        }

        // 3. إرسال طلب المعالجة للـ API الخارجي
        const fileName = `image_${Date.now()}.jpg`;
        const apiResult = await imageToPromptWithRetry(imageBuffer, fileName);

        // 4. إرجاع النتيجة بحقوقك بالكامل وبشكل نظيف
        return res.status(200).json({
            status: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭", // حقوقك الرسمية هنا
            result: {
                description: apiResult.result || 'لم يتم العثور على وصف للصورة.',
                task_id: apiResult.task_id || null
            }
        });

    } catch (error) {
        console.error('API Process Error:', error);

        let statusCode = 500;
        let errorMessage = 'حدث خطأ داخلي أثناء معالجة الصورة بالذكاء الاصطناعي.';

        if (error.response) {
            if (error.response.status === 404) {
                statusCode = 404;
                errorMessage = 'رابط الـ API الخارجي غير صحيح أو تم إيقافه مؤقتاً.';
            } else if (error.response.status === 413) {
                statusCode = 413;
                errorMessage = 'حجم الصورة كبير جداً على الخادم الخارجي.';
            } else if (error.response.status === 429) {
                statusCode = 429;
                errorMessage = 'تم تجاوز حد الطلبات المسموح بها مع المزود الخارجي.';
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        return res.status(statusCode).json({
            status: false,
            error: errorMessage
        });
    }
});

// ─── هيكلية التصدير المنظمة والمتوافقة مع Vercel و ES Modules ───────────
export const apiMetadata = {
    path: '/api/img2prompt',
    name: '𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (Image to Prompt)',
    type: 'AI / Image Analysis',
    urlExample: '/api/img2prompt?url=https://raw.githubusercontent.com/node-form-data/form-data/master/test/data/example.gif',
    logo: 'https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z'
};

// التصدير الافتراضي المطلوب لـ Vercel Routing
export default router;
