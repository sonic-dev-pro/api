/*
   المطور الوحيد:
   - محمد (SONIC DEV) 🇲🇦
   حقوق التطوير محفوظة بالكامل
   ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
*/

import express from 'express';
import axios from 'axios';

// ─── إعدادات الـ API الخارجي ──────────────────────────────────────────
const YTDL_API = "https://ytdl.convert1s.com/api/v2/download";
const HEADERS = {
  "accept": "application/json",
  "accept-language": "en-GB",
  "content-type": "application/json",
  "origin": "https://media.ytmp3.gg",
  "priority": "u=1, i",
  "referer": "https://media.ytmp3.gg/",
  "sec-ch-ua": '"Chromium";v="127", "Not)A;Brand";v="99", "Microsoft Edge Simulate";v="127", "Lemur";v="127"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
  "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36"
};

// ─── دالة تأخير بسيطة ──────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── الدالة الأساسية ──────────────────────────────────────────────────
async function handler(url) {
    if (!url) {
        throw new Error('يجب توفير رابط يوتيوب (معامل url)');
    }

    const requestData = {
        url: url,
        output: {
            type: "video",
            format: "mp4",
            quality: "1080p"
        }
    };

    const response = await axios.post(YTDL_API, requestData, { headers: HEADERS, timeout: 25000 });
    const resData = response.data;

    if (!resData.statusUrl) {
        throw new Error('فشل السيرفر في توليد رابط فحص الحالة، تأكد من صحة الرابط.');
    }

    const statusUrl = resData.statusUrl;
    let downloadUrl = null;
    let videoTitle = resData.title || "YouTube Video";
    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
        await sleep(2000);
        attempts++;

        const statusCheck = await axios.get(statusUrl, { headers: HEADERS, timeout: 15000 });
        const statusData = statusCheck.data;

        if (statusData.status === "completed" && statusData.downloadUrl) {
            downloadUrl = statusData.downloadUrl;
            videoTitle = statusData.title || videoTitle;
            break;
        } else if (statusData.status === "failed") {
            throw new Error('فشل خادم التحميل في معالجة هذا المقطع.');
        }
    }

    if (!downloadUrl) {
        throw new Error('استغرق السيرفر وقتاً طويلاً في التحويل، يرجى المحاولة لاحقاً.');
    }

    return {
        success: true,
        data: {
            title: videoTitle,
            downloadUrl: downloadUrl,
            quality: "1080p",
            format: "mp4"
        }
    };
}

// ─── إنشاء Router ──────────────────────────────────────────────────────
const router = express.Router();

let requestCount = 0;
router.use((req, res, next) => {
    requestCount++;
    req.requestId = requestCount;
    next();
});

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'يجب توفير معامل url في الاستعلام (مثال: ?url=https://youtube.com/watch?v=...)'
            });
        }

        const result = await handler(url);
        result.meta = {
            requestId: req.requestId,
            timestamp: new Date().toISOString()
        };
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in GET /youtube:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'حدث خطأ داخلي في الخادم'
        });
    }
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'يجب إرسال كائن JSON يحتوي على حقل url'
            });
        }

        const result = await handler(url);
        result.meta = {
            requestId: req.requestId,
            timestamp: new Date().toISOString()
        };
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in POST /youtube:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'حدث خطأ داخلي في الخادم'
        });
    }
});

// ─── تصدير module ──────────────────────────────────────────────────────
export default {
    path: '/api/youtube',
    name: 'YouTube Downloader API',
    type: 'downloader',
    urlExample: 'GET /api/youtube?url=https://youtube.com/watch?v=...   أو POST /api/youtube مع {"url":"..."}',
    logo: 'https://i.imgur.com/youtube-logo.png',
    router: router
};
