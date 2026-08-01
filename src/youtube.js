/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: YouTube Downloader & Search Router (Multi-Server Fallback Engine)
 */

import express from 'express';
import axios from 'axios';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { pipeline } from 'stream/promises';

const router = express.Router();

const API_BASE = 'https://engez.a7a.online/api/v1';
const YT_SEARCH = `${API_BASE}/search/youtube`;
const YT_DOWNLOAD_V2 = `${API_BASE}/download/youtubev2`;
const YT_DOWNLOAD_NEW = `${API_BASE}/download/ytdl`;
const YT_DOWNLOAD_OLD = `${API_BASE}/download/youtube`;

const DOWNLOAD_TIMEOUT_MS = 120 * 1000;

// ─── الدوال المساعدة لتنسيق واستخراج البيانات ──────────────────────────
function normalizeDownloadUrl(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

function normalizePayload(payload) {
    return {
        title: payload?.title || null,
        thumbnail: payload?.thumbnail || null,
        download_url: normalizeDownloadUrl(payload?.download_url || payload?.downloadUrl),
        type: payload?.type === 'audio' || payload?.type === 'mp3' ? 'audio' : 'mp4',
        requested_quality: payload?.requested_quality || payload?.quality || null,
        file_size_bytes: payload?.file_size_bytes || payload?.fileSizeBytes || null,
        source_used: payload?.source_used || payload?.source || 'unknown',
        is_fallback: Boolean(payload?.is_fallback)
    };
}

// ─── محركات التحميل والبحث ───────────────────────────────────────────
async function searchYouTube(query) {
    const params = new URLSearchParams({ q: query });
    const response = await axios.get(`${YT_SEARCH}?${params.toString()}`, {
        timeout: 30000
    });

    if (!response.data?.success) {
        throw new Error(response.data?.error || 'لم يتم العثور على نتائج للبحث.');
    }

    return response.data.results || [];
}

async function fetchFromV2(url, type) {
    const params = new URLSearchParams({ url, type });
    const { data } = await axios.get(`${YT_DOWNLOAD_V2}?${params.toString()}`, {
        timeout: DOWNLOAD_TIMEOUT_MS
    });

    if (!data?.success || !data.response) {
        throw new Error(data?.error || 'فشل خادم التحميل السريع (V2).');
    }

    const r = data.response;
    const payload = normalizePayload({
        title: r.title,
        thumbnail: r.thumbnail,
        download_url: r.download_url || r.downloadUrl,
        type: r.type,
        requested_quality: r.requested_quality || r.quality,
        file_size_bytes: r.file_size_bytes || r.fileSizeBytes,
        source_used: r.source || 'youtubev2'
    });

    if (!payload.download_url) throw new Error('الرابط المسترجع غير صالح.');
    return payload;
}

async function fetchFromNewApi(url, type, quality) {
    const params = new URLSearchParams({ url });
    if (type) params.set('type', type);
    if (quality) params.set('quality', quality);

    const { data } = await axios.get(`${YT_DOWNLOAD_NEW}?${params.toString()}`, {
        timeout: DOWNLOAD_TIMEOUT_MS
    });

    if (!data?.success || !data.response) {
        throw new Error(data?.error || 'فشل المصدر الأول (ytdl).');
    }

    const r = data.response;
    const payload = normalizePayload({
        title: r.title,
        thumbnail: r.thumbnail,
        download_url: r.download_url || r.downloadUrl,
        type: r.type,
        requested_quality: r.requested_quality || r.quality || quality,
        file_size_bytes: r.file_size_bytes || r.fileSizeBytes,
        source_used: r.source || 'ytdl'
    });

    if (!payload.download_url) throw new Error('رابط المصدر الأول غير صالح.');
    return payload;
}

async function fetchFromOldApi(url, type, quality) {
    const params = new URLSearchParams({ url });
    if (type) params.set('type', type);
    if (quality) params.set('quality', quality);

    const { data } = await axios.get(`${YT_DOWNLOAD_OLD}?${params.toString()}`, {
        timeout: DOWNLOAD_TIMEOUT_MS
    });

    if (!data?.success) {
        throw new Error(data?.error || 'فشل المصدر الاحتياطي (youtube).');
    }

    const d = data.data || data.response || {};
    const payload = normalizePayload({
        title: d.title,
        thumbnail: d.thumbnail,
        download_url: d.download_url || d.downloadUrl,
        type: d.type,
        requested_quality: d.requested_quality || d.quality || quality,
        file_size_bytes: d.file_size_bytes || d.fileSizeBytes,
        source_used: d.source || 'youtube',
        is_fallback: true
    });

    if (!payload.download_url) throw new Error('رابط المصدر الاحتياطي غير صالح.');
    return payload;
}

async function fetchFromFallbackChain(url, type, quality) {
    try {
        return await fetchFromNewApi(url, type, quality);
    } catch (e) {
        return await fetchFromOldApi(url, type, quality);
    }
}

// ─── أدوات المعالجة والتنزيل المباشر المتقدم ────────────────────────────
async function downloadToFile(fileUrl, filePath) {
    const safeUrl = normalizeDownloadUrl(fileUrl);
    if (!safeUrl) throw new Error('رابط التحميل غير صالح.');

    const response = await axios.get(safeUrl, {
        responseType: 'stream',
        timeout: DOWNLOAD_TIMEOUT_MS,
        maxRedirects: 5,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    });

    await pipeline(response.data, createWriteStream(filePath));
}

function runFfmpeg(args) {
    return new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
        let err = '';
        ff.stderr.on('data', (chunk) => { err += chunk.toString(); });
        ff.on('error', reject);
        ff.on('close', (code) => {
            if (code === 0) return resolve();
            reject(new Error(`FFmpeg Exited Code ${code}: ${err}`));
        });
    });
}

