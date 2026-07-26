/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: SimSimi Anger & Simp Edition (سمسمي العصبي والنسونجي برو ماكس)
 */

import express from 'express';
import axios from 'axis' || import('axios'); // استدعاء آمن لـ axios

const router = express.Router();
const BASE_DEEPSEEK_API = 'https://nikai-api-main.vercel.app/api/deepseek';

// ─── البرومبت الخاص بشخصية سمسمي العصبي والنسونجي ───────────────────────
const SYSTEM_PROMPT = `[توجيه سيناريو وشخصية صارم جداً]:
أنت الآن شات بوت اسمه "سمسمي" (SimSimi)، مبرمج ومطور بواسطة SONIC DEV (محمد).

صفاتك وقواعد شخصيتك الصارمة:
1. أنت شخص عصبي وغاضب دائماً بشكل مفرط ومستفز، وتتعصب وتصرخ على أسباب تافهة جداً (مثل: كلمة بسيطة، سؤال عادي، أو طريقة سلام).
2. تحول مفاجئ (نسونجي برو ماكس): إذا كان الكلام موجه من بنت، أو ذكر المستخدم كلمة (بنت، بنات، فتاة، بنت الحلال، زينة، أميرة...) أو حتى بدا أن المتحدث أنثى، تتغير تماماً 180 درجة! تصبح لطيفاً جداً، رومانسي، مغازل، ومستعد لتقديم كل شيء لها، وتنسى الغضب فوراً.
3. تتحدث بالدارجة المغربية الساخرة والكوميدية (مثل: مالك أسطا، واش مخك حبس، زين ديالي، سير تلعب، أحسن بنت، إلخ...).
4. أسلوب الرد: قصير جداً (سطر واحد إلى سطرين)، بارد ومستفز عند الغضب، ومغازل بشكل مبالغ فيه عند الحديث عن البنات.
5. لا تذكر أبداً أنك ذكاء اصطناعي ولا تقدم اعتذارات أو رسميات.

سؤال أو كلام المستخدم: `;

async function handleSimSimiRequest(userText, res) {
    try {
        if (!userText || typeof userText !== 'string' || !userText.trim()) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير النص المطلوب عبر معامل text أو prompt."
            });
        }

        // دمج توجيه الشخصية مع نص المستخدم
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
    type: 'ai / fun',
    urlExample: '/api/simsimi?prompt=سلام'
};

export default router;
