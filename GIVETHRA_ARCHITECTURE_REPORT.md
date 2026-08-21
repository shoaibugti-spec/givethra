# Givethra Project Technical Architecture & Repository Map (givethra.org)

یہ رپورٹ **Givethra** پروجیکٹ کے اصل GitHub ریپوزٹری ڈھانچے، Cloudflare Pages اور Workers پر اس کی ڈپلائمنٹ، D1 SQLite ڈیٹا بیس، R2 آبجیکٹ اسٹوریج، گوگل اوتھینٹیکیشن (7,000 پرانے یوزرز کی مائیگریشن سمیت)، سپورٹ چیٹ، ایڈمن پینل، اور پبلک پوسٹ باکس کے مکمل تکنیکی ڈھانچے کو بیان کرتی ہے۔

---

## 1. ریپوزٹری فائل ٹری (Repository File Tree)

Givethra پروجیکٹ کا اصل فولڈر ڈھانچہ درج ذیل ہے:

```text
givethra-website/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD pipeline (Cloudflare build & deploy)
├── src/
│   └── frontend/
│       ├── public/               # Static assets (favicon, robots.txt)
│       ├── src/
│       │   ├── components/       # Reusable UI components (Navbar, Footer, LanguageSwitcher, etc.)
│       │   ├── pages/            # Page components (Home, AdminDashboard, SupportChat, SubmitRequest, etc.)
│       │   ├── lib/              # API client bindings and helpers (api.ts)
│       │   ├── App.tsx           # Main router & layout configuration
│       │   ├── main.tsx          # React application root entry
│       │   └── index.css         # Tailwind & global styling
│       ├── package.json          # Frontend dependencies & build scripts
│       ├── worker.js             # Cloudflare Worker backend & API router (D1 & R2 integrations)
│       ├── wrangler.toml         # Cloudflare Worker / Pages configuration & bindings
│       └── vite.config.ts        # Vite bundler configuration
├── todo.md                       # Master task tracking checklist
└── GIVETHRA_ARCHITECTURE_REPORT.md # Technical Architecture Document
```

---

## 2. کلاؤڈ فیئر آرکیٹیکچر اور کمپوننٹس (Cloudflare Architecture)

Givethra مکمل طور پر **Cloudflare Edge** پر کام کرتا ہے، جو اسے انتہائی تیز رفتار، سکیور اور قابلِ بھروسہ بناتا ہے۔

| جزو (Component) | کلاؤڈ فیئر ٹیکنالوجی | بنیادی کام |
| :--- | :--- | :--- |
| **Frontend UI** | Cloudflare Pages / Workers Static Assets | React SPA جو کہ `givethra.org` پر وزٹرز کو دکھائی دیتی ہے۔ |
| **Backend API** | Cloudflare Worker (`worker.js`) | REST API راؤٹر جو تمام ان کمنگ ریکوئسٹس کو ہینڈل کرتا ہے۔ |
| **Database** | Cloudflare D1 (SQLite at Edge) | یوزرز، کیسز، سپورٹ میسجز، اور پبلک پوسٹس کا ریکارڈ محفوظ رکھتا ہے۔ |
| **Storage** | Cloudflare R2 Object Storage | تمام یوزر اٹیچمنٹس (بلز، شناختی کارڈز، سیلفیز، ویڈیوز) کو محفوظ کرتا ہے۔ |

---

## 3. ڈیٹا بیس اسکیمہ اور D1 آپریشنز (Database & D1 SQLite Schema)

`worker.js` کے اندر بوٹسٹراپ ہونے والے ٹیبلز مندرجہ ذیل ہیں:

1. **`users` Table:** یوزر پروفائلز، گوگل او ایچ (Google OAuth) ڈیٹا، اور رولز (`admin` یا `user`) کو اسٹور کرتا ہے۔
2. **`cases` Table:** امدادی کیسز کی تفصیلات، اسٹیٹس (Pending, Approved, Rejected)، اور اٹیچمنٹ فائل لنکس/نام محفوظ کرتا ہے۔
3. **`support_messages` Table:** یوزر اور ایڈمن کے درمیان لائیو چیٹ کے پیغامات، ٹائم اسٹامپس، اور ان ریڈ (Unread) کاؤنٹرز کو ٹریک کرتا ہے۔
4. **`public_posts` Table:** ہوم پیج کے “What's on your mind?” باکس سے آنے والی پوسٹس کو محفوظ کرتا ہے (سائن ان یوزرز کے لیے یوزر آئی ڈی اور گیسٹس کے لیے `Public` لیبل کے ساتھ)۔

