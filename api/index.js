/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Main Serverless Router (Safe & Dynamic Loader)
 */

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// قائمة الـ Modules
const apiModules = [
    'deepseek.js',
    'imagine.js',
    'suno.js',
    'islam-ai.js',
    'morph.js',
    'claude.js',
    'claude2.js',
    'simsimi.js',
    'gemini.js',
    'stalkchannel.js',
    'instagram.js',
    'youtube.js',
    'ai-image.js',
    'write.js',
    'img2prompt.js',
    'wallpaper.js',
    'ig-stalk.js',
    'record-web.js',
    'biden.js',
    'twitter.js',
    'proxy.js'
];

// تحميل المسارات بطريقة آمنة لا تكسر السيرفر
for (const file of apiModules) {
    try {
        // محاولة استدعاء الملف من مجلد src
        const module = await import(`../src/${file}`).catch(() => import(`./${file}`));
        if (module && module.default) {
            app.use(module.default);
        }
    } catch (err) {
        console.warn(`[Sonic API Warning] Failed to load ${file}:`, err.message);
    }
}

// ─── Route رئيسي للتأكد من حالة السيرفر ──────────────────────────────
app.get('/', (req, res) => {
    res.status(200).json({
        status: true,
        service: "Sonic API Center ⚡",
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ (محمد) 🇲🇦",
        message: "Sonic API Server Online & Working Perfectly!"
    });
});

app.get('/api', (req, res) => {
    res.status(200).json({
        status: true,
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
        message: "API Gateway is Active"
    });
});

// التعامل مع المسارات المفقودة 404
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
        error: "Endpoint not found on Sonic API Center."
    });
});

export default app;
