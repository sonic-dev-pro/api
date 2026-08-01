/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: YouTube Downloader & Search Engine
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

const API_BASE = 'https://engez.a7a.online/api/v1';
const YT_SEARCH = `${API_BASE}/search/youtube`;
const YT_DOWNLOAD_V2 = `${API_BASE}/download/youtubev2`;
const YT_DOWNLOAD_NEW = `${API_BASE}/download/ytdl`;
const YT_DOWNLOAD_OLD = `${API_BASE}/download/youtube`;

// ─── Search Function ──────────────────────────────────────────────────
async function handleSearchRequest(query, res) {
    try {
        if (!query || typeof query !== 'string' || !query.trim()) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير كلمة البحث عبر معامل q أو query."
            });
        }

        const params = new URLSearchParams({ q: query.trim() });
        const response = await axios.get(`${YT_SEARCH}?${params.toString()}`, { timeout: 25000 });
        const data = response.data;

        if (data && data.success && data.results) {
            return res.status(200).json({
                ok: true,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
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

// ─── Download Function ────────────────────────────────────────────────
async function handleDownloadRequest(url, type, quality, res) {
    try {
        if (!url || typeof url !== 'string' || !url.trim()) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير رابط الفيديو عبر معامل url."
            });
        }

        const downloadType = type === 'audio' || type === 'mp3' ? 'audio' : 'mp4';
        
        // المحاولة 1: V2 API
        try {
            const params = new URLSearchParams({ url: url.trim(), type: downloadType });
            const response = await axios.get(`${YT_DOWNLOAD_V2}?${params.toString()}`, { timeout: 30000 });
            
            if (response.data?.success && response.data?.response) {
                return res.status(200).json({
                    ok: true,
                    creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                    model: "YouTube Downloader V2",
                    result: response.data.response
                });
            }
        } catch (v2Err) {
            console.warn('V2 Engine failed, trying fallback...', v2Err.message);
        }

        // المحاولة 2: Fallback Engine
        const fallbackParams = new URLSearchParams({ url: url.trim() });
        if (downloadType) fallbackParams.set('type', downloadType);
        if (quality) fallbackParams.set('quality', quality);

        const fbResponse = await axios.get(`${YT_DOWNLOAD_NEW}?${fallbackParams.toString()}`, { timeout: 30000 });
        
        if (fbResponse.data?.success && fbResponse.data?.response) {
            return res.status(200).json({
                ok: true,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
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

// ─── Endpoints ────────────────────────────────────────────────────────

// Main Info Endpoint
router.get('/api/youtube', (req, res) => {
    res.json({
        ok: true,
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
        message: "Sonic YouTube API Center is Online!",
        endpoints: {
            search: "/api/youtube/search?q=query",
            download: "/api/youtube/download?url=yt_url&type=mp4|audio"
        }
    });
});

// Search Endpoints
router.get('/api/youtube/search', async (req, res) => {
    const q = req.query.q || req.query.query;
    await handleSearchRequest(q, res);
});

router.post('/api/youtube/search', async (req, res) => {
    const { q, query } = req.body || {};
    await handleSearchRequest(q || query, res);
});

// Download Endpoints
router.get('/api/youtube/download', async (req, res) => {
    const url = req.query.url;
    const type = req.query.type;
    const quality = req.query.quality;
    await handleDownloadRequest(url, type, quality, res);
});

router.post('/api/youtube/download', async (req, res) => {
    const { url, type, quality } = req.body || {};
    await handleDownloadRequest(url, type, quality, res);
});

export const apiMetadata = {
    path: '/api/youtube',
    name: 'YouTube Search & Downloader (Sonic Edition)',
    type: 'downloader / youtube',
    urlExample: '/api/youtube/search?q=sonic'
};

export default router;
