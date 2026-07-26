/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Main Serverless Router & Safe Dynamic Loader
 */

import express from 'express';
import cors from 'cors';

const app = express();

// ─── Middlewares الأساسية ──────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── قائمة بجميع ملفات الـ APIs الموجودة داخل مجلد src ────────────────
const apiModules = [
    'deepseek.js',
    'imagine.js',
    'suno.js',
    'islam-ai.js',
    'morph.js',
    'claude.js',
    'claude2.js',  // Claude 2 (DeepSeek Engine Edition)
    'simsimi.js',  // SimSimi (Angry & Simp Edition)
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

// ─── دالة التحميل الآمن لمنع خطأ 500 وإبقاء السيرفر شغالاً دائماً ─────────
async function loadRoutes() {
    let loadedCount = 0;
    for (const file of apiModules) {
        try {
            const module = await import(`./${file}`);
            if (module && module.default) {
                app.use(module.default);
                loadedCount++;
                console.log(`[Sonic API] Loaded successfully: ${file}`);
            }
        } catch (error) {
            console.warn(`[Sonic API Warning] Could not load ./${file}:`, error.message);
        }
    }
    console.log(`[Sonic API] Total endpoints loaded: ${loadedCount}/${apiModules.length}`);
}

// تنفيذ تحميل الـ Routes عند بداية السيرفر
await loadRoutes();

// ─── الصفحة الرئيسية للسيرفر ───────────────────────────────────────
app.get('/', (req, res) => {
    res.status(200).json({
        status: true,
        service: "Sonic API Center ⚡",
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ (محمد) 🇲🇦",
        message: "Sonic API Center Server is Online & System Protected!",
        active_endpoints: {
            deepseek: "/api/deepseek?text=سلام",
            claude2: "/api/claude2?prompt=شكون أنت",
            simsimi: "/api/simsimi?prompt=سلام"
        },
        timestamp: new Date().toISOString()
    });
});

app.get('/api', (req, res) => {
    res.status(200).json({
        status: true,
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
        message: "API Gateway active.",
        timestamp: new Date().toISOString()
    });
});

// ─── التعامل مع المسارات غير المكتشفة (404 بدلاً من 500) ───────────────
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
        error: "Endpoint not found on Sonic API Center."
    });
});

export default app;
