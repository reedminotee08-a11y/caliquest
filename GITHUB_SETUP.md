# GitHub Repository Setup Guide

## 🚀 إنشاء مستودع GitHub جديد

### الطريقة 1: عبر GitHub CLI (موصى به)

1. **تثبيت GitHub CLI** (إذا لم يكن مثبتاً)
   ```bash
   winget install GitHub.cli
   ```

2. **تسجيل الدخول إلى GitHub**
   ```bash
   gh auth login
   ```

3. **إنشاء مستودع جديد**
   ```bash
   gh repo create caliquest --public --source=. --remote=origin --push
   ```

### الطريقة 2: يدوياً عبر GitHub.com

1. **اذهب إلى GitHub.com**
   - سجل الدخول بحسابك
   - اضغط على "+" واختر "New repository"

2. **إعدادات المستودع**
   ```
   Repository name: caliquest
   Description: CaliQuest - أتقن جسدك. طور حياتك. أفضل تجربة تمرينات كاليستينيك مُلعَّبة.
   Visibility: Public ☑️
   Add a README file: ❌ (لدينا بالفعل)
   Add .gitignore: ❌ (لدينا بالفعل)
   Choose a license: MIT
   ```

3. **ربط المستودع المحلي**
   ```bash
   git remote add origin https://github.com/USERNAME/caliquest.git
   git branch -M main
   git push -u origin main
   ```

## 🔗 ربط Vercel بـ GitHub

### الخطوات:

1. **اذهب إلى Vercel Dashboard**
   - [vercel.com/dashboard](https://vercel.com/dashboard)

2. **إنشاء مشروع جديد**
   - اضغط "Add New..." → "Project"

3. **استيراد من GitHub**
   - اختر حساب GitHub
   - ابحث عن مستودع `caliquest`
   - اضغط "Import"

4. **إعدادات المشروع**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: npm run build
   Output Directory: ./
   Install Command: npm install
   ```

5. **متغيرات البيئة**
   ```
   SUPABASE_URL=https://jzclhcbsbahnnmviilga.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

6. **نشر المشروع**
   - اضغط "Deploy"
   - انتظر حتى اكتمال النشر

## 📋 التحقق بعد النشر

### فحص القائمة:
- [ ] الموقع يعمل على Vercel
- [ ] جميع الروابط تعمل
- [ ] المصادقة تعمل مع Supabase
- [ ] الإحصائيات تظهر بشكل صحيح
- [ ] الموقع متجاوب على الموبايل
- [ ] لا توجد أخطاء في Console

## 🔄 التحديثات المستقبلية

### لتحديث الموقع:
```bash
git add .
git commit -m "Update: وصف التغيير"
git push origin main
```

سيتم نشر التغييرات تلقائياً على Vercel!

## 🎯 الروابط المهمة

- **المستودع**: `https://github.com/USERNAME/caliquest`
- **الموقع**: `https://caliquest-USERNAME.vercel.app`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

## 📝 ملاحظات هامة

1. **استبدل USERNAME** باسم مستخدم GitHub الفعلي
2. **احتفظ بمفاتيح Supabase آمنة**
3. **لا ترفع ملفات .env إلى GitHub**
4. **استخدم GitHub Actions للتحقق الآلي**

## 🆘 المساعدة

إذا واجهت مشاكل:
- [GitHub Docs](https://docs.github.com)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Support](https://support.github.com)
