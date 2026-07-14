/**
 * 🎬 Nanobanana AI Image Editor API — سونيك بنانا تعديل صور بالذكاء الاصطناعي
 * ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * حہּٰقَــــوٰقَ sonic dev(محمد) & zyro core (الياس) 💻🔥
 */

import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const app = express();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('⚠️ الملف المرفوع يجب أن يكون صورة فقط!'));
        }
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// دالة لمعالجة الصورة ورفعها للسيرفر الأساسي للتعديل
async function processImageEdit(imgBuffer, mimeType, promptText) {
    const form = new FormData();
    form.append('prompt', promptText);
    form.append('file', imgBuffer, {
        filename: `sonic_nanobanana_${Date.now()}.png`,
        contentType: mimeType
    });

    const apiUrl = 'https://api-nanzz.my.id/docs/api/ai-image/nanobanana-edit.php';

    const response = await axios.post(apiUrl, form, {
        headers: {
            ...form.getHeaders(),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 60000 
    });

    return response.data;
}

// مسار تعديل الصور واستقبال الـ file
app.post('/api/ai-image', upload.single('file'), async (req, res) => {
    try {
        const prompt = req.body.prompt || req.query.prompt;
        if (!prompt) {
            return res.status(400).json({
                status: false,
                message: '⚠️ يرجى كتابة نص التعديل (prompt) المطلوب.'
            });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({
                status: false,
                message: '⚠️ يرجى إرفاق الصورة المراد تعديلها في حقل "file".'
            });
        }

        const resultData = await processImageEdit(file.buffer, file.mimetype, prompt);

        if (!resultData.status || !resultData.result || !resultData.result.url) {
            return res.status(502).json({
                status: false,
                message: `❌ فشل التعديل من الخادم الأساسي: ${resultData.msg || 'خطأ غير معروف'}`
            });
        }

        return res.status(200).json({
            status: true,
            developer: 'sonic dev(محمد) & zyro core (الياس)',
            source_channel: 'https://whatsapp.com/channel/0029Vb7On131NCrU8Di4Ev1z',
            result: {
                prompt: prompt,
                original_name: file.originalname,
                mime_type: file.mimetype,
                edited_image_url: resultData.result.url
            }
        });

    } catch (error) {
        console.error('API Nanobanana Error:', error);
        return res.status(500).json({
            status: false,
            message: '❌ حدث خطأ داخلي أثناء المعالجة.',
            error: error.message || error
        });
    }
});

export const metadata = {
    path: '/api/ai-image',
    name: 'Nanobanana AI Image Editor',
    type: 'POST',
    url_example: '/api/ai-image?prompt=convert to pencil sketch',
    logo: 'https://telegra.ph/file/sonic-bot-icon.png'
};

export default app;
