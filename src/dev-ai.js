/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Dev AI Assistant - خبير ومطور هيكلة وأكواد البوت
 */

import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const BASE_DEEPSEEK_API = 'https://nikai-api-main.vercel.app/api/deepseek';

// ─── المسار الرئيسي للبوت والملفات المستبعدة ─────────────────────────────
const BOT_ROOT_DIR = process.cwd();

// مجلدات وملفات ملغاة لتفادي استهلاك التوكينات بالكامل
const IGNORED_PATHS = [
    'node_modules',
    '.git',
    'SonicSessions',
    'SonicJadiBots',
    'package-lock.json',
    '.npm',
    'tmp'
];

// الامتدادات البرمجية المسموح بقراءتها
const ALLOWED_EXTENSIONS = ['.js', '.json', '.md'];

/**
 * 📂 دالة قراءة ومسح جميع ملفات البوت البرمجية لتجميع هيكلتها
 */
function scanBotCode(dir, fileList = {}) {
    try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const relativePath = path.relative(BOT_ROOT_DIR, filePath);

            if (IGNORED_PATHS.some((ignored) => relativePath.startsWith(ignored))) {
                continue;
            }

            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                scanBotCode(filePath, fileList);
            } else {
                const ext = path.extname(file).toLowerCase();
                if (ALLOWED_EXTENSIONS.includes(ext)) {
                    // تجنب الملفات العملاقة فوق 80KB
                    if (stat.size < 80000) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        fileList[relativePath] = content;
                    }
                }
            }
        }
    } catch (e) {
        console.error('Error scanning bot files:', e.message);
    }
    return fileList;
}

async function handleDevAIRequest(userQuestion, res) {
    try {
        if (!userQuestion) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير السؤال البرمجي المطلوب عبر معامل text."
            });
        }

        // 1. تجميع أكواد وهيكلة ملفات البوت الحالية
        const projectFiles = scanBotCode(BOT_ROOT_DIR);
        let botContext = `[توجيه أخير وهام جداً للنموذج]:\n`;
        botContext += `أنت الآن مساعد برمجي خبير جداً تم إعدادك خصيصاً بواسطة المطور SONIC DEV (محمد).\n`;
        botContext += `وظيفتك هي الإجابة عن الأسئلة البرمجية الخاصة ببوت الواتساب هذا، مع الاعتماد التام والتحليل المباشر لهيكليته وأكواده المرفقة لك أسفله.\n\n`;
        botContext += `━━━ 📂 هيكلة وأكواد البوت الحالية ━━━\n\n`;

        for (const [filePath, code] of Object.entries(projectFiles)) {
            botContext += `--- FILE: ${filePath} ---\n${code}\n\n`;
        }

        botContext += `━━━ 👤 سؤال المستخدم ━━━\n`;

        // 2. دمج السياق مع السؤال
        const fullPrompt = `${botContext}${userQuestion.trim()}`;
        const encodedText = encodeURIComponent(fullPrompt);

        // 3. إرسال الطلب لسيرفر DeepSeek
        const response = await axios.get(`${BASE_DEEPSEEK_API}?text=${encodedText}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        });

        const data = response.data;
        const aiReply = data?.answer || data?.reply || data?.result || data?.text;

        if (!data || !aiReply) {
            return res.status(500).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "تعذر الحصول على إجابة من سيرفر مطور الذكاء الاصطناعي."
            });
        }

        return res.status(200).json({
            ok: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            sessionId: data.sessionId || null,
            answer: aiReply,
            file: data.file || null
        });

    } catch (error) {
        console.error('Dev AI API Error:', error.message);
        return res.status(500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ داخلي أثناء معالجة طلب Dev AI.",
            details: error.message
        });
    }
}

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/api/dev-ai', async (req, res) => {
    const text = req.query.text;
    await handleDevAIRequest(text, res);
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/api/dev-ai', async (req, res) => {
    const { text } = req.body || {};
    await handleDevAIRequest(text, res);
});

export const apiMetadata = {
    path: '/api/dev-ai',
    name: 'Sonic Dev AI Endpoint (Structure Aware)',
    type: 'ai / developer',
    urlExample: '/api/dev-ai?text=كيف اعمل امر جديد في هذا البوت؟'
};

export default router;
