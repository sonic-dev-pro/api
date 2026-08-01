/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Smart YouTube Downloader & Search Router
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

const API_BASE = 'https://engez.a7a.online/api/v1';
const YT_SEARCH = `${API_BASE}/search/youtube`;
const YT_DOWNLOAD_V2 = `${API_BASE}/download/youtubev2`;
const YT_DOWNLOAD_NEW = `${API_BASE}/download/ytdl`;

// ─── Search Engine ──────────────────────────────────────────────────
async function handleSearchRequest(query, res) {
    try {
        const params = new URLSearchParams({ q: query.trim() });
        const response = await axios.get(`${YT_SEARCH}?${params.toString()}`, { timeout: 25000 });
        const data = response.data;

        if (data && data.success && data.results) {
            return res.status(200).json({
                ok: true,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                action: "search",
                query: query,
                count: data.results.length,
                results: data.results
            });
        } else {
            return res.status(502).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: data?.error || "تعذر الحصول على نتائج من سيرفر البحث."
            });
        }
    } catch (error) {
        console.error('YouTube Search API Error:', error.message);
        return res.status(500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ أثناء البحث في يوتيوب.",
            details: error.message
        });
    }
}

// ─── Download Engine ────────────────────────────────────────────────
async function handleDownloadRequest(url, type, quality, res) {
    try {
        const downloadType = type === 'audio' || type === 'mp3' ? 'audio' : 'mp4';
        
        try {
            const params = new URLSearchParams({ url: url.trim(), type: downloadType });
            const response = await axios.get(`${YT_DOWNLOAD_V2}?${params.toString()}`, { timeout: 30000 });
            
            if (response.data?.success && response.data?.response) {
                return res.status(200).json({
                    ok: true,
                    creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                    action: "download",
                    model: "YouTube Downloader V2",
                    result: response.data.response
                });
            }
        } catch (v2Err) {
            console.warn('V2 Engine failed, trying fallback...', v2Err.message);
        }

        const fallbackParams = new URLSearchParams({ url: url.trim() });
        if (downloadType) fallbackParams.set('type', downloadType);
        if (quality) fallbackParams.set('quality', quality);

        const fbResponse = await axios.get(`${YT_DOWNLOAD_NEW}?${fallbackParams.toString()}`, { timeout: 30000 });
        
        if (fbResponse.data?.success && fbResponse.data?.response) {
            return res.status(200).json({
                ok: true,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                action: "download",
                model: "YouTube Downloader Fallback",
                result: fbResponse.data.response
            });
        }

        return res.status(502).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "جميع سيرفرات التحميل متوقفة حالياً، حاول مجدداً لاحقاً."
        });
    } catch (error) {
        console.error('YouTube Download API Error:', error.message);
        return res.status(500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ أثناء جلب رابط التحميل.",
            details: error.message
        });
    }
}

// ─── Smart Router Control ───────────────────────────────────────────
async function processYouTubeRequest(req, res) {
    const query = req.query.q || req.query.query || req.body?.q || req.body?.query;
    const url = req.query.url || req.body?.url;
    const type = req.query.type || req.body?.type;
    const quality = req.query.quality || req.body?.quality;

    // 1. إذا تمرر رابط فسيتم التنزيل فوراً
    if (url) {
        return await handleDownloadRequest(url, type, quality, res);
    }

    // 2. إذا تمررت كلمة بحث فسيتم البحث فوراً
    if (query) {
        return await handleSearchRequest(query, res);
    }

    // 3. إذا لم يمرر شيء يظهر الدليل المساعد
    return res.status(400).json({
        ok: false,
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
        message: "Sonic YouTube API Center - Smart Endpoint",
        usage: {
            search_example: "/api/youtube?q=sonic",
            download_example: "/api/youtube?url=https://youtube.com/watch?v=xxx&type=mp4"
        }
    });
}

// Support both Express Router paths (/youtube and /api/youtube)
const targetPaths = ['/youtube', '/api/youtube', '/youtube/search', '/api/youtube/search', '/youtube/download', '/api/youtube/download'];

router.get(targetPaths, processYouTubeRequest);
router.post(targetPaths, processYouTubeRequest);

export const apiMetadata = {
    path: '/api/youtube',
    name: 'YouTube Smart API (Sonic Edition)',
    type: 'downloader / search',
    urlExample: '/api/youtube?q=sonic'
};

export default router;
