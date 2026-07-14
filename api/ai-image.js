/*
   المطور الوحيد:
   - محمد (SONIC DEV) 🇲🇦
   حقوق التطوير محفوظة بالكامل
   ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
*/

import express from 'express';
import axios from 'axios';

// ─── دالة التحقق من وجود نص عربي ──────────────────────────────────────
function hasArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
}

// ─── دالة ترجمة إلى الإنجليزية ──────────────────────────────────────
async function translateToEnglish(text) {
    try {
        const { data } = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
            params: {
                client: 'gtx',
                sl: 'auto',
                tl: 'en',
                dt: 't',
                q: text
            },
            timeout: 8000
        });
        if (data && data[0]) {
            return data[0].map(item => item[0]).join('');
        }
        return text;
    } catch (e) {
        console.log('Translation error:', e.message);
        return text;
    }
}

// ─── الدالة الأساسية ──────────────────────────────────────────────────
async function processImage(imageBuffer, mimeType, prompt) {
    // 1. ترجمة النص إذا كان عربياً
    let finalPrompt = prompt;
    if (hasArabic(prompt)) {
        finalPrompt = await translateToEnglish(prompt);
    }

    // 2. تحويل الصورة إلى base64
    const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

    // 3. تحضير الـ payload
    const payload = {
        prompt: finalPrompt,
        input_image: base64Image,
        input_image_mime_type: mimeType || 'image/jpeg',
        input_image_extension: (mimeType || 'image/jpeg').split('/')[1] || 'jpeg',
        width: 576,
        height: 1024,
        mode: 'standard',
        client_request_id: Date.now().toString() + Math.random().toString(36).substring(2, 8)
    };

    // 4. إرسال الطلب إلى Raphael.app
    const response = await axios.post('https://raphael.app/api/ai-image-editor', payload, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain; charset=utf-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        responseType: 'text',
        timeout: 60000,
    });

    // 5. استخراج النتيجة
    const responseText = response.data;
    const lines = responseText.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        throw new Error('لم يتم استلام رد من الخادم');
    }

    const lastLine = JSON.parse(lines[lines.length - 1]);

    if (lastLine.status !== 'complete') {
        throw new Error(`حالة غير مكتملة: ${lastLine.status || 'unknown'}`);
    }

    if (!lastLine.data || !lastLine.data.url) {
        throw new Error('لم يتم العثور على رابط النتيجة');
    }

    const resultUrl = `https://raphael.app${lastLine.data.url}`;

    return {
        success: true,
        data: {
            resultUrl: resultUrl,
            originalPrompt: prompt,
            translatedPrompt: finalPrompt,
            status: lastLine.status
        }
    };
}

// ─── إنشاء Router ──────────────────────────────────────────────────────
const router = express.Router();

// ─── GET Endpoint ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { imageUrl, prompt } = req.query;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                error: 'يجب توفير معامل imageUrl (رابط الصورة) و prompt (وصف التعديل)'
            });
        }

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'يجب توفير معامل prompt (وصف التعديل)'
            });
        }

        // تحميل الصورة من الرابط
        const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';
        const imageBuffer = Buffer.from(imageResponse.data);

        if (imageBuffer.length === 0) {
            throw new Error('الصورة فارغة أو لا يمكن تحميلها');
        }

        const result = await processImage(imageBuffer, mimeType, prompt);
        result.meta = {
            timestamp: new Date().toISOString()
        };

        res.status(200).json(result);

    } catch (error) {
        console.error('AI Image Editor Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'حدث خطأ داخلي في الخادم',
            code: error.code || 'UNKNOWN'
        });
    }
});

// ─── POST Endpoint ───────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { image, imageUrl, mimeType, prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'يجب توفير حقل prompt (وصف التعديل)'
            });
        }

        let imageBuffer;
        let finalMimeType = mimeType || 'image/jpeg';

        if (image) {
            // استقبال Base64 مباشرة
            imageBuffer = Buffer.from(image, 'base64');
            if (imageBuffer.length === 0) {
                throw new Error('البيانات المرسلة فارغة أو غير صالحة');
            }
        } else if (imageUrl) {
            // تحميل من رابط
            const imageResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            imageBuffer = Buffer.from(imageResponse.data);
            finalMimeType = imageResponse.headers['content-type'] || 'image/jpeg';
        } else {
            return res.status(400).json({
                success: false,
                error: 'يجب إرسال إما image (Base64) أو imageUrl (رابط)'
            });
        }

        const result = await processImage(imageBuffer, finalMimeType, prompt);
        result.meta = {
            timestamp: new Date().toISOString()
        };

        res.status(200).json(result);

    } catch (error) {
        console.error('AI Image Editor Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'حدث خطأ داخلي في الخادم',
            code: error.code || 'UNKNOWN'
        });
    }
});

// ─── تصدير module ──────────────────────────────────────────────────────
export default {
    path: '/api/ai-image',
    name: 'AI Image Editor',
    type: 'ai',
    urlExample: 'GET /api/ai-image?imageUrl=https://example.com/photo.jpg&prompt=make%20it%20cartoon',
    logo: 'https://i.imgur.com/ai-logo.png',
    router: router
};
