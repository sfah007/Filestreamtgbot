# 🚀 StreamBox - Telegram File Stream & Direct Link Generator

![StreamBox](https://img.shields.io/badge/StreamBox-Telegram_File_Stream-indigo?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=for-the-badge&logo=express)
![GramJS](https://img.shields.io/badge/GramJS-2.26-blue?style=for-the-badge&logo=telegram)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**StreamBox** is an open-source, full-stack application that allows you to upload files up to **2GB** and instantly generate direct streaming and download links using Telegram as a free cloud storage backend.

[🇸🇦 اضغط هنا للنسخة العربية](README-AR.md)

## ✨ Features

- **2GB File Uploads:** Bypass traditional server limits by using Telegram's generous 2GB file limit.
- **Direct Streaming:** Stream videos and audio files directly in the browser without downloading.
- **Telegram Bot Integration:** Send files directly to the bot on Telegram to get links instantly.
- **Admin Dashboard:** Secure dashboard to manage files, view stats, and configure bot settings dynamically.
- **Modern UI:** Beautiful, responsive Glassmorphism design built with React and Tailwind CSS.
- **Bilingual Interface:** Supports both English and Arabic out of the box.

## 🛠 Tech Stack

- **Frontend:** React 19, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Node.js, Express, SQLite (better-sqlite3), Multer.
- **Telegram API:** GramJS (MTProto) for handling large files up to 2GB.

## 🚀 Deployment Guide

You can deploy StreamBox on almost any modern cloud platform. Below are the guides for the most popular ones.

### 1. Render (Recommended)
Render is perfect for this project because it supports full Node.js environments and persistent disks (for SQLite).
1. Fork this repository.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and configure the build and start commands.
5. Add your Environment Variables (see below).

### 2. Railway
1. Fork this repository.
2. Go to [Railway](https://railway.app) and create a new project from GitHub.
3. Railway will automatically use the `railway.json` configuration.
4. Add a volume for the `uploads` and `data.db` files to persist data.
5. Add your Environment Variables.

### 3. Replit
1. Import this repository into [Replit](https://replit.com).
2. Replit will read the `.replit` and `replit.nix` files automatically.
3. Click **Run**.
4. Add your Environment Variables in the "Secrets" tab.

### 4. Vercel & Netlify (Frontend Only / Limited Backend)
*⚠️ Warning: Vercel and Netlify Serverless functions have a 10-second timeout and 4.5MB payload limit on free tiers. They are **not recommended** for the 2GB file upload feature. Use Render or Railway instead.*
- Configuration files (`vercel.json` and `netlify.toml`) are included if you wish to deploy the frontend only or use a paid tier.

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables. You can get your Telegram API credentials from [my.telegram.org](https://my.telegram.org).

| Variable | Description |
|----------|-------------|
| `TELEGRAM_API_ID` | Your Telegram API ID |
| `TELEGRAM_API_HASH` | Your Telegram API Hash |
| `TELEGRAM_BOT_TOKEN` | Your Telegram Bot Token (from @BotFather) |
| `BIN_CHANNEL_ID` | The ID of the Telegram channel where files will be stored (e.g., `-1001234567890`). **The bot must be an admin in this channel.** |

*Note: You can also configure these variables directly from the Admin Dashboard in the web interface!*

## 💻 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/streambox.git
   cd streambox
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your credentials.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

## 🔐 Admin Dashboard
- **URL:** `/admin`
- **Default Password:** `admin123` (Change this immediately in the Settings tab).

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/streambox/issues).

## 📝 License
This project is [MIT](LICENSE) licensed.

---
**Keywords:** Telegram Bot, File Stream, Direct Download Link, Telegram File to Link, React, Express, GramJS, Open Source, 2GB Upload, Telegram Cloud Storage, MTProto.
