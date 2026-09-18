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
    extra: '6188364681678163125'
};


// ======================================================
// CUSTOM EMOJI MESSAGE FUNCTION
// ======================================================

function createPremiumWelcome(name) {

    /*
     * IMPORTANT:
     * Telegram custom emoji entities use UTF-16 offsets.
     * JavaScript string.length is also UTF-16 based,
     * so it can safely be used for Telegram offsets.
     */

    let text = '';
    const entities = [];

    function addText(value) {
        text += value;
    }

    function addCustomEmoji(fallbackEmoji, customEmojiId) {

        const offset = text.length;

        // Fallback emoji
        text += fallbackEmoji;

        // Replace fallback emoji visually with Premium Emoji
        entities.push({
            type: 'custom_emoji',
            offset: offset,
            length: fallbackEmoji.length,
            custom_emoji_id: customEmojiId
        });
    }


    // --------------------------------------------------
    // Welcome
    // --------------------------------------------------

    addText('❤️ Welcome, ');
    addText(name);
    addText('\n\n');


    // --------------------------------------------------
    // Store title
    // --------------------------------------------------

    addCustomEmoji('⭐', PREMIUM_EMOJIS.extra);
    addText(' — Dragonor Army STORE — ');
    addCustomEmoji('⭐', PREMIUM_EMOJIS.extra);

    addText('\n\n');


    // --------------------------------------------------
    // Premium Features
    // --------------------------------------------------

    addCustomEmoji('🔑', PREMIUM_EMOJIS.key);
    addText(' Premium All Best Mod Keys\n');

    addCustomEmoji('⚡', PREMIUM_EMOJIS.lightning);
    addText(' Instant Delivery 24/7\n');

    addCustomEmoji('🔒', PREMIUM_EMOJIS.lock);
    addText(' 100% Secure Payment\n');

    addCustomEmoji('💰', PREMIUM_EMOJIS.discount);
    addText(' Best Prices Guaranteed\n');

    addCustomEmoji('🎁', PREMIUM_EMOJIS.gift);
    addText(' High Discount Rewards\n');

    addCustomEmoji('⏰', PREMIUM_EMOJIS.support);
    addText(' Active Support For Set-Up\n');


    // --------------------------------------------------
    // Bottom line
    // --------------------------------------------------

    addText('\n\n');
    addText('━━━━━━━━━━━━━━━━━━━━');
    addText('\n\n');

    addCustomEmoji('✅', PREMIUM_EMOJIS.check);
    addText(' Tap Shop Now to Start!');


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

            // Create Premium Emoji message
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
