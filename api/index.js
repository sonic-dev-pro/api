/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Main Serverless Router (Safe & Dynamic Loader)
 */

import express from 'express';

const app = express();

// 💡 زيادة الحد الأقصى لحجم البيانات المقبولة إلى 10MB لمنع خطأ 413 Payload Too Large
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const apiModules = [
    'deepseek.js',
    'deepseek2.js',
    'dev-ai.js',
    'imagine.js',
    'suno.js',
    'sono.js',
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

async function loadRoutes() {
    for (const file of apiModules) {
        try {
            const module = await import(`./src/${file}`);
            if (module && module.default) {
                app.use(module.default);
                console.log(`[Sonic API] Loaded successfully: ${file}`);
            }
        } catch (error) {
            console.warn(`[Sonic API Warning] Could not load ./src/${file}:`, error.message);
        }
    }
}

await loadRoutes();

app.get('/api', (req, res) => {
    res.json({
        status: true,
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
        message: "Sonic API Center Server is Online & System Protected!",
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json({
        ok: false,
        creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
        error: "Endpoint not found on Sonic API Center."
    });
});

export default app;
