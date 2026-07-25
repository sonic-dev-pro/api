/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Main Serverless Router (Safe & Dynamic Loader)
 */

import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// قائمة بجميع ملفات الـ APIs الموجودة في مجلد src
const apiModules = [
    'deepseek.js',
    'imagine.js',
    'suno.js',
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

// دالة التحميل الآمن لمنع خطأ 500 وإبقاء السيرفر شغالاً دائماً
async function loadRoutes() {
    for (const file of apiModules) {
        try {
            const module = await import(`../src/${file}`);
            if (module && module.default) {
                app.use(module.default);
                console.log(`[Sonic API] Loaded successfully: ${file}`);
            }
        } catch (error) {
            console.warn(`[Sonic API Warning] Could not load ../src/${file}:`, error.message);
        }
    }
}

// تنفيذ تحميل الـ Routes
await loadRoutes();

// ─── الصفحة الرئيسية للتحقق من حالة السيرفر ───────────────────────────────
app.get('/api', (req, res) => {
    res.json({
        status: true,
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
        message: "Sonic API Center Server is Online & Running System Protected!",
        timestamp: new Date().toISOString()
    });
});

// التعامل مع المسارات غير المكتشفة (404 بدلاً من 500)
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
        error: "Endpoint not found on Sonic API Center."
    });
});

export default app;
