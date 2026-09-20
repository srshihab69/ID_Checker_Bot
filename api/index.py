import os
import random
import string
from fastapi import FastAPI, Request
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.storage.memory import MemoryStorage

# Vercel Environment Variable থেকে বট টোকেন রিড করবে (সিকিউর রাখার জন্য)
TOKEN = os.getenv("BOT_TOKEN")

# আপনার Vercel প্রজেক্টের লাইভ webhook লিংক 
WEBHOOK_URL = "https://social-account.vercel.app/webhook" 

bot = Bot(token=TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)
app = FastAPI()

# ইউজারের পাসওয়ার্ড স্টোর করার ডিকশনারি (প্রোডাকশনে ডেটাবেস ব্যবহার করতে পারেন)
user_passwords = {}

# ছবির মতো ৬টি রিপ্লাই কিবোর্ড বাটন
def get_main_keyboard():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🌾 Sell Account"), KeyboardButton(text="🏦 Withdrawal")],
            [KeyboardButton(text="💰 Balance"), KeyboardButton(text="ℹ️ Safety & Terms")],
            [KeyboardButton(text="👥 Refer & Earn"), KeyboardButton(text="📦 My History")]
        ],
        resize_keyboard=True
    )

# নিচের ইনলাইন ওয়েবঅ্যাপ বাটন
def get_webapp_inline_keyboard():
    webapp_url = "https://your-webapp-url.com" # এখানে আপনার ওয়েবঅ্যাপ বা পাসওয়ার্ড পেজের লিংক বসাবেন
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🌐 Open WebApp", web_app=types.WebAppInfo(url=webapp_url))]
        ]
    )

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    user_id = message.from_user.id
    
    # ইউজারের জন্য ইউনিক পাসওয়ার্ড তৈরি (যদি আগে না থাকে)
    if user_id not in user_passwords:
        user_passwords[user_id] = ''.join(random.choices(string.ascii_letters + string.digits, k=8))

    welcome_text = (
        f"👋 Hello {message.from_user.full_name}\n\n"
        "Welcome to BGT Wallet 💎\n\n"
        "💰 Main Balance : 0.00 USDT\n"
        "⏳ Hold Balance : 0.00 USDT\n\n"
        "Select an option below to get started 👇"
    )
    
    # প্রথমে ৬টি কিবোর্ড বাটন পাঠাবে
    await message.answer(welcome_text, reply_markup=get_main_keyboard())
    # এরপর নিচে ওয়েবঅ্যাপের ইনলাইন বাটনটি পাঠাবে
    await message.answer("Click below to open dashboard:", reply_markup=get_webapp_inline_keyboard())

# "My History" বাটনে ক্লিক করলে ইউজারের ইউনিক পাসওয়ার্ড ও আইডি দেখাবে
@dp.message(F.text == "📦 My History")
async def show_history(message: types.Message):
    user_id = message.from_user.id
    current_pass = user_passwords.get(user_id, "No password generated yet. Type /start")
    
    await message.answer(
        f"📦 **Your Account History & Login Details:**\n\n"
        f"🔒 Your Unique Password: `{current_pass}`\n"
        f"👤 Telegram ID: `{user_id}`\n\n"
        "এই পাসওয়ার্ড দিয়ে আপনার ওয়েবঅ্যাপ বা হিস্টরি পেজে লগইন করতে পারবেন।",
        parse_mode="Markdown"
    )

# বাকি ৫টি বাটনগুলোর হ্যান্ডলার
@dp.message(F.text.in_({"🌾 Sell Account", "🏦 Withdrawal", "💰 Balance", "ℹ️ Safety & Terms", "👥 Refer & Earn"}))
async def handle_other_buttons(message: types.Message):
    await message.answer(f"আপনি সিলেক্ট করেছেন: **{message.text}**\nএটি বর্তমানে প্রসেসিংধীন রয়েছে।", parse_mode="Markdown")

# Vercel Webhook রাউট এবং স্টার্টআপ
@app.on_event("startup")
async def startup_event():
    if TOKEN:
        await bot.set_webhook(WEBHOOK_URL)

@app.post("/webhook")
async def webhook(request: Request):
    data = await request.json()
    telegram_update = types.Update(**data)
    await dp.feed_update(bot, telegram_update)
    return {"ok": True}

@app.get("/")
async def index():
    return {"status": "Telegram Bot is running smoothly on Vercel!"}