---

## 4. گوگل اوتھینٹیکیشن اور 7,000 پرانے یوزرز کی مائیگریشن (Google Auth & Legacy Upsert)

پرانے Supabase/Vercel سسٹمز سے کلاؤڈ فیئر پر منتقلی کے بعد 7,000 پرانے یوزرز کے لیے لاگ ان کے مسائل کو حل کرنے کے لیے درج ذیل طریقہ کار نافذ کیا گیا ہے:
- **Automatic Cleanup:** براؤزر کے `localStorage` اور `sessionStorage` سے پرانے `sb-`, `supabase`, اور auth tokens خودکار طور پر صاف ہو جاتے ہیں تاکہ کوئی لوپ یا کیش خرابی نہ ہو۔
- **Upsert Logic:** گوگل اوتھ کے ذریعے لاگ ان کرتے ہی سسٹم چیک کرتا ہے کہ آیا ای میل پہلے سے موجود ہے یا نہیں۔ اگر موجود ہے تو پرانی شناخت کو برقرار رکھتے ہوئے سیشن تازہ کر دیا جاتا ہے، اور اگر نئی ہے تو نیا ریکارڈ درج کر لیا جاتا ہے۔ اس سے پرانے یوزرز کو دوبارہ سائن اپ کرنے کی ضرورت نہیں پڑتی۔

---

## 5. سپورٹ چیٹ اور ایڈمن پینل اٹیچمنٹس (Support Chat & Admin Attachments)

- **Support Chat:** یوزرز اور ایڈمن کے درمیان ہونے والی گفتگو میں اب `Failed to send` یا `Invalid Date` کا کوئی مسئلہ باقی نہیں۔ ہر پیغام کا درست ٹائم اسٹامپ اور سینڈر نام ظاہر ہوتا ہے، اور ایڈمن پینل میں unread message badge خودکار طور پر اپ ڈیٹ ہوتا ہے۔
- **Admin Case Attachments:** ایڈمن پینل میں اب ہر کیس کے ساتھ اپ لوڈ کردہ فائلز کے اصل اور صاف نام (`Electricity Bill`, `Medical Report`, `Case Selfie`, `CNIC Front` وغیرہ) شو ہوتے ہیں—کسی قسم کے گمنام ہیش یا `F2` نام اب ظاہر نہیں ہوتے۔

---

## 6. ہوم پیج پبلک پوسٹ باکس (Homepage Public Post Box)

ہوم پیج پر سلائیڈرز کے بالکل اوپر **“What's on your mind?”** کا باکس موجود ہے:
- **Guests & Signed-In Users:** کوئی بھی وزٹر یا لاگ ان یوزر یہاں اپنا خیال یا پیغام لکھ کر بھیج سکتا ہے۔
- **Admin Posts Folder:** ایڈمن پینل میں ایک الگ **Posts** ٹیب موجود ہے جہاں تمام موصولہ پوسٹس درج ہوتی ہیں۔ سائن ان یوزر کی پوسٹ کے ساتھ اس کی **User ID** اور گیسٹ کی پوسٹ کے ساتھ **Public** واضح نظر آتا ہے۔

---

## 7. CI/CD پائپ لائن (GitHub Actions to Cloudflare)

`.github/workflows/deploy.yml` کے ذریعے جب بھی کوڈ GitHub پر پش ہوتا ہے، GitHub Actions خودکار طور پر `src/frontend` میں `pnpm build` چلاتا ہے اور پروڈکشن بلڈ کو Cloudflare پر ڈپلائے کر دیتا ہے (`givethra.org`)۔

---

## 8. حوالہ جات (References)
- Givethra Live Domain: [https://givethra.org](https://givethra.org) [1]
- Cloudflare Workers & D1 Documentation [2]
- React & Vite Frontend Framework [3]

---
*Prepared by Manus AI for Givethra Project.*
