import os
import random
import string
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

# Bot Token ekhane boshan
TOKEN = "YOUR_BOT_TOKEN_HERE"

bot = Bot(token=TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)

# User-der password store korar jonno temporary dictionary (Production-এ Database use korben)
user_passwords = {}

# FSM for Login / Phone verification steps
class LoginState(StatesGroup):
    waiting_for_phone = State()
    waiting_for_otp = State()

# 6ta Reply Keyboard Button
def get_main_keyboard():
    keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🌾 Sell Account"), KeyboardButton(text="🏦 Withdrawal")],
            [KeyboardButton(text="💰 Balance"), KeyboardButton(text="ℹ️ Safety & Terms")],
            [KeyboardButton(text="👥 Refer & Earn"), KeyboardButton(text="📦 My History")]
        ],
        resize_keyboard=True
    )
    return keyboard

# Niche WebApp er Inline Button
def get_webapp_inline_keyboard():
    # Ekhane apnar WebApp link-ti set kore deben
    webapp_url = "https://your-webapp-url.com" 
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🌐 Open WebApp", web_app=types.WebAppInfo(url=webapp_url))]
        ]
    )
    return keyboard

# /start ba General message start
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    user_id = message.from_user.id
    
    # Jodi user-er kono password na thake, ekta unique password toiri kore dibo
    if user_id not in user_passwords:
        random_pass = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        user_passwords[user_id] = random_pass

    welcome_text = (
        f"👋 Hello {message.from_user.full_name}\n\n"
        "Welcome to BGT Wallet 💎\n\n"
        "💰 Main Balance : 0.00 USDT\n"
        "⏳ Hold Balance : 0.00 USDT\n\n"
        "Select an option below to get started 👇"
    )
    
    await message.answer(welcome_text, reply_markup=get_main_keyboard())
    # WebApp er inline button-ti alada vabe ba niche pathate paren
    await message.answer("Click below to open dashboard:", reply_markup=get_webapp_inline_keyboard())

# "My History" button click handle
@dp.message(F.text == "📦 My History")
async def show_history(message: types.Message):
    user_id = message.from_user.id
    # User er password ba history check korbe
    current_pass = user_passwords.get(user_id, "No password generated yet. Type /start")
    
    await message.answer(
        f"📦 **Your Account History & Login Details:**\n\n"
        f"🔒 Your Unique Password: `{current_pass}`\n"
        f"👤 Telegram ID: `{user_id}`\n\n"
        "Ei password diye apni apnar webapp ba history page login korte parben.",
        parse_mode="Markdown"
    )

# Baki 5ta button er jonno handler (Apni apnar moto text change kore nite paren)
@dp.message(F.text.in_({"🌾 Sell Account", "🏦 Withdrawal", "💰 Balance", "ℹ️ Safety & Terms", "👥 Refer & Earn"}))
async def handle_other_buttons(message: types.Message):
    await message.answer(f"Apni select korechen: **{message.text}**\nEti ekhon processing-e ache.", parse_mode="Markdown")

# Main function to run bot
async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
