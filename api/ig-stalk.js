/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 📝 الوظيفة: جلب وتحليل بيانات حسابات إنستغرام (Instagram Profile Stalker)
 * 🛡️ المطور: فول ستاك (Full Stack) - وحيد
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const INSTAGRAM_API_URL = 'https://api-nanzz.my.id/docs/api/stalker/ig-stalk.php';

// ─── الدالة الموحدة لمعالجة جلب معلومات الحساب ───────────────────────────
async function fetchInstagramProfile(usernameInput, res) {
    try {
        // 1. التحقق من توفير يوزر نيم في الطلب
        if (!usernameInput) {
            return res.status(400).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير اسم المستخدم (username) المطلوب فحصه."
            });
        }

        // 2. تنظيف اسم المستخدم من الـ @ والفراغات
        const username = usernameInput.replace(/@/g, '').trim();

        // 3. طلب البيانات من الـ API الأساسي للمزود
        const response = await axios.get(`${INSTAGRAM_API_URL}?username=${encodeURIComponent(username)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000 // مهلة 15 ثانية
        });

        const data = response.data;

        // 4. التحقق الفعلي من نجاح الاستجابة ومطابقتها للهيكلية المتوقعة
        if (!data || data.status !== true || !data.result) {
            return res.status(404).json({
                status: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "لم يتم العثور على بيانات صالحة لهذا الحساب. تأكد من صحة اليوزر نيم."
            });
        }

        const result = data.result;
        const stats = result.stats || {};

        // 5. صياغة البيانات وإرسالها بشكل JSON منظم ومحمي بحقوقك
        return res.status(200).json({
            status: true,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            result: {
                username: result.username || username,
                full_name: result.full_name || 'لا يوجد اسم',
                bio: result.bio || 'لا يوجد بايو.',
                profile_pic: result.profile_pic || '',
                is_private: !!result.is_private,
                is_verified: !!result.is_verified,
                external_url: result.external_url || 'لا يوجد رابط خارجي',
                stats: {
                    followers: stats.followers !== undefined ? stats.followers : 0,
                    following: stats.following !== undefined ? stats.following : 0,
                    posts: stats.posts !== undefined ? stats.posts : 0
                }
            }
        });

    } catch (error) {
        console.error('Instagram Stalker API Error:', error.message);
        return res.status(500).json({
            status: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ داخلي أثناء معالجة جلب معلومات حساب إنستغرام.",
            details: error.message
        });
    }
}

// ─── Endpoint GET ─────────────────────────────────────────────────────
router.get('/api/ig-stalk', async (req, res) => {
    const username = req.query.username;
    await fetchInstagramProfile(username, res);
});

// ─── Endpoint POST ────────────────────────────────────────────────────
router.post('/api/ig-stalk', async (req, res) => {
    const { username } = req.body || {};
    await fetchInstagramProfile(username, res);
});

// ─── هيكلية التصدير المنظمة والمتوافقة مع Vercel و ES Modules ───────────
export const apiMetadata = {
    path: '/api/ig-stalk',
    name: 'Instagram Profile Stalker API',
    type: 'stalker / lookup',
    urlExample: '/api/ig-stalk?username=nanazajaudah',
    logo: 'https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z'
};

// التصدير الافتراضي المطلوب لـ Vercel Routing
export default router;
