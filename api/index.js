import express from 'express';

// استيراد الـ APIs من المجلد الجديد src
import deepseekRouter from '../src/deepseek.js';
import imagineRouter from '../src/imagine.js';
import sunoRouter from '../src/suno.js';
import stalkchannelRouter from '../src/stalkchannel.js';
import instagramRouter from '../src/instagram.js';
import youtubeRouter from '../src/youtube.js';
import aiImageRouter from '../src/ai-image.js';
import writeRouter from '../src/write.js';
import img2promptRouter from '../src/img2prompt.js';
import wallpaperRouter from '../src/wallpaper.js';
import igStalkRouter from '../src/ig-stalk.js';
import recordWebRouter from '../src/record-web.js';
import bidenRouter from '../src/biden.js';
import twitterRouter from '../src/twitter.js';
import proxyRouter from '../src/proxy.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// استخدام الـ Routers
app.use(deepseekRouter);
app.use(imagineRouter);
app.use(sunoRouter);
app.use(stalkchannelRouter);
app.use(instagramRouter);
app.use(youtubeRouter);
app.use(aiImageRouter);
app.use(writeRouter);
app.use(img2promptRouter);
app.use(wallpaperRouter);
app.use(igStalkRouter);
app.use(recordWebRouter);
app.use(bidenRouter);
app.use(twitterRouter);
app.use(proxyRouter);

export default app;
