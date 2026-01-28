# CaliQuest - أتقن جسدك. طور حياتك

أفضل تجربة تمرينات كاليستينيك مُلعَّبة. تقدمك، احصل على مهارات، وتصدر لوحة الصدارة مع برامجنا المدربة من الخبراء.

## 🚀 النشر على Vercel

### المتطلبات
- حساب Vercel
- Node.js 18+
- رابط مستودع GitHub (اختياري)

### خطوات النشر

#### 1. تثبيت Vercel CLI
```bash
npm install -g vercel
```

#### 2. نشر الموقع
```bash
# من مجلد المشروع
vercel --prod
```

#### 3. النشر عبر GitHub (موصى به)
1. ارفع الكود إلى GitHub
2. قم بربط المستودع بـ Vercel
3. سيتم النشر تلقائياً مع كل push

### متغيرات البيئة
في Vercel Dashboard، أضف متغيرات البيئة التالية:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 📁 هيكل المشروع

```
caliquest/
├── index.html              # الصفحة الرئيسية
├── supabase-config.js     # إعدادات Supabase
├── app.js                 # منطق التطبيق الرئيسي
├── script.js              # التفاعلات والرسوم المتحركة
├── auth-helpers.js        # مساعدات المصادقة
├── styles.css             # الأنماط والتخصيص
├── vercel.json            # إعدادات Vercel
├── package.json           # معلومات المشروع
└── README.md              # هذا الملف
```

## 🎯 المميزات

- ✨ واجهة مستخدم عصرية ومتجاوبة
- 🔐 مصادقة آمنة مع Supabase
- 📊 إحصائيات ديناميكية من قاعدة البيانات
- � دعم كامل للغة العربية RTL
- 📱 متوافق مع جميع الأجهزة
- ⚡ أداء محسّن مع Vercel CDN

## �️ التطوير المحلي

```bash
# تثبيت الاعتماديات
npm install

# تشغيل خادم التطوير
npm run dev

# بناء المشروع
npm run build

# معاينة الإصدار النهائي
npm run preview
```

## 📱 المتصفحات المدعومة

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 الرخصة

MIT License - انظر ملف LICENSE للتفاصيل

## 🤝 المساهمة

المساهمات مرحب بها! يرجى فتح issue أو pull request.

## 📧 التواصل

- البريد الإلكتروني: info@caliquest.com
- الموقع: https://caliquest.vercel.app
