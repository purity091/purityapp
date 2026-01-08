# 🚀 دليل النشر على Vercel

## نظرة عامة

سنقوم بنشر:
- **Frontend** على Vercel
- **Backend** على Namecheap (أو أي استضافة Node.js)

---

## 📋 الخطوات

### 1️⃣ إعداد Backend على Namecheap

#### أ. إنشاء قاعدة البيانات MySQL

1. سجّل دخول إلى **cPanel**
2. اذهب إلى **MySQL Databases**
3. أنشئ قاعدة بيانات جديدة:
   - Database Name: `your_username_purity`
4. أنشئ مستخدم جديد:
   - Username: `your_username_purity_user`
   - Password: (كلمة مرور قوية)
5. أضف المستخدم إلى قاعدة البيانات مع **All Privileges**
6. احفظ المعلومات:
   ```
   Host: localhost (أو من Remote MySQL)
   Database: your_username_purity
   Username: your_username_purity_user
   Password: your_strong_password
   ```

#### ب. رفع ملفات Backend

1. اضغط الملفات التالية في ملف ZIP:
   ```
   server/
   package.json
   package-lock.json
   .env.namecheap.template
   ```

2. ارفع الملف عبر **File Manager** في cPanel

3. فك الضغط في المجلد المطلوب (مثل `~/purity-api`)

#### ج. إعداد ملف .env

1. انسخ `.env.namecheap.template` إلى `.env`
2. عدّل القيم:
   ```env
   DB_HOST=localhost
   DB_USER=your_username_purity_user
   DB_PASSWORD=your_strong_password
   DB_NAME=your_username_purity
   DB_PORT=3306

   JWT_SECRET=<generate_random_64_chars>
   JWT_REFRESH_SECRET=<generate_random_64_chars>

   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

3. لتوليد مفاتيح JWT قوية:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

#### د. تثبيت المكتبات

```bash
cd ~/purity-api
npm install --production
```

#### هـ. تشغيل السيرفر

**الطريقة 1: باستخدام PM2 (موصى به)**
```bash
npm install -g pm2
pm2 start npm --name "purity-api" -- run server:prod
pm2 save
pm2 startup
```

**الطريقة 2: باستخدام Node مباشرة**
```bash
npm run server:prod &
```

#### و. إنشاء مستخدم Admin

```bash
npm run create-admin
```

احفظ بيانات الدخول:
- Username: `admin`
- Password: `Admin@2025!`

---

### 2️⃣ إعداد Frontend على Vercel

#### أ. تحديث ملف API

عدّل `src/services/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-namecheap-domain.com/api';
```

#### ب. إنشاء ملف vercel.json

أنشئ ملف `vercel.json` في جذر المشروع:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "https://your-namecheap-domain.com/api"
  }
}
```

#### ج. رفع على GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### د. النشر على Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. سجّل دخول بحساب GitHub
3. اضغط **New Project**
4. اختر المستودع `purity`
5. في **Environment Variables**، أضف:
   ```
   VITE_API_URL = https://your-namecheap-domain.com/api
   ```
6. اضغط **Deploy**

---

### 3️⃣ إعداد CORS

بعد النشر، حدّث ملف `.env` على Namecheap:
```env
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

ثم أعد تشغيل السيرفر:
```bash
pm2 restart purity-api
```

---

## ✅ التحقق من النشر

### اختبار Backend
```bash
curl https://your-namecheap-domain.com/health
```

يجب أن ترى:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

### اختبار Frontend
افتح: `https://your-vercel-app.vercel.app`

---

## 🔧 استكشاف الأخطاء

### خطأ: CORS Error
**الحل:**
- تأكد من تحديث `CORS_ORIGIN` في `.env`
- أعد تشغيل السيرفر

### خطأ: Database Connection Failed
**الحل:**
- تحقق من بيانات قاعدة البيانات في `.env`
- تأكد من أن MySQL يعمل
- تحقق من صلاحيات المستخدم

### خطأ: 502 Bad Gateway
**الحل:**
- تأكد من تشغيل السيرفر
- تحقق من PORT في `.env`
- راجع logs: `pm2 logs purity-api`

---

## 📊 مراقبة السيرفر

### باستخدام PM2
```bash
# عرض الحالة
pm2 status

# عرض Logs
pm2 logs purity-api

# إعادة التشغيل
pm2 restart purity-api

# إيقاف
pm2 stop purity-api
```

---

## 🔐 الأمان

### بعد النشر:

1. **غيّر كلمة مرور Admin**
   - سجّل دخول بالبيانات الافتراضية
   - غيّر كلمة المرور فوراً

2. **احمِ ملف .env**
   ```bash
   chmod 600 .env
   ```

3. **فعّل HTTPS**
   - استخدم SSL Certificate من cPanel
   - أو استخدم Cloudflare

4. **راقب Login Attempts**
   ```sql
   SELECT * FROM login_attempts ORDER BY attempted_at DESC LIMIT 50;
   ```

---

## 📝 ملاحظات مهمة

- ✅ لا ترفع ملف `.env` على Git أبداً
- ✅ استخدم مفاتيح JWT قوية في الإنتاج
- ✅ غيّر كلمة مرور Admin بعد أول تسجيل دخول
- ✅ راقب Login Attempts بانتظام
- ✅ احتفظ بنسخة احتياطية من قاعدة البيانات

---

## 🎉 تهانينا!

تطبيقك الآن منشور ويعمل بشكل احترافي!

- Frontend: `https://your-vercel-app.vercel.app`
- Backend: `https://your-namecheap-domain.com/api`

---

**للدعم:** راجع `AUTH_DOCUMENTATION.md` أو تواصل معنا.
