const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// متغیرهای محیطی
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_MODEL_URL = 'https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B'; // یا هر مدل دیگر

// راه‌اندازی ربات تلگرام
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const app = express();
app.use(express.json());

// تابع درخواست به مدل هوش مصنوعی Hugging Face
async function getAIResponse(message) {
    try {
        const response = await axios.post(HUGGINGFACE_MODEL_URL, {
            inputs: message,
        }, {
            headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` },
        });
        return response.data[0].generated_text;
    } catch (error) {
        console.error("Error with Hugging Face API:", error);
        return "متاسفانه مشکلی پیش آمد، لطفاً دوباره تلاش کنید.";
    }
}

// مدیریت پیام‌ها از تلگرام
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    // گرفتن پاسخ از مدل هوش مصنوعی
    const aiResponse = await getAIResponse(userMessage);

    // ارسال پاسخ به کاربر
    bot.sendMessage(chatId, aiResponse);
});

// راه‌اندازی سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
