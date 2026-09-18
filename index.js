const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

const token = process.env.BOT_TOKEN;

if (!token) {
    throw new Error('BOT_TOKEN environment variable is missing');
}

const bot = new TelegramBot(token);

const app = express();
app.use(bodyParser.json());


// ======================================================
// PREMIUM CUSTOM EMOJI IDs
// ======================================================

const PREMIUM_EMOJIS = {
    key: '5801033656067689620',
    lightning: '4913924700997944205',
    lock: '5208942559996429366',
    discount: '5197373721987260587',
    gift: '5386783304454258561',
    support: '6217489739675604129',
    check: '593354413740403607',
    star: '6188364681678163125'
};


// ======================================================
// PREMIUM EMOJI WELCOME FUNCTION (FIXED)
// ======================================================

function createPremiumWelcome(name) {
    let text = '';
    const entities = [];

    // একটি করে ইনভিজিবল ক্যারেক্টার যোগ করে তার ঠিক আগের পজিশনে entity push করা
    function premiumEmoji(id) {
        const offset = Array.from(text).length; // UTF-16 safe length calculation
        text += ' '; // Fixed width space or placeholder character for custom emoji
        entities.push({
            type: 'custom_emoji',
            offset: offset,
            length: 1,
            custom_emoji_id: id
        });
    }

    text += `Welcome, ${name}\n\n`;

    premiumEmoji(PREMIUM_EMOJIS.star);
    text += ' — Dragonor Army STORE — ';
    premiumEmoji(PREMIUM_EMOJIS.star);
    text += '\n\n';

    premiumEmoji(PREMIUM_EMOJIS.key);
    text += ' Premium All Best Mod Keys\n';

    premiumEmoji(PREMIUM_EMOJIS.lightning);
    text += ' Instant Delivery 24/7\n';

    premiumEmoji(PREMIUM_EMOJIS.lock);
    text += ' 100% Secure Payment\n';

    premiumEmoji(PREMIUM_EMOJIS.discount);
    text += ' Best Prices Guaranteed\n';

    premiumEmoji(PREMIUM_EMOJIS.gift);
    text += ' High Discount Rewards\n';

    premiumEmoji(PREMIUM_EMOJIS.support);
    text += ' Active Support For Set-Up\n\n\n';

    text += '━━━━━━━━━━━━━━━━━━━━\n\n';

    premiumEmoji(PREMIUM_EMOJIS.check);
    text += ' Tap Shop Now to Start!';

    return {
        text,
        entities
    };
}


// ======================================================
// MAIN KEYBOARD
// ======================================================

const mainKeyboard = {
    reply_markup: {
        keyboard: [
            [
                {
                    text: '👤 User Info',
                    request_users: {
                        request_id: 101,
                        user_is_bot: false
                    }
                }
            ],
            [
                { text: '🆔 My Info' },
                { text: '☎️ Support' }
            ]
        ],
        resize_keyboard: true
    }
};


// ======================================================
// WEBHOOK
// ======================================================

app.post('/api/webhook', async (req, res) => {
    try {
        const msg = req.body.message;
        if (!msg) {
            return res.sendStatus(200);
        }

        const chatId = msg.chat.id;

        // 1. /start COMMAND
        if (msg.text === '/start') {
            const name = msg.from.first_name || msg.from.username || 'User';
            const welcome = createPremiumWelcome(name);

            await bot.sendMessage(
                chatId,
                welcome.text,
                {
                    entities: welcome.entities,
                    reply_markup: mainKeyboard.reply_markup
                }
            );
        }
        // বাকী রাউটগুলো অপরিবর্তিত থাকবে...
        
    } catch (err) {
        console.error('Webhook Error:', err);
    }

    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('ID Checker Bot is Active');
});
