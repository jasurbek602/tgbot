require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const { User } = require('./bot/models/User');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

mongoose.connect('mongodb+srv://tred005t:Colline@cluster0.pts8wns.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("MongoDB connected."))
  .catch(err => console.error("❌ MongoDB xatosi:", err));;

const bot = new TelegramBot('8172728469:AAHMFtbU1iYpROEWSjXDN-HoRgAW6leABX0', { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Iltimos, telefon raqamingizni yuboring.', {
    reply_markup: {
      keyboard: [[{ text: "Raqamni yuborish", request_contact: true }]],
      one_time_keyboard: true
    }
  });
});

bot.on("contact", async (msg) => {
  const chatId = msg.chat.id;
  const phone = msg.contact.phone_number;
  const tgId = msg.from.id;

  let user = await User.findOne({ telegramId: tgId });
  if (!user) {
    user = new User({ telegramId: tgId, phone });
    await user.save();
  }

  bot.sendMessage(chatId, "Ro'yxatdan o'tdingiz! Endi audio yuborishingiz mumkin.");
});

bot.on("voice", async (msg) => {
  const fileId = msg.voice.file_id;
  const chatId = msg.chat.id;
  const task = 'task1'; // Example: always task1, can be dynamic

  try {
    const file = await bot.getFileLink(fileId);
    const response = await axios.get(file, { responseType: 'stream' });
    const tempPath = `./temp/${fileId}.ogg`;

    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    writer.on("finish", async () => {
      const form = new FormData();
      form.append("audio", fs.createReadStream(tempPath));
      form.append("task", task);

      const res = await axios.post(`tgbot-production-ca44.up.railway.app/api/audio/upload`, form, {
        headers: form.getHeaders()
      });

      bot.sendMessage(chatId, `Matn: ${res.data.transcription}

Baholash: ${res.data.evaluation}`);
      fs.unlinkSync(tempPath);
    });
  } catch (e) {
    bot.sendMessage(chatId, "Xatolik yuz berdi.");
    console.error(e);
  }
});
