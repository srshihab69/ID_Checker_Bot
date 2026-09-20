const { Telegraf, Markup } = require('telegraf');

const TOKEN = process.env.BOT_TOKEN || "8924331144:AAHkM6BvqCbasUX28AYmcJF-HQh8WpIO_CQ";
const bot = new Telegraf(TOKEN);

// সাময়িকভাবে ইউজার পাসওয়ার্ড সেভ রাখার জন্য
const userPasswords = {};

// /start কমান্ড এবং ৬টি রিপ্লাই কিবোর্ড বাটন
bot.start((ctx) => {
    const userId = ctx.from.id;
    
    if (!userPasswords[userId]) {
        userPasswords[userId] = Math.random().toString(36).substring(2, 10);
    }

    const welcomeText = (
        `👋 Hello ${ctx.from.first_name}\n\n` +
        `Welcome to BGT Wallet 💎\n\n` +
        `💰 Main Balance : 0.00 USDT\n` +
        `⏳ Hold Balance : 0.00 USDT\n\n` +
        `Select an option below to get started 👇`
    );

    const replyKeyboard = Markup.keyboard([
        ['🌾 Sell Account', '🏦 Withdrawal'],
        ['💰 Balance', 'ℹ️ Safety & Terms'],
        ['👥 Refer & Earn', '📦 My History']
    ]).resize();

    ctx.reply(welcomeText, replyKeyboard);
    
    const webappUrl = "https://your-webapp-url.com"; 
    ctx.reply("Click below to open dashboard:", Markup.inlineKeyboard([
        [Markup.button.webApp("🌐 Open WebApp", webappUrl)]
    ]));
});

// "My History" বাটনে ক্লিক করলে পাসওয়ার্ড দেখাবে
bot.hears('📦 My History', (ctx) => {
    const userId = ctx.from.id;
    const currentPass = userPasswords[userId] || "No password generated yet. Type /start";
    
    ctx.reply(
        `📦 **Your Account History & Login Details:**\n\n` +
        `🔒 Your Unique Password: \`${currentPass}\`\n` +
        `👤 Telegram ID: \`${userId}\``,
        { parse_mode: 'Markdown' }
    );
});

// বাকি বাটনগুলোর হ্যান্ডলার
bot.hears(['🌾 Sell Account', '🏦 Withdrawal', '💰 Balance', 'ℹ️ Safety & Terms', '👥 Refer & Earn'], (ctx) => {
    ctx.reply(`Apni select korechen: **${ctx.message.text}**`, { parse_mode: 'Markdown' });
});

// Vercel Serverless Function (Fixed Webhook Handler)
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            // বডি অবজেক্ট স্ট্রিং থাকলে তা পার্স করে নেওয়া
            const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            await bot.handleUpdate(update);
            return res.status(200).json({ ok: true });
        } catch (e) {
            console.error("Webhook Error:", e);
            return res.status(500).json({ error: 'Error handling update' });
        }
    } else {
        return res.status(200).send('Telegram Bot is running smoothly on Vercel!');
    }
};
