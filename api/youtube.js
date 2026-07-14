/*
   المطور الوحيد:
   - محمد (SONIC DEV) 🇲🇦
   حقوق التطوير محفوظة بالكامل
*/

import express from 'express';
import axios from 'axios';

const router = express.Router();

// دالة تأخير بسيطة
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'يجب توفير معامل url (مثال: ?url=https://youtube.com/watch?v=...)'
            });
        }

        // التحقق من صحة الرابط
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return res.status(400).json({
                success: false,
                error: 'الرابط يجب أن يكون من YouTube'
            });
        }

        // استخدام API بديل (أكثر استقراراً)
        // جرب API مختلف أولاً
        try {
            const response = await axios.get(`https://api.tubemp3.cc/convert?url=${encodeURIComponent(url)}`, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.data && response.data.url) {
                return res.json({
                    success: true,
                    data: {
                        title: response.data.title || 'YouTube Video',
                        downloadUrl: response.data.url,
                        quality: '1080p',
                        format: 'mp4'
                    },
                    meta: {
                        timestamp: new Date().toISOString()
                    }
                });
            }
        } catch (e) {
            console.log('Fallback API failed, trying main API...');
        }

        // الـ API الرئيسي (ytdl.convert1s.com)
        const requestData = {
            url: url,
            output: {
                type: "video",
                format: "mp4",
                quality: "1080p"
            }
        };

        const response = await axios.post('https://ytdl.convert1s.com/api/v2/download', requestData, {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
            },
            timeout: 30000
        });

        const resData = response.data;

        if (!resData.statusUrl) {
            throw new Error('فشل السيرفر في توليد رابط الفحص');
        }

        const statusUrl = resData.statusUrl;
        let downloadUrl = null;
        let videoTitle = resData.title || 'YouTube Video';
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            await sleep(2000);
            attempts++;

            try {
                const statusCheck = await axios.get(statusUrl, {
                    headers: { 'user-agent': 'Mozilla/5.0' },
                    timeout: 15000
                });
                const statusData = statusCheck.data;

                if (statusData.status === 'completed' && statusData.downloadUrl) {
                    downloadUrl = statusData.downloadUrl;
                    videoTitle = statusData.title || videoTitle;
                    break;
                } else if (statusData.status === 'failed') {
                    throw new Error('فشل خادم التحميل في معالجة هذا المقطع');
                }
            } catch (pollError) {
                if (attempts >= maxAttempts) {
                    throw new Error('انتهى وقت الانتظار للتحويل');
                }
            }
        }

        if (!downloadUrl) {
            throw new Error('استغرق السيرفر وقتاً طويلاً، حاول لاحقاً');
        }

        res.json({
            success: true,
            data: {
                title: videoTitle,
                downloadUrl: downloadUrl,
                quality: '1080p',
                format: 'mp4'
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('YouTube Error:', error.message);
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

        // إعادة استخدام نفس المنطق
        req.query.url = url;
        return router.handle(req, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default {
    path: '/api/youtube',
    name: 'YouTube Downloader API',
    type: 'downloader',
    urlExample: 'GET /api/youtube?url=https://youtube.com/watch?v=...',
    logo: 'https://i.imgur.com/youtube-logo.png',
    router: router
};
