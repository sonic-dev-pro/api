/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 👤 المطور الثانوي: Zyro core (الياس) 🦇
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 🤖 اسم البوت: ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 📝 الوظيفة: Express API لتوليد وصف للصور (Image 2 Prompt API)
 */

import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

const router = express.Router();
const API_BASE = 'https://engez.a7a.online/api/v1';

// ─── دالة فحص صحة الصورة ────────────────────────────────────────────────
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
    return signatures.some(sig => sig.every((byte, i) => firstBytes[i] === byte));
}

// ─── رفع الصورة إلى Uguu ──────────────────────────────────────────────
async function uploadToUguu(buffer, ext) {
    try {
        const form = new FormData();
        form.append('files[]', buffer, `file.${ext}`);

        const response = await axios.post('https://uguu.se/upload.php', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        });

        if (!response.data?.files?.[0]?.url) {
            throw new Error('فشل في رفع الصورة إلى سيرفر التخزين المؤقت');
        }

        return response.data.files[0].url;
    } catch (error) {
        throw new Error(`فشل رفع الملف: ${error.message}`);
    }
}

// ─── طلب الوصف من السيرفر الأساسي ─────────────────────────────────────
async function generatePromptFromApi(imageUrl) {
    try {
        const params = new URLSearchParams();
        params.append('imageUrl', imageUrl);

        const response = await axios.get(`${API_BASE}/tools/img2prompt?${params.toString()}`, {
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.data?.success) {
            throw new Error(response.data?.error || 'فشل معالجة وتوليد وصف الصورة');
        }

        return response.data.response;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message || 'فشل الاتصال بسيرفر الذكاء الاصطناعي');
    }
}

// ─── الـ Endpoint الأساسي ────────────────────────────────────────────────
router.all('/api/img2prompt', async (req, res) => {
    try {
        // جلب رابط الصورة من query parameter أو body
        const imageUrl = req.query.url || req.body?.url;

        if (!imageUrl) {
            return res.status(400).json({
                status: false,
                error: 'الرجاء توفير رابط الصورة في الـ parameter باسم (url).',
                usage_example: '/api/img2prompt?url=https://example.com/image.jpg'
            });
        }

        // 1. تحميل الصورة لتحويلها إلى Buffer والتحقق منها
        let imageBuffer;
        try {
            const imageResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 20000
            });
            imageBuffer = Buffer.from(imageResponse.data);
        } catch (downloadErr) {
            return res.status(400).json({
                status: false,
                error: `فشل تحميل الصورة من الرابط الموفر: ${downloadErr.message}`
            });
        }

        // 2. التحقق من حجم وصحة الصورة
        if (!isValidImage(imageBuffer)) {
            return res.status(400).json({
                status: false,
                error: 'الملف الموفر ليس صورة صالحة. الصيغ المدعومة: JPG, PNG, GIF, WEBP.'
            });
        }

        const maxSize = 10 * 1024 * 1024; // 10 ميجابايت
        if (imageBuffer.length > maxSize) {
            return res.status(400).json({
                status: false,
                error: `حجم الصورة كبير جداً (${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB). الحد الأقصى المسموح به هو 10 MB.`
            });
        }

        // 3. استخراج الامتداد ورفع الصورة
        const fileInfo = await fileTypeFromBuffer(imageBuffer);
        const ext = fileInfo?.ext || 'jpg';
        const uploadedUrl = await uploadToUguu(imageBuffer, ext);

        // 4. استدعاء سيرفر الذكاء الاصطناعي
        const result = await generatePromptFromApi(uploadedUrl);

        // 5. إرجاع النتيجة بحقوقك
        return res.status(200).json({
            status: true,
            creator: "ˢᵒⁿⁱⁿᶜ ᴰᵉᵛ 𒉭",
            result: {
                arabic: result?.arabic || null,
                english: result?.english || result?.prompt || null,
                raw_response: result
            }
        });

    } catch (error) {
        console.error('API Process Error:', error);

        return res.status(500).json({
            status: false,
            error: error.message || 'حدث خطأ داخلي أثناء معالجة الصورة.'
        });
    }
});

// ─── هيكلية التصدير المنظمة ومتوافقة مع Vercel و ES Modules ───────────
export const apiMetadata = {
    path: '/api/img2prompt',
    name: '𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (Image to Prompt API)',
    type: 'AI / Image Analysis',
    urlExample: '/api/img2prompt?url=https://raw.githubusercontent.com/node-form-data/form-data/master/test/data/example.gif'
};

export default router;
