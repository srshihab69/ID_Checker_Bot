const { Telegraf, Markup } = require('telegraf');

const TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";
const bot = new Telegraf(TOKEN);

// সাময়িকভাবে ইউজার পাসওয়ার্ড সেভ রাখার জন্য (প্রোডাকশনে ডেটাবেস ব্যবহার করবেন)
const userPasswords = {};

// /start কমান্ড এবং ৬টি রিপ্লাই কিবোর্ড বাটন
bot.start((ctx) => {
    const userId = ctx.from.id;
    
    // ইউনিক পাসওয়ার্ড তৈরি (যদি আগে না থাকে)
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

    // ৬টি রিপ্লাই কিবোর্ড বাটন
    const replyKeyboard = Markup.keyboard([
        ['🌾 Sell Account', '🏦 Withdrawal'],
        ['💰 Balance', 'ℹ️ Safety & Terms'],
        ['👥 Refer & Earn', '📦 My History']
    ]).resize();

    ctx.reply(welcomeText, replyKeyboard);
    
    // নিচে ওয়েব অ্যাপের জন্য ইনলাইন বাটন
    const webappUrl = "https://your-webapp-url.com"; // এখানে আপনার ওয়েব অ্যাপ লিংক বসাবেন
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

// Vercel Serverless Function এক্সপোর্ট (Webhook হ্যান্ডেল করার জন্য)
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ ok: true });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Error handling update' });
        }
    } else {
        res.status(200).send('Telegram Bot is running smoothly on Vercel!');
    }
};
