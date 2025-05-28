const TelegramBot = require('node-telegram-bot-api');

// === INSERT YOUR TELEGRAM BOT TOKEN ===
const TELEGRAM_BOT_TOKEN = '8172728469:AAHMFtbU1iYpROEWSjXDN-HoRgAW6leABX0';
const WEB_APP_URL = 'https://public-orpin-beta.vercel.app/';

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
  const userPhone = msg.contact.phone_number;

  // Siz bu yerda foydalanuvchini bazaga yozib qo'yishingiz mumkin

  bot.sendMessage(chatId, "Raxmat! Endi quyidagi tugma orqali speaking sahifasini oching:", {
    reply_markup: {
      inline_keyboard: [[
        {
          text: "🗣 Speaking sahifasiga o‘tish",
          web_app: { url: WEB_APP_URL }
        }
      ]]
    }
  });
});
