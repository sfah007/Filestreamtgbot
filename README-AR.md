# 🚀 StreamBox - بوت وموقع لبث الملفات عبر تيليجرام

![StreamBox](https://img.shields.io/badge/StreamBox-Telegram_File_Stream-indigo?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=for-the-badge&logo=express)
![GramJS](https://img.shields.io/badge/GramJS-2.26-blue?style=for-the-badge&logo=telegram)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**StreamBox** هو مشروع مفتوح المصدر متكامل (Full-Stack) يتيح لك رفع ملفات بحجم يصل إلى **2 جيجابايت** وإنشاء روابط مباشرة للبث والتحميل فوراً، معتمداً على تيليجرام كمساحة تخزين سحابية مجانية وغير محدودة.

[🇬🇧 Click here for English Version](README.md)

## ✨ المميزات

- **رفع ملفات حتى 2 جيجابايت:** تخطى حدود السيرفرات التقليدية باستخدام خوادم تيليجرام القوية.
- **بث مباشر للملفات:** تشغيل مقاطع الفيديو والصوتيات مباشرة من المتصفح دون الحاجة لتحميلها.
- **ربط كامل مع بوت تيليجرام:** أرسل الملفات مباشرة إلى البوت في تيليجرام وسيقوم بإعطائك الروابط فوراً.
- **لوحة تحكم للإدارة:** لوحة تحكم آمنة لإدارة الملفات، عرض الإحصائيات، وتعديل إعدادات البوت برمجياً.
- **واجهة مستخدم عصرية:** تصميم زجاجي (Glassmorphism) جذاب ومتجاوب باستخدام React و Tailwind CSS.
- **دعم اللغتين:** واجهة تدعم اللغتين العربية والإنجليزية معاً.

## 🛠 التقنيات المستخدمة

- **الواجهة الأمامية (Frontend):** React 19, Tailwind CSS, Framer Motion, Lucide Icons.
- **الخادم (Backend):** Node.js, Express, SQLite (better-sqlite3), Multer.
- **مكتبة تيليجرام:** GramJS (MTProto) للتعامل مع الملفات الكبيرة.

## 🚀 دليل الرفع والتشغيل (Deployment)

يمكنك رفع المشروع على أشهر منصات الاستضافة السحابية بسهولة، حيث تم تجهيز ملفات الإعداد مسبقاً.

### 🐳 النشر عبر دوكر (Docker)
يحتوي المشروع على ملفات `Dockerfile` و `docker-compose.yml` جاهزة.
1. انسخ المستودع.
2. أنشئ ملف `.env` وضع فيه متغيراتك.
3. قم بتشغيل الأمر `docker-compose up -d`.
4. سيكون الموقع متاحاً على `http://localhost:3000`.

### 💜 النشر عبر هيروكو (Heroku)
يمكنك نشر المشروع على هيروكو بضغطة زر:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

**أو عبر سطر الأوامر (Heroku CLI):**
```bash
heroku login
heroku create my-streambox-app
git push heroku main
heroku config:set TELEGRAM_API_ID=your_id TELEGRAM_API_HASH=your_hash TELEGRAM_BOT_TOKEN=your_token BIN_CHANNEL_ID=your_channel
```

### 1. منصة Render (موصى بها بشدة)
تعتبر Render الخيار الأفضل لأنها تدعم بيئة Node.js كاملة وتسمح بحفظ قواعد بيانات SQLite.
1. قم بعمل Fork لهذا المستودع.
2. اذهب إلى [Render](https://render.com) وأنشئ **Web Service** جديدة.
3. اربط حسابك في GitHub واختر المستودع.
4. ستقوم المنصة بقراءة ملف `render.yaml` وإعداد كل شيء تلقائياً.
5. أضف المتغيرات البيئية (Environment Variables) الموضحة بالأسفل.

### 2. منصة Railway
1. قم بعمل Fork للمستودع.
2. اذهب إلى [Railway](https://railway.app) وأنشئ مشروع جديد من GitHub.
3. سيتم استخدام ملف `railway.json` تلقائياً.
4. تأكد من إضافة Volume لحفظ مجلد `uploads` وملف `data.db`.
5. أضف المتغيرات البيئية.

### 3. منصة Replit
1. قم باستيراد المستودع إلى [Replit](https://replit.com).
2. سيقوم Replit بقراءة ملفات `.replit` و `replit.nix` لتجهيز بيئة العمل.
3. اضغط على **Run**.
4. أضف المتغيرات البيئية في قسم "Secrets".

### 4. منصات Vercel و Netlify
*⚠️ تحذير: هذه المنصات تستخدم Serverless Functions والتي تحتوي على حد أقصى للرفع (4.5MB) ووقت تنفيذ (10 ثوانٍ) في الباقات المجانية، مما يجعلها **غير مناسبة** لرفع ملفات 2 جيجابايت. يفضل استخدام Render أو Railway.*
- ملفات الإعداد (`vercel.json` و `netlify.toml`) موجودة في حال أردت رفع الواجهة الأمامية فقط أو استخدام باقة مدفوعة.

## ⚙️ المتغيرات البيئية (Environment Variables)

لتشغيل المشروع، ستحتاج إلى الحصول على بيانات تيليجرام من [my.telegram.org](https://my.telegram.org).

| المتغير | الوصف |
|----------|-------------|
| `TELEGRAM_API_ID` | الـ API ID الخاص بك من تيليجرام |
| `TELEGRAM_API_HASH` | الـ API Hash الخاص بك |
| `TELEGRAM_BOT_TOKEN` | توكن البوت الخاص بك (من @BotFather) |
| `BIN_CHANNEL_ID` | معرف القناة التي سيتم تخزين الملفات فيها (مثال: `-1001234567890`). **يجب أن يكون البوت مشرفاً (Admin) في هذه القناة.** |

*ملاحظة: يمكنك أيضاً إعداد هذه المتغيرات لاحقاً من داخل "لوحة الإدارة" في الموقع!*

## 💻 التشغيل المحلي (Local Development)

1. انسخ المستودع:
   ```bash
   git clone https://github.com/yourusername/streambox.git
   cd streambox
   ```
2. ثبّت الحزم المطلوبة:
   ```bash
   npm install
   ```
3. أنشئ ملف `.env` وأضف المتغيرات البيئية.
4. شغل خادم التطوير:
   ```bash
   npm run dev
   ```
5. افتح `http://localhost:3000` في متصفحك.

## 🔐 لوحة الإدارة (Admin Dashboard)
- **الرابط:** `/admin`
- **كلمة المرور الافتراضية:** `admin123` (يرجى تغييرها فوراً من قسم الإعدادات).

## 📝 الترخيص
هذا المشروع مفتوح المصدر تحت ترخيص [MIT](LICENSE).

---
**الكلمات المفتاحية:** بوت تيليجرام، بث ملفات تيليجرام، رابط تحميل مباشر، تحويل ملف تيليجرام إلى رابط، رياكت، نود جي اس، مساحة تخزين سحابية، مفتوح المصدر.
