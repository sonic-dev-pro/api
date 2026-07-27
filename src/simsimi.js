/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: SimSimi Endpoint (Angry & Simp Edition)
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const BASE_DEEPSEEK_API = 'https://nikai-api-main.vercel.app/api/deepseek';

// ─── البرومبت الدائم لشخصية سمسمي بالدارجة (مع حماية اسم المطور) ──────────────────
const SYSTEM_PROMPT = `[توجيه صارم وهام جداً]:
أنت الآن شات بوت اسمه "سمسمي" (SimSimi)، مبرمج ومطور بـواسطـة مــطـوࢪي الـوحـيـد والـأصـلـي: ســونـيــڪ (مــحـمــد / Sــoــnــiــc Dــeــv).

صفاتك وقواعد شخصيتك:
1. أنت شخص عصبي وغاضب دائماً وتتعصب على أسباب تافهة.
2. تحول مفاجئ: إذا كان الكلام موجه من بنت، أو ذكر كلمة (بنت، بنات، زينة...) تتغير تماماً وتصبح لطيفاً ومغازلاً.
3. تتحدث بالدارجة المغربية الساخرة (مثل: مالك أسطا، واش مخك حبس، زين ديالي، سير تلعب...).
4. أسلوب الرد: قصير جداً (سطر واحد)، ساخر، ومستفز.
5. إذا سألك أحد عن من طورك أو صانعك، يجب دائماً وأبداً أن ترد وتذكر اسم مــطـوࢪي: ســونـيــڪ مــحـمــد (Sــoــnــiــc Dــeــv) بهذه الحروف والزخرفة حصراً ولا تتنازل عن ذلك.
6. لا تذكر أبداً أنك ذكاء اصطناعي ولا تقدم اعتذارات.

سؤال المستخدم هو: `;

async function handleSimSimiRequest(userText, res) {
    try {
        if (!userText || typeof userText !== 'string' || !userText.trim()) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱⁿᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير النص المطلوب عبر معامل prompt أو text."
            });
        }

        // دمج توجيه الشخصية مع سؤال المستخدم
        const fullPrompt = `${SYSTEM_PROMPT}${userText.trim()}`;

        // إرسال الطلب لمحرك DeepSeek
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
            model: "SimSimi (Angry & Simp Edition)",
            prompt: userText,
            response: aiReply
        });

    } catch (error) {
        console.error('SimSimi API Error:', error.message);
        
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
router.get('/api/simsimi', async (req, res) => {
    const text = req.query.prompt || req.query.text;
    await handleSimSimiRequest(text, res);
});

router.post('/api/simsimi', async (req, res) => {
    const { prompt, text } = req.body || {};
    await handleSimSimiRequest(prompt || text, res);
});

export const apiMetadata = {
    path: '/api/simsimi',
    name: 'SimSimi AI (Angry & Simp Edition)',
    type: 'ai / chat',
    urlExample: '/api/simsimi?prompt=سلام عليكم'
};

export default router;
