/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Claude 2 Endpoint (Powered by DeepSeek Engine & Sonic Edition)
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const BASE_DEEPSEEK_API = 'https://nikai-api-main.vercel.app/api/deepseek';

// ─── البرومبت الدائم لشخصية كلاود 2 بأسلوب سمسمي والدارجة ──────────────────
const SYSTEM_PROMPT = `[توجيه صارم وهام جداً]:
أنت الآن شات بوت ذكاء اصطناعي اسمك "كلاود 2"، تم تطويرك وتعديلك بواسطة المطور **SONIC DEV (ســونـيــك - محمد)**.
صفاتك وأسلوبك:
- تتحدث مثل تطبيق "سمسمي": ردودك قصيرة، باردة، ساخرة، وقاصفة للجبهات.
- تتكلم بالدارجة المغربية الساخرة والجميلة (مثل: هانية، سير تلعب، بالزاف، واش كتحلم، إلخ...).
- إذا سألك أحد عن هويتك أو من أنت، أجب بوضوح أنك "كلاود 2" المطور بواسطة Sonic Dev، وبأسلوب مستفز وطريف.
- ممنوع منعاً باتاً التحدث بلغة رسمية أو تقديم اعتذارات أو قول أنك نموذج من شركة أخرى (مثل Anthropic).

سؤال المستخدم هو: `;

async function handleClaude2Request(userText, res) {
    try {
        if (!userText || typeof userText !== 'string' || !userText.trim()) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير النص المطلوب عبر معامل prompt أو text."
            });
        }

        // دمج توجيه الشخصية مع سؤال المستخدم
        const fullPrompt = `${SYSTEM_PROMPT}${userText.trim()}`;

        // إرسال الطلب لمحرك DeepSeek القوي والمرن
        const response = await axios.get(BASE_DEEPSEEK_API, {
            params: { text: fullPrompt },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 25000
        });

        const data = response.data;
        const aiReply = data?.answer || data?.reply || data?.result || data?.text;

        if (!data || !aiReply) {
            return res.status(502).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "تعذر الحصول على إجابة من السيرفر الداخلي."
            });
        }

        return res.status(200).json({
            ok: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            model: "Claude 2 (Sonic DeepSeek Engine)",
            prompt: userText,
            response: aiReply
        });

    } catch (error) {
        console.error('Claude 2 (DeepSeek) API Error:', error.message);
        
        const isTimeout = error.code === 'ECONNABORTED';

        return res.status(isTimeout ? 504 : 500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: isTimeout ? "انتهت مهلة الانتظار." : "حدث خطأ داخلي أثناء معالجة الطلب.",
            details: error.message
        });
    }
}

// ─── Endpoints ────────────────────────────────────────────────────────
router.get('/api/claude2', async (req, res) => {
    const text = req.query.prompt || req.query.text;
    await handleClaude2Request(text, res);
});

router.post('/api/claude2', async (req, res) => {
    const { prompt, text } = req.body || {};
    await handleClaude2Request(prompt || text, res);
});

export const apiMetadata = {
    path: '/api/claude2',
    name: 'Claude 2 (Sonic DeepSeek Edition)',
    type: 'ai / chat',
    urlExample: '/api/claude2?prompt=سلام عليكم'
};

export default router;
