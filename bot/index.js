const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// === INSERT YOUR TOKENS HERE ===
const TELEGRAM_BOT_TOKEN = '8172728469:AAHMFtbU1iYpROEWSjXDN-HoRgAW6leABX0';
const API_URL = 'https://tgbot-production-ca44.up.railway.app'; // Railway backend URL

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Salom! Audio yuboring va men uni baholayman.");
});

bot.on('voice', async (msg) => {
  const fileId = msg.voice.file_id;
  const chatId = msg.chat.id;

  try {
    const file = await bot.getFileLink(fileId);
    const response = await axios.get(file, { responseType: 'stream' });
    const tempPath = `./temp_${fileId}.ogg`;

    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    writer.on("finish", async () => {
      const form = new FormData();
      form.append("audio", fs.createReadStream(tempPath));
      form.append("task", "task1");

      const res = await axios.post(`${API_URL}/api/audio/upload`, form, {
        headers: form.getHeaders()
      });

      bot.sendMessage(chatId, `Matn: ${res.data.transcription}\n\nBaholash: ${res.data.evaluation}`);
      fs.unlinkSync(tempPath);
    });
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "Xatolik yuz berdi.");
  }
});
