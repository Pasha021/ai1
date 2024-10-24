const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // بارگذاری متغیرهای محیطی از فایل .env

// دریافت توکن‌ها از متغیرهای محیطی
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL_ENDPOINT = 'https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B'; // URL مدل Hugging Face

// تنظیم بات تلگرام
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// راه‌اندازی سرور Express
const app = express();
app.use(express.json());

// تابعی برای تولید پاسخ از Hugging Face API
async function generateResponse(message) {
    try {
        const response = await axios.post(MODEL_ENDPOINT, {
            inputs: message,
        }, {
            headers: { 'Authorization': `Bearer ${HUGGINGFACE_API_KEY}` }
        });

        // برگرداندن متن تولید شده
        return response.data[0].generated_text;
    } catch (error) {
        console.error('Error with Hugging Face API:', error);
        return "متاسفانه مشکلی در پردازش درخواست شما پیش آمد.";
    }
}

// مدیریت پیام‌های تلگرام
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    // دریافت پاسخ از مدل هوش مصنوعی
    const aiResponse = await generateResponse(userMessage);

    // ارسال پاسخ به کاربر
    bot.sendMessage(chatId, aiResponse);
});

// راه‌اندازی سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