async function prepareMediaFile(payload) {
    const safePayload = normalizePayload(payload);
    if (!safePayload.download_url) throw new Error('API لم ترجع رابط تحميل صالح');

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ytdl-api-'));
    const id = crypto.randomBytes(6).toString('hex');

    const srcPath = path.join(tmpDir, `source-${id}.bin`);
    const videoPath = path.join(tmpDir, `video-${id}.mp4`);
    const audioPath = path.join(tmpDir, `audio-${id}.mp3`);

    await downloadToFile(safePayload.download_url, srcPath);

    const isVideo = safePayload.type === 'mp4';

    if (isVideo) {
        try {
            await runFfmpeg([
                '-y', '-i', srcPath,
                '-fflags', '+genpts',
                '-movflags', '+faststart',
                '-c:v', 'libx264',
                '-preset', 'veryfast',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-pix_fmt', 'yuv420p',
                videoPath
            ]);
            return { filePath: videoPath, tmpDir, mimetype: 'video/mp4', filename: `${safePayload.title || 'video'}.mp4` };
        } catch (e) {
            return { filePath: srcPath, tmpDir, mimetype: 'video/mp4', filename: `${safePayload.title || 'video'}.mp4` };
        }
    }

    try {
        await runFfmpeg([
            '-y', '-i', srcPath,
            '-vn',
            '-c:a', 'libmp3lame',
            '-b:a', '192k',
            audioPath
        ]);
        return { filePath: audioPath, tmpDir, mimetype: 'audio/mpeg', filename: `${safePayload.title || 'audio'}.mp3` };
    } catch (e) {
        return { filePath: srcPath, tmpDir, mimetype: 'audio/mpeg', filename: `${safePayload.title || 'audio'}.mp3` };
    }
}

// ─── API Routes Handlers ──────────────────────────────────────────────

// 1. بحث يوتيوب
async function handleSearch(req, res) {
    const q = req.query.q || req.query.query || req.body?.q || req.body?.query;
    if (!q) {
        return res.status(400).json({ ok: false, creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭", error: "يرجى كتابة نص للبحث عبر المعامل q." });
    }

    try {
        const results = await searchYouTube(q);
        return res.status(200).json({
            ok: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            query: q,
            count: results.length,
            results: results
        });
    } catch (error) {
        return res.status(500).json({ ok: false, creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭", error: error.message });
    }
}

// 2. الحصول على رابط التحميل (JSON Payload)
async function handleDownloadInfo(req, res) {
    const url = req.query.url || req.body?.url;
    const type = req.query.type || req.body?.type || 'mp4'; // mp4 or audio/mp3
    const quality = req.query.quality || req.body?.quality;
    const engine = req.query.engine || req.body?.engine || 'v2'; // v2 or fallback

    if (!url) {
        return res.status(400).json({ ok: false, creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭", error: "يرجى توفير رابط يوتيوب عبر المعامل url." });
    }

    try {
        let payload;
        if (engine === 'v2') {
            payload = await fetchFromV2(url, type);
        } else {
            payload = await fetchFromFallbackChain(url, type, quality);
        }

        return res.status(200).json({
            ok: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            result: payload
        });
    } catch (error) {
        return res.status(500).json({ ok: false, creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭", error: error.message });
    }
}

// 3. التحميل المباشر للفيلم/الصوت (Direct Stream Engine)
async function handleDirectStream(req, res) {
    const url = req.query.url || req.body?.url;
    const type = req.query.type || req.body?.type || 'mp4';
    const quality = req.query.quality || req.body?.quality;

    if (!url) {
        return res.status(400).json({ ok: false, creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭", error: "يرجى توفير رابط يوتيوب عبر المعامل url." });
    }

    let preparedData = null;
    try {
        let payload;
        try {
            payload = await fetchFromV2(url, type);
        } catch {
            payload = await fetchFromFallbackChain(url, type, quality);
        }

        preparedData = await prepareMediaFile(payload);

        res.setHeader('Content-Type', preparedData.mimetype);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(preparedData.filename)}"`);

        return res.sendFile(preparedData.filePath, async (err) => {
            if (preparedData?.tmpDir) {
                await fs.rm(preparedData.tmpDir, { recursive: true, force: true }).catch(() => {});
            }
        });

    } catch (error) {
        if (preparedData?.tmpDir) {
            await fs.rm(preparedData.tmpDir, { recursive: true, force: true }).catch(() => {});
        }
        return res.status(500).json({ ok: false, creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭", error: error.message });
    }
}

// ─── Endpoints ────────────────────────────────────────────────────────
router.get('/api/youtube/search', handleSearch);
router.post('/api/youtube/search', handleSearch);

router.get('/api/youtube/download', handleDownloadInfo);
router.post('/api/youtube/download', handleDownloadInfo);

router.get('/api/youtube/stream', handleDirectStream);
router.post('/api/youtube/stream', handleDirectStream);

export const apiMetadata = {
    path: '/api/youtube',
    name: 'Sonic YouTube Downloader & Search Engine',
    type: 'downloader / youtube',
    urlExample: '/api/youtube/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&type=audio'
};

export default router;
