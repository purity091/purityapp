# 🔐 نظام المصادقة الآمن - Purity

## 📋 نظرة عامة

تم بناء نظام مصادقة احترافي وآمن يتضمن:

### ✨ المميزات الأمنية

- ✅ **تشفير كلمات المرور** باستخدام bcrypt (12 rounds)
- ✅ **JWT Authentication** مع Access & Refresh Tokens
- ✅ **Rate Limiting** لمنع هجمات Brute Force
- ✅ **Helmet.js** للحماية من ثغرات أمنية شائعة
- ✅ **CORS Protection** مع إعدادات محددة
- ✅ **تسجيل محاولات الدخول** في قاعدة البيانات
- ✅ **Auto Token Refresh** تلقائياً عند انتهاء الصلاحية
- ✅ **MySQL Connection Pooling** لأداء أفضل

---

## 🚀 البدء السريع

### 1️⃣ إعداد قاعدة البيانات MySQL

#### على XAMPP (محلياً):
1. شغّل XAMPP وتأكد من تشغيل MySQL
2. افتح phpMyAdmin: `http://localhost/phpmyadmin`
3. أنشئ قاعدة بيانات جديدة باسم: `purity_db`
4. الجداول ستُنشأ تلقائياً عند تشغيل السيرفر

#### على Namecheap (الإنتاج):
1. سجّل الدخول إلى cPanel
2. اذهب إلى **MySQL Databases**
3. أنشئ قاعدة بيانات جديدة
4. أنشئ مستخدم وأعطه كامل الصلاحيات
5. احفظ بيانات الاتصال

### 2️⃣ إعداد ملف البيئة

انسخ `.env.example` إلى `.env` وعدّل القيم:

```bash
# للتطوير المحلي (XAMPP)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=purity_db
DB_PORT=3306

# للإنتاج (Namecheap)
DB_HOST=your_namecheap_mysql_host.com
DB_USER=your_database_username
DB_PASSWORD=your_strong_password
DB_NAME=your_database_name
DB_PORT=3306

# مفاتيح JWT (غيّرها بمفاتيح قوية!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
```

**⚠️ مهم جداً:** غيّر مفاتيح JWT في الإنتاج!

### 3️⃣ تثبيت المكتبات

```bash
npm install
```

### 4️⃣ تشغيل التطبيق

#### تشغيل Frontend + Backend معاً:
```bash
npm run dev:all
```

#### تشغيل Backend فقط:
```bash
npm run server
```

#### تشغيل Frontend فقط:
```bash
npm run dev
```

---

## 🗂️ هيكل المشروع

```
purity1/
├── server/
│   ├── config/
│   │   └── database.ts          # إعدادات MySQL
│   ├── controllers/
│   │   └── authController.ts    # منطق المصادقة
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   └── rateLimiter.ts       # حماية Brute Force
│   ├── routes/
│   │   └── auth.ts              # مسارات API
│   └── server.ts                # الخادم الرئيسي
│
├── src/
│   ├── context/
│   │   └── AuthContext.tsx      # Context للمصادقة
│   └── services/
│       └── api.ts               # خدمة API
│
├── .env                         # متغيرات البيئة (محلي)
├── .env.example                 # نموذج متغيرات البيئة
└── package.json
```

---

## 🔌 API Endpoints

### المسارات العامة (لا تحتاج مصادقة)

#### 1. تسجيل مستخدم جديد
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "ahmed",
  "email": "ahmed@example.com",
  "password": "SecurePass123!",
  "role": "user"  // اختياري: "user" أو "admin"
}
```

**الرد:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "ahmed",
    "email": "ahmed@example.com",
    "role": "user"
  }
}
```

#### 2. تسجيل الدخول
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "ahmed",
  "password": "SecurePass123!"
}
```

**الرد:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "ahmed",
      "email": "ahmed@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. تجديد Access Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### المسارات المحمية (تحتاج مصادقة)

#### 4. الحصول على بيانات المستخدم الحالي
```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

#### 5. تسجيل الخروج
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 💾 قاعدة البيانات

### الجداول المُنشأة تلقائياً:

#### 1. `users` - جدول المستخدمين
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR(50), UNIQUE)
- email (VARCHAR(100), UNIQUE)
- password (VARCHAR(255)) -- مشفرة
- role (ENUM: 'admin', 'user')
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

