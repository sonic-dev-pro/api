/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المطور الوحيد: محمد (SONIC DEV) 🇲🇦
 * 🎯 المشروع: SonicBot-MD
 * 📝 الوظيفة: YouTube Downloader API (استخراج روابط تحميل اليوتيوب بجودة عالية)
 * حقوق التطوير محفوظة بالكامل
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

// دالة تأخير بسيطة
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── الدالة الأساسية لمعالجة وتحميل الفيديو ──────────────────────────────
async function handleDownload(url, res) {
    try {
        // التحقق من وجود وصحة الرابط
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'يجب توفير معامل url (مثال: ?url=https://youtube.com/watch?v=...)'
            });
        }

        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return res.status(400).json({
                success: false,
                error: 'الرابط يجب أن يكون من YouTube'
            });
        }

        // استخدام API بديل أولاً (أكثر استقراراً)
        try {
            const response = await axios.get(`https://api.tubemp3.cc/convert?url=${encodeURIComponent(url)}`, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.data && response.data.url) {
                return res.json({
                    success: true,
                    creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
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
            timeout: 25000
        });

        const resData = response.data;

        if (!resData.statusUrl) {
            throw new Error('فشل السيرفر في توليد رابط الفحص');
        }

        const statusUrl = resData.statusUrl;
        let downloadUrl = null;
        let videoTitle = resData.title || 'YouTube Video';
        let attempts = 0;
        const maxAttempts = 8; // تقليل عدد المحاولات لتفادي انتهاء وقت الـ Serverless في Vercel (10s/60s)

        while (attempts < maxAttempts) {
            await sleep(2000);
            attempts++;

            try {
                const statusCheck = await axios.get(statusUrl, {
                    headers: { 'user-agent': 'Mozilla/5.0' },
                    timeout: 10000
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
                    throw new Error('انتهى وقت الانتظار للتحويل بالتتبع المباشر');
                }
            }
        }

        if (!downloadUrl) {
            throw new Error('استغرق السيرفر وقتاً طويلاً، حاول لاحقاً');
        }

        return res.json({
            success: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
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
        return res.status(500).json({
            success: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: error.message || 'حدث خطأ داخلي في الخادم'
        });
    }
}

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/api/youtube', async (req, res) => {
    const url = req.query.url;
    await handleDownload(url, res);
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/api/youtube', async (req, res) => {
    const { url } = req.body || {};
    await handleDownload(url, res);
});

// ─── هيكلية التصدير المنظمة والمتوافقة مع Vercel و ES Modules ───────────
export const apiMetadata = {
    path: '/api/youtube',
    name: 'YouTube Downloader API',
    type: 'downloader',
    urlExample: '/api/youtube?url=https://youtube.com/watch?v=...',
    logo: 'https://i.imgur.com/youtube-logo.png'
};

export default router;
