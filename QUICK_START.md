# 🚀 دليل البدء السريع - نظام المصادقة

## خطوات التشغيل (5 دقائق)

### 1️⃣ تأكد من تشغيل MySQL
```bash
# افتح XAMPP Control Panel
# اضغط على Start بجانب MySQL
```

### 2️⃣ أنشئ قاعدة البيانات
```bash
# افتح: http://localhost/phpmyadmin
# اضغط "New" في القائمة اليسرى
# اسم قاعدة البيانات: purity_db
# اضغط "Create"
```

### 3️⃣ شغّل التطبيق
```bash
# في Terminal:
npm run dev:all
```

هذا الأمر سيشغل:
- ✅ Frontend على: http://localhost:5173
- ✅ Backend API على: http://localhost:3001

### 4️⃣ أنشئ مستخدم Admin
```bash
# في Terminal جديد:
npm run create-admin
```

ستحصل على:
- Username: `admin`
- Password: `Admin@2025!`
- Email: `admin@purity.com`

---

## 🧪 اختبار النظام

### طريقة 1: استخدام المتصفح
1. افتح: http://localhost:5173
2. سجّل دخول بالبيانات أعلاه

### طريقة 2: استخدام Postman/Thunder Client

#### تسجيل مستخدم جديد:
```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test@123456"
}
```

#### تسجيل الدخول:
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@2025!"
}
```

---

## 📁 الملفات المهمة

| الملف | الوصف |
|------|-------|
| `.env` | إعدادات قاعدة البيانات والأمان |
| `server/server.ts` | الخادم الرئيسي |
| `src/context/AuthContext.tsx` | إدارة المصادقة في Frontend |
| `src/services/api.ts` | خدمة API |

---

## 🔧 الأوامر المتاحة

```bash
# تشغيل Frontend + Backend معاً
npm run dev:all

# تشغيل Backend فقط
npm run server

# تشغيل Frontend فقط
npm run dev

# إنشاء مستخدم Admin
npm run create-admin

# بناء للإنتاج
npm run build
```

---

## ❓ حل المشاكل الشائعة

### المشكلة: "Failed to connect to database"
**الحل:**
1. تأكد من تشغيل MySQL في XAMPP
2. تحقق من اسم قاعدة البيانات في `.env`
3. تأكد من أن اسم القاعدة هو `purity_db`

### المشكلة: "Port 3001 already in use"
**الحل:**
```bash
# غيّر PORT في ملف .env
PORT=3002
```

### المشكلة: "Invalid credentials"
**الحل:**
1. تأكد من كتابة Username و Password بشكل صحيح
2. أنشئ مستخدم Admin مرة أخرى: `npm run create-admin`

---

## 📚 للمزيد من التفاصيل

اقرأ ملف `AUTH_DOCUMENTATION.md` للتوثيق الكامل.

---

## ✅ قائمة التحقق

- [ ] MySQL يعمل في XAMPP
- [ ] قاعدة البيانات `purity_db` موجودة
- [ ] ملف `.env` موجود ومُعدّل
- [ ] تم تثبيت المكتبات: `npm install`
- [ ] تم إنشاء مستخدم Admin: `npm run create-admin`
- [ ] التطبيق يعمل: `npm run dev:all`

---

**🎉 مبروك! نظام المصادقة جاهز للاستخدام**
