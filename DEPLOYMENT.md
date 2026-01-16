# 🚀 คู่มือการ Deploy ระบบติดตามเอกสาร

## ขั้นตอนการอัพโหลดขึ้น Git และ Deploy

### 1. ติดตั้ง Git (ถ้ายังไม่มี)

ดาวน์โหลดและติดตั้ง Git จาก: https://git-scm.com/download/win

### 2. สร้าง GitHub Repository

1. ไปที่ https://github.com/new
2. ตั้งชื่อ repository เช่น `document-tracking-system`
3. เลือก Public หรือ Private
4. **ไม่ต้อง** initialize with README (เพราะมีแล้ว)
5. คลิก "Create repository"

### 3. เชื่อมต่อและ Push โค้ด

เปิด Terminal/PowerShell ในโฟลเดอร์โปรเจค แล้วรันคำสั่งนี้:

```bash
# เปลี่ยนไปที่โฟลเดอร์โปรเจค
cd f:\waiting_time

# เริ่มต้น Git repository
git init

# ตั้งค่าชื่อและอีเมล (เปลี่ยนเป็นของคุณ)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Initial commit - Document Tracking System"

# เพิ่ม remote (แทน YOUR_USERNAME และ YOUR_REPO ด้วยของคุณ)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push ขึ้น GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 Deploy ด้วย Vercel (แนะนำ - ฟรีและง่ายที่สุด)

### ขั้นตอนที่ 1: เตรียม Vercel Account

1. ไปที่ https://vercel.com
2. Sign up ด้วย GitHub account
3. Authorize Vercel เข้าถึง GitHub

### ขั้นตอนที่ 2: Import Project

1. คลิก **"Add New Project"**
2. เลือก **"Import Git Repository"**
3. เลือก repository `document-tracking-system`
4. คลิก **"Import"**

### ขั้นตอนที่ 3: Configure Project

Vercel จะตรวจจับ Next.js อัตโนมัติ:

- **Framework Preset**: Next.js ✅ (อัตโนมัติ)
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅

คลิก **"Deploy"**!

### ขั้นตอนที่ 4: รอ Deploy เสร็จ

- รอประมาณ 1-2 นาที
- เมื่อเสร็จจะได้ URL เช่น: `https://your-project.vercel.app`
- แชร์ URL นี้ได้เลย!

### Auto-Deploy

ทุกครั้งที่ push โค้ดใหม่ขึ้น GitHub, Vercel จะ deploy อัตโนมัติ! 🎉

---

## 🎯 Deploy ด้วย Netlify (ทางเลือกที่ 2)

### ขั้นตอนที่ 1: เตรียม Netlify Account

1. ไปที่ https://netlify.com
2. Sign up ด้วย GitHub
3. Authorize Netlify

### ขั้นตอนที่ 2: Import Project

1. คลิก **"Add new site"** → **"Import an existing project"**
2. เลือก **"GitHub"**
3. เลือก repository

### ขั้นตอนที่ 3: Build Settings

```
Build command: npm run build
Publish directory: .next
```

คลิก **"Deploy"**!

---

## 📦 Deploy แบบ Manual (Server ของคุณเอง)

### ขั้นตอนที่ 1: Build โปรเจค

```bash
npm run build
```

### ขั้นตอนที่ 2: รัน Production Server

```bash
npm start
```

หรือใช้ PM2:

```bash
npm install -g pm2
pm2 start npm --name "doc-tracking" -- start
pm2 save
```

### ขั้นตอนที่ 3: Setup Nginx (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔧 Environment Variables (ถ้ามีการเชื่อมต่อ Backend)

ถ้าในอนาคตมีการเชื่อมต่อ API หรือ Database:

### Vercel/Netlify

ไปที่ Project Settings → Environment Variables:

```
API_URL=https://your-api.com
DATABASE_URL=your-database-connection-string
```

### Local (.env.local)

```bash
# สร้างไฟล์ .env.local
API_URL=http://localhost:5000
```

---

## 📱 ทดสอบหลัง Deploy

1. ✅ ทดสอบส่งเอกสาร
2. ✅ ทดสอบค้นหาเอกสาร
3. ✅ ทดสอบจัดการเอกสาร
4. ✅ ทดสอบ Dashboard และ Export
5. ✅ ทดสอบ Dark Mode
6. ✅ ทดสอบบนมือถือ

---

## 🆘 Troubleshooting

### ❌ Build Failed

```bash
# ลบ node_modules และ reinstall
rm -rf node_modules
npm install
npm run build
```

### ❌ localStorage ไม่ทำงาน

localStorage ใช้งานได้เฉพาะ client-side เท่านั้น ตรวจสอบว่า:
- ไม่มีการใช้ `getDocumentById()` ใน Server Components
- ใช้ `'use client'` ที่ต้นไฟล์

### ❌ Dark Mode ไม่ทำงาน

ตรวจสอบว่า browser รองรับ `prefers-color-scheme`

---

## 🎉 เสร็จแล้ว!

หลังจาก deploy สำเร็จ คุณจะได้:

- ✅ URL สำหรับเข้าถึงระบบ (เช่น `your-app.vercel.app`)
- ✅ Auto-deploy เมื่อ push โค้ดใหม่
- ✅ HTTPS ฟรีอัตโนมัติ
- ✅ CDN ทั่วโลก (รวดเร็ว)

---

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ build logs ใน Vercel/Netlify dashboard
2. ตรวจสอบ browser console (F12)
3. ดู error message

Happy Deploying! 🚀
