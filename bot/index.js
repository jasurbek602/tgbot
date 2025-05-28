// === Telegram bot ===
const TelegramBot = require('node-telegram-bot-api');

// === Express API ===
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
const FormData = require('form-data');

// === Tokenlar va sozlamalar ===
const TELEGRAM_BOT_TOKEN = '8172728469:AAHMFtbU1iYpROEWSjXDN-HoRgAW6leABX0';
const OPENAI_API_KEY = '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';
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
const storage = multer.memoryStorage();
const upload = multer({ storage });

// === Telegram Bot sozlanmasi ===
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Iltimos, telefon raqamingizni yuboring:', {
    reply_markup: {
      keyboard: [[{ text: "📱 Raqamni yuborish", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  const webAppUrl = 'https://public-orpin-beta.vercel.app/'; // <-- o'zingizning Web App URL

  bot.sendMessage(chatId, "Raxmat! Endi sahifaga o‘ting:", {
    reply_markup: {
      inline_keyboard: [[{ text: "🗣 Web App", web_app: { url: webAppUrl } }]]
    }
  });
});

// === API: /upload ===
app.post('/upload', upload.single('audio'), async (req, res) => {
  const audioBuffer = req.file?.buffer;

  if (!audioBuffer) {
    return res.status(400).json({ error: 'Audio fayl topilmadi' });
  }

  try {
    const form = new FormData();
    form.append('file', audioBuffer, {
      filename: 'speech.webm',
      contentType: 'audio/webm'
    });
    form.append('model', 'whisper-1');

    console.log('📤 Whisper API ga yuborilmoqda...');

    const whisperRes = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${OPENAI_API_KEY}`
      }
    });

    const transcript = whisperRes.data.text;
    console.log('📜 Transkript:', transcript);

    // GPT baholash
    const criteria = `Evaluate the speaking response based on:
• Grammar: Some simple structures, with frequent basic mistakes.
• Vocabulary: Sufficient but awkward at times.
• Pronunciation: Mispronunciations noticeable, strain to understand.
• Fluency: Many pauses and restarts, but meaning is clear.
Give score 0–5 and a short feedback.`;

    const gptRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a speaking test evaluator.' },
        { role: 'user', content: `Transcript: "${transcript}"\n\n${criteria}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const feedback = gptRes.data.choices[0].message.content.trim();
    console.log('✅ GPT baho:', feedback);

    res.json({ transcript, feedback });
  } catch (err) {
    console.error('❌ Xatolik:', err.response?.data || err.message);
    res.status(500).json({ error: 'Baholashda xatolik yuz berdi' });
  }
});

// === Express serverni ishga tushurish ===
app.listen(PORT, () => {
  console.log(`✅ Server va Bot ishlayapti: http://localhost:${PORT}`);
});
