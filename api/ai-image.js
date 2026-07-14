/*
   المطور الوحيد:
   - محمد (SONIC DEV) 🇲🇦
   حقوق التطوير محفوظة بالكامل
   ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
*/

import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ─── إعدادات Multer لرفع الصور ──────────────────────────────────────
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('نوع الملف غير مدعوم. استخدم jpg, png, webp'));
        }
    }
});

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
            timeout: 10000
        });
        return data[0].map(item => item[0]).join('');
    } catch (e) {
        console.log('Translation error:', e.message);
        return text; // في حالة فشل الترجمة نعيد النص الأصلي
    }
}

// ─── الدالة الأساسية لمعالجة الصورة ──────────────────────────────────
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
        input_image_mime_type: mimeType,
        input_image_extension: mimeType.split('/')[1] || 'webp',
        width: 576,
        height: 1024,
        mode: 'standard',
        client_request_id: crypto.randomUUID(),
    };

    // 4. إرسال الطلب إلى Raphael.app
    const response = await axios.post('https://raphael.app/api/ai-image-editor', payload, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain; charset=utf-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        responseType: 'text',
        timeout: 60000, // 60 ثانية
    });

    // 5. استخراج النتيجة
    const lines = response.data.trim().split('\n');
    const lastLine = JSON.parse(lines[lines.length - 1]);

    if (lastLine.status !== 'complete') {
        throw new Error('فشل تعديل الصورة أو أنها لا تزال قيد المعالجة، حاول مرة أخرى.');
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

// ─── GET Endpoint (صورة عبر رابط) ────────────────────────────────────
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

        const result = await processImage(imageBuffer, mimeType, prompt);
        result.meta = {
            requestId: req.requestId || 0,
            timestamp: new Date().toISOString()
        };

        res.status(200).json(result);

    } catch (error) {
        console.error('AI Image Editor Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'حدث خطأ داخلي في الخادم'
        });
    }
});

// ─── POST Endpoint (رفع ملف صورة) ────────────────────────────────────
router.post('/', upload.single('image'), async (req, res) => {
    try {
        // req.file يحتوي على الصورة المرفوعة
        // req.body.prompt يحتوي على النص

        const { prompt } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                error: 'يجب رفع ملف صورة مع الحقل image (jpeg, png, webp)'
            });
        }

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'يجب توفير حقل prompt (وصف التعديل)'
            });
        }

        const imageBuffer = file.buffer;
        const mimeType = file.mimetype;

        const result = await processImage(imageBuffer, mimeType, prompt);
        result.meta = {
            requestId: req.requestId || 0,
            timestamp: new Date().toISOString()
        };

        res.status(200).json(result);

    } catch (error) {
        console.error('AI Image Editor Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'حدث خطأ داخلي في الخادم'
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
