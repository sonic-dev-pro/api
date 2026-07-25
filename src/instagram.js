// api/instagram.js
import express from 'express';
import axios from 'axios';

// ─── زخارف (اختيارية للردود النصية) ──────────────────────────────────────
const startDeco = `
╭━━━━━〔 ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯  〕━━━━━╮
│
│  ✦ 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽 ⃢҉ ســونـيــڪ ✦
│
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();

const endDeco = `
╭━━━━━〔 ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯  〕━━━━━╮
│
│  ⚡ 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽 & Zyro core ⚡
│
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();

const line1 = `✦ 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽 ⃢҉ ســونـيــڪ ✦`;
const line2 = `⚡ ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌`;

// ─── إعدادات الـ API الخارجي ──────────────────────────────────────────────
const DOWNREELS_API = "https://downreels.com/api/fetch.php";
const HEADERS = {
  "accept": "*/*",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  "content-type": "application/json",
  "cookie": "_ga_ECP5SKBQFR=GS2.1.s1783013499$o1$g0$t1783013499$j60$l0$h0; _ga=GA1.1.514099473.1783013500; dom3ic8zudi28v8lr6fgphwffqoz0j6c=c0d494a1-daba-4f50-8b1f-c051b8003549%3A2%3A1; cf_clearance=imwqauddDXpUML59XipbmqhUWQcpdCP_9XlNVZ10A88-1783013501-1.2.1.1-0IQpncxFmrIldU9bkr6PD8OlRrTAPCIIwJ50VwvRij37Avcgasyr6L8eR45xwKFzDO4nTFl5_wMRaAgPBHfAYxD0AGC9BS6sdt0x8FM6qVntiN73KYHgX536Z0kbp67nOPSejSvGlCATKlmykNf4IVic4klJ7VpBHv6a_prEC.w38w_kz_2twhGRLFKOix2U0yE.TQ4H0lCRJ6FPP69KXg6EHoE5I2ZAPMa8y4m0giop9BEVpzgpwSfPlIxpbNLgCrVfLZAxEa4HvWeZLXTGWW4xBOk5lde7w3aVDdtxaOIEEhzaL4brLZn7am0khNsgGrgE7uLQsJQXjdpaVzAqoA",
  "origin": "https://downreels.com",
  "pragma": "no-cache",
  "referer": "https://downreels.com/en/download-video-instagram/",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
};

// ─── الدالة الأساسية (تحتفظ بالمنطق الأصلي) ─────────────────────────────
async function handler(url) {
  if (!url) {
    throw new Error('يجب توفير رابط Instagram (معامل url)');
  }

  try {
    const response = await axios.post(DOWNREELS_API, { url }, { headers: HEADERS, timeout: 30000 });
    const data = response.data;

    if (data.status !== "ok" || !data.videos || data.videos.length === 0) {
      throw new Error('تعذر استخراج روابط التحميل المباشرة، تأكد أن الحساب عام (Public).');
    }

    const getBestVideo = (videoList) => {
      const hdVideo = videoList.find(v => v.quality && v.quality.toLowerCase().includes("hd"));
      return hdVideo ? hdVideo.url : videoList[0].url;
    };

    let result = {
      success: true,
      data: {
        type: data.videos.length === 1 ? 'single' : 'album',
        count: data.videos.length,
        videos: [],
        images: [],
        bestQuality: null
      }
    };

    if (data.videos.length === 1) {
      const videoItem = data.videos[0];
      const downloadUrl = getBestVideo(data.videos);
      result.data.bestQuality = {
        url: downloadUrl,
        quality: videoItem.quality || 'unknown'
      };
      result.data.videos.push({
        url: videoItem.url,
        isVideo: videoItem.isVideo,
        quality: videoItem.quality || 'unknown'
      });
    } else {
      for (const item of data.videos) {
        if (item.isVideo) {
          result.data.videos.push({
            url: item.url,
            quality: item.quality || 'unknown'
          });
        } else {
          result.data.images.push({
            url: item.url
          });
        }
      }
      const best = data.videos.find(v => v.isVideo && v.quality && v.quality.toLowerCase().includes("hd"));
      if (best) {
        result.data.bestQuality = {
          url: best.url,
          quality: best.quality
        };
      } else {
        const firstVideo = data.videos.find(v => v.isVideo);
        if (firstVideo) {
          result.data.bestQuality = {
            url: firstVideo.url,
            quality: firstVideo.quality || 'unknown'
          };
        }
      }
    }

    result.decoration = {
      start: startDeco,
      end: endDeco,
      line1,
      line2
    };

    return result;
  } catch (error) {
    throw new Error(`فشل تحميل الميديا: ${error.message}`);
  }
}

// ─── إنشاء Router ──────────────────────────────────────────────────────────
const router = express.Router();

// Middleware بسيط لتتبع عدد الطلبات (بدون session لأن Vercel serverless)
let requestCount = 0;

router.use((req, res, next) => {
  requestCount++;
  req.requestId = requestCount; // نضع رقم الطلب في req
  next();
});

// ─── Endpoint GET ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'يجب توفير معامل url في الاستعلام (مثال: ?url=https://...)'
      });
    }

    const result = await handler(url);
    result.meta = {
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    };
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in GET /instagram:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ داخلي في الخادم'
    });
  }
});

// ─── Endpoint POST ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'يجب إرسال كائن JSON يحتوي على حقل url'
      });
    }

    const result = await handler(url);
    result.meta = {
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    };
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in POST /instagram:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ داخلي في الخادم'
    });
  }
});

// ─── إنشاء تطبيق Express وتثبيت الـ Router ──────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/instagram', router);

// ─── تصدير التطبيق لـ Vercel ──────────────────────────────────────────────
export default app;