#### 2. `refresh_tokens` - جدول Refresh Tokens
```sql
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- token (VARCHAR(500))
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### 3. `login_attempts` - جدول محاولات الدخول
```sql
- id (INT, PRIMARY KEY)
- username (VARCHAR(50))
- ip_address (VARCHAR(45))
- attempted_at (TIMESTAMP)
- success (BOOLEAN)
```

---

## 🔒 الأمان

### 1. تشفير كلمات المرور
- استخدام **bcrypt** مع 12 rounds
- لا يتم تخزين كلمات المرور بشكل نصي أبداً

### 2. JWT Tokens
- **Access Token**: صالح لمدة 15 دقيقة
- **Refresh Token**: صالح لمدة 7 أيام
- يتم تخزين Refresh Tokens في قاعدة البيانات

### 3. Rate Limiting
- **Login**: 5 محاولات كل 15 دقيقة لكل IP
- **API**: 100 طلب كل 15 دقيقة لكل IP

### 4. Helmet.js
- حماية من XSS
- حماية من Clickjacking
- إعدادات أمنية للـ Headers

### 5. CORS
- السماح فقط للـ Origins المحددة
- دعم Credentials

---

## 🧪 الاختبار

### اختبار تسجيل مستخدم جديد:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### اختبار تسجيل الدخول:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

---

## 📱 استخدام في Frontend

### مثال على تسجيل الدخول:

```tsx
import { useAuth } from './context/AuthContext';

function LoginPage() {
  const { login, isLoading } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    
    if (result.success) {
      // نجح تسجيل الدخول
      navigate('/dashboard');
    } else {
      // فشل تسجيل الدخول
      alert(result.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* ... */}
    </form>
  );
}
```

---

## 🌐 النشر على Namecheap

### 1. إعداد قاعدة البيانات:
- أنشئ قاعدة بيانات MySQL من cPanel
- احفظ بيانات الاتصال

### 2. إعداد ملف `.env` للإنتاج:
```env
DB_HOST=your_namecheap_mysql_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

JWT_SECRET=generate_strong_random_string_here
JWT_REFRESH_SECRET=generate_another_strong_random_string

NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### 3. رفع الملفات:
- ارفع مجلد `server` كاملاً
- ارفع `package.json` و `package-lock.json`
- **لا ترفع** ملف `.env` - أنشئه مباشرة على السيرفر

### 4. تثبيت المكتبات على السيرفر:
```bash
npm install --production
```

### 5. تشغيل السيرفر:
```bash
npm run server:prod
```

---

## ⚙️ متغيرات البيئة

| المتغير | الوصف | القيمة الافتراضية |
|---------|-------|-------------------|
| `DB_HOST` | عنوان MySQL Server | `localhost` |
| `DB_USER` | اسم مستخدم قاعدة البيانات | `root` |
| `DB_PASSWORD` | كلمة مرور قاعدة البيانات | `` |
| `DB_NAME` | اسم قاعدة البيانات | `purity_db` |
| `DB_PORT` | منفذ MySQL | `3306` |
| `JWT_SECRET` | مفتاح تشفير Access Token | - |
| `JWT_REFRESH_SECRET` | مفتاح تشفير Refresh Token | - |
| `JWT_EXPIRE` | مدة صلاحية Access Token | `15m` |
| `JWT_REFRESH_EXPIRE` | مدة صلاحية Refresh Token | `7d` |
| `PORT` | منفذ السيرفر | `3001` |
| `NODE_ENV` | بيئة التشغيل | `development` |
| `CORS_ORIGIN` | عنوان Frontend المسموح | `http://localhost:5173` |

---

## 🐛 استكشاف الأخطاء

### خطأ: "Failed to connect to database"
- تأكد من تشغيل MySQL
- تحقق من بيانات الاتصال في `.env`
- تأكد من وجود قاعدة البيانات

### خطأ: "Invalid credentials"
- تحقق من اسم المستخدم وكلمة المرور
- تأكد من تفعيل الحساب (`is_active = true`)

### خطأ: "Too many login attempts"
- انتظر 15 دقيقة قبل المحاولة مرة أخرى
- أو امسح جدول `login_attempts`

---

## 📞 الدعم

للمساعدة أو الاستفسارات، تواصل معنا.

---

## 📄 الترخيص

هذا المشروع خاص بـ Purity.
