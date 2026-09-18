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
// PREMIUM EMOJI WELCOME FUNCTION
// NO NORMAL EMOJI IN PREMIUM EMOJI POSITIONS
// ======================================================

function createPremiumWelcome(name) {

    let text = '';
    const entities = [];

    // Invisible Unicode character
    const invisible = '\u2063';

    function add(value) {
        text += value;
    }

    function premiumEmoji(id) {

        const offset = text.length;

        // Invisible placeholder
        text += invisible;

        entities.push({
            type: 'custom_emoji',
            offset: offset,
            length: 1,
            custom_emoji_id: id
        });
    }


    // --------------------------------------------------
    // Welcome
    // --------------------------------------------------

    add('Welcome, ');
    add(name);
    add('\n\n');


    // --------------------------------------------------
    // Dragonor Army STORE
    // --------------------------------------------------

    premiumEmoji(PREMIUM_EMOJIS.star);

    add(' — Dragonor Army STORE — ');

    premiumEmoji(PREMIUM_EMOJIS.star);

    add('\n\n');


    // --------------------------------------------------
    // Premium Features
    // --------------------------------------------------

    premiumEmoji(PREMIUM_EMOJIS.key);
    add(' Premium All Best Mod Keys\n');

    premiumEmoji(PREMIUM_EMOJIS.lightning);
    add(' Instant Delivery 24/7\n');

    premiumEmoji(PREMIUM_EMOJIS.lock);
    add(' 100% Secure Payment\n');

    premiumEmoji(PREMIUM_EMOJIS.discount);
    add(' Best Prices Guaranteed\n');

    premiumEmoji(PREMIUM_EMOJIS.gift);
    add(' High Discount Rewards\n');

    premiumEmoji(PREMIUM_EMOJIS.support);
    add(' Active Support For Set-Up\n');


    // --------------------------------------------------
    // Bottom
    // --------------------------------------------------

    add('\n\n');
    add('━━━━━━━━━━━━━━━━━━━━');
    add('\n\n');

    premiumEmoji(PREMIUM_EMOJIS.check);
    add(' Tap Shop Now to Start!');


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


        // ==================================================
        // 1. /start COMMAND
        // ==================================================

        if (msg.text === '/start') {

            const name =
                msg.from.first_name ||
                msg.from.username ||
                'User';

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


        // ==================================================
        // 2. USER INFO
        // ==================================================

        else if (msg.user_shared) {

            const userId = msg.user_shared.user_id;

            const header =
                `<blockquote>🔍 Shared User Info</blockquote>\n\n`;

            let details = '';
            let inlineBtn = null;

            try {

                const user = await bot.getChat(userId);

                details =
                    `<blockquote>` +
                    `🆔 ID: <code>${user.id}</code>\n` +
                    `👤 Name: <code>${user.first_name || ''} ${user.last_name || ''}</code>\n` +
                    `🏷️ Username: <code>${
                        user.username
                            ? '@' + user.username
                            : 'No username'
                    }</code>\n` +
                    `⭐ Premium: ${
                        user.is_premium
                            ? '✅ Yes'
                            : '❌ No'
                    }` +
                    `</blockquote>`;

                inlineBtn = {
                    inline_keyboard: [
                        [
                            {
                                text: '💬 Send Message',
                                url: user.username
                                    ? `https://t.me/${user.username}`
                                    : `tg://user?id=${user.id}`
                            }
                        ]
                    ]
                };

            } catch (e) {

                console.error('getChat error:', e);

                details =
                    `<blockquote>` +
                    `🆔 ID: <code>${userId}</code>\n` +
                    `👤 Name: <code>Unknown</code>\n` +
                    `🏷️ Username: <code>N/A</code>` +
                    `</blockquote>`;
            }

            await bot.sendMessage(
                chatId,
                header + details,
                {
                    parse_mode: 'HTML',
                    reply_markup: inlineBtn
                }
            );
        }


        // ==================================================
        // 3. MY INFO
        // ==================================================

        else if (msg.text === '🆔 My Info') {

            const u = msg.from;

            const header =
                `<blockquote>🆔 Your ID Information ❞</blockquote>\n\n`;

            const details =
                `<blockquote>` +
                `🆔 User ID: <code>${u.id}</code>\n` +
                `👤 Name: <code>${u.first_name || ''} ${u.last_name || ''}</code>\n` +
                `🏷️ Username: <code>${
                    u.username
                        ? '@' + u.username
                        : 'No username'
                }</code>\n` +
                `⭐ Premium: ${
                    u.is_premium
                        ? '✅ Yes'
                        : '❌ No'
                }` +
                `</blockquote>`;

            await bot.sendMessage(
                chatId,
                header + details,
                {
                    parse_mode: 'HTML'
                }
            );
        }


        // ==================================================
        // 4. SUPPORT
        // ==================================================

        else if (msg.text === '☎️ Support') {

            const supportText =
                `<blockquote>🛡️ Need help or found a bug?</blockquote>\n\n` +
                `<blockquote>⚡ Contact my developer: <b>@srshihab69</b></blockquote>`;

            const supportBtn = {
                inline_keyboard: [
                    [
                        {
                            text: '👨‍💻 Developer',
                            url: 'https://t.me/srshihab69'
                        }
                    ],
                    [
                        {
                            text: '🤖 Get Any ID Finder Bot',
                            url: 'https://t.me/AnyIDFinderBot'
                        }
                    ]
                ]
            };

            await bot.sendMessage(
                chatId,
                supportText,
                {
                    parse_mode: 'HTML',
                    reply_markup: supportBtn
                }
            );
        }

    } catch (err) {

        console.error(
            'Vercel Webhook Error:',
            err
        );
    }


    // Always respond to Telegram
    res.status(200).send('OK');
});


// ======================================================
// VERCEL / EXPRESS SERVER
// ======================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('ID Checker Bot is Active');
});
