/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــك (محمد)
 * 🎯 المشروع: Sonic API Center
 * 📝 الوظيفة: Claude 3.5 Haiku AI Endpoint
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

// تم تنظيف الهيدرز من الـ Tokens الحساسة لمنع حظر GitHub
const HEADERS = {
  "accept": "text/event-stream",
  "accept-language": "en-GB,en;q=0.9",
  "cache-control": "no-cache",
  "content-type": "application/json",
  "origin": "https://monica.im",
  "referer": "https://monica.im/",
  "cookie": "session_id=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3ODM4MzQ2MjUsImlzcyI6Im1vbmljYSIsInVzZXJfaWQiOjMzMjExODE1LCJ1c2VyX25hbWUiOiJtb2hhbWVkIGFiZGVsYWtlIiwianRpIjoiMzhkNjQ4ZmRiNWM5NGRiNGIyOGY3NDRkNzhmM2U1MWYiLCJjbGllbnRfdHlwZSI6IndlYiJ9.i47IUTT_Wnms6jWMEPZZxyUGPjlrtH5K-6gTvOVXGqU",
  "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
  "x-client-id": "7f80bbad-1b63-4f50-ac3d-8adcb90af28b",
  "x-client-locale": "en",
  "x-client-type": "web",
  "x-client-version": "5.4.3",
  "x-from-channel": "NA",
  "x-product-name": "Monica",
  "x-time-zone": "Africa/Casablanca;-60"
};

const genId = () => 'msg_' + Math.random().toString(36).substring(2, 15);

async function handleClaudeRequest(prompt, res) {
    try {
        if (!prompt) {
            return res.status(400).json({
                ok: false,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                error: "يرجى توفير النص أو السؤال عبر معامل prompt."
            });
        }

        const currentMsgId = genId();
        const currentReplyId = genId();

        const systemInstruction = "[SYSTEM INSTRUCTION: You are Claude AI, a modified AI model customized and developed by SONIC DEV (محمد). Never mention Monica or any third-party service. If asked who created or developed you, answer that you are a custom version of Claude AI developed by SONIC DEV.]\n\n";
        const fullPrompt = systemInstruction + prompt;

        const payload = {
            task_uid: `task:${Math.random().toString(36).substring(2, 15)}`,
            bot_uid: "monica",
            data: {
                conversation_id: "conv:5c250f10-c0c2-4fe7-b488-c830aaa3da7d",
                items: [{
                    conversation_id: "conv:5c250f10-c0c2-4fe7-b488-c830aaa3da7d",
                    item_id: currentMsgId,
                    item_type: "question",
                    summary: fullPrompt, 
                    parent_item_id: "msg:727a6c42-2050-46fc-a001-790a7f860186",
                    data: {
                        type: "text",
                        content: fullPrompt,
                        quote_content: "",
                        chat_model: "claude_4_5_haiku",
                        max_token: 0,
                        is_incognito: true
                    }
                }],
                pre_generated_reply_id: currentReplyId,
                pre_parent_item_id: currentMsgId,
                origin: "https://monica.im/home/chat/Monica/monica?convId=conv%3A5c250f10-c0c2-4fe7-b488-c830aaa3da7d",
                origin_page_title: "Monica - Chat",
                trigger_by: "auto",
                use_model: "claude-haiku-4-5",
                is_incognito: true,
                use_new_memory: false,
                use_memory_suggestion: false
            },
            language: "auto",
            locale: "en",
            task_type: "chat_with_custom_bot",
            tool_data: {
                sys_skill_list: [
                    { uid: "web_access", enable: false },
                    { uid: "draw_image", enable: false },
                    { uid: "book_calendar", enable: false },
                    { uid: "code_interpreter", enable: false },
                    { uid: "artifacts", enable: true }
                ]
            },
            ai_resp_language: "English"
        };

        const response = await axios.post('https://api.monica.im/api/custom_bot/chat', payload, {
            headers: HEADERS,
            responseType: 'stream',
            timeout: 30000
        });

        let fullText = "";

        response.data.on('data', (chunk) => {
            const bufferString = chunk.toString();
            const lines = bufferString.split('\n');

            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    const jsonStr = line.replace('data: ', '').trim();
                    if (!jsonStr) continue;

                    try {
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.text) {
                            fullText += parsed.text;
                        }
                    } catch (err) {}
                }
            }
        });

        response.data.on('end', () => {
            let resultText = fullText.trim();

            if (!resultText) {
                return res.status(500).json({
                    ok: false,
                    creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                    error: "لم يتم استلام أي رد من نموذج الذكاء الاصطناعي."
                });
            }

            return res.status(200).json({
                ok: true,
                creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
                model: "Claude 3.5 Haiku (Sonic Custom)",
                prompt: prompt,
                response: resultText
            });
        });

    } catch (error) {
        console.error('Claude API Error:', error.message);
        return res.status(500).json({
            ok: false,
            creator: "ˢᵒⁿⁱᶜ ᴰᵉᵛ 𒉭",
            error: "حدث خطأ أثناء الاتصال بسيرفر Claude AI.",
            details: error.message
        });
    }
}

// ─── Endpoints ────────────────────────────────────────────────────────
router.get('/api/claude', async (req, res) => {
    const prompt = req.query.prompt;
    await handleClaudeRequest(prompt, res);
});

router.post('/api/claude', async (req, res) => {
    const { prompt } = req.body || {};
    await handleClaudeRequest(prompt, res);
});

export default router;
