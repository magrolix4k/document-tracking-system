
# 📋 ระบบติดตามเอกสาร - Document Tracking System

ระบบติดตามสถานะเอกสารออนไลน์สำหรับองค์กร พัฒนาด้วย Next.js 15 + Firebase Firestore พร้อม UI/UX ทันสมัย รองรับทุกอุปกรณ์

[![Performance](https://img.shields.io/badge/Performance-77-yellow)](https://pagespeed.web.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)](https://firebase.google.com/)

## ✨ ฟีเจอร์หลัก

### 📤 การส่งเอกสาร
- ส่งเอกสารพร้อมระบุแผนกและประเภท
- 4 ประเภทเอกสาร: **WI, WP, POLICY, WAITING TIME**
- เลือกช่วงวันที่ด้วย Calendar Picker สวยงาม
- รับเลขที่เอกสารทันที พร้อมปุ่มคัดลอก

### 🔍 ติดตามสถานะ
- ค้นหาเอกสารด้วยเลขที่เอกสาร
- แสดงเอกสารค้นหาล่าสุด 10 รายการ (จาก Firebase)
- แสดงเอกสารที่รอดำเนินการทั้งหมด
- Timeline แสดงประวัติการดำเนินการ

### ⚙️ จัดการเอกสาร
- รับและดำเนินการเอกสารแยกตามแผนก
- อัพเดทสถานะ: รอดำเนินการ → กำลังดำเนินการ → เสร็จสิ้น
- แก้ไขชื่อผู้ส่งและรายละเอียด
- กรองตามแผนกและสถานะ

### 📊 Dashboard & Analytics
- สถิติแบบ real-time: เอกสารที่ส่งเอกสาร, รับคืนวันนี้
- กราฟแท่งแสดงสถิติแต่ละแผนก
- กราฟเส้นแสดงจำนวนเอกสารย้อนหลัง 7 วัน
- ตารางแสดงเอกสารทั้งหมดพร้อมกรอง
- **Export Excel** - ส่งออกข้อมูลเป็น .xlsx (Dynamic Import - ไม่กระทบ Performance)

### 📈 Charts & Statistics
- แผนภูมิแท่งแสดงจำนวนเอกสารแต่ละแผนก
- แผนภูมิเส้นแสดงแนวโน้ม 7 วันย้อนหลัง
- สถิติแบ่งตามสถานะ: Pending, Processing, Completed

## 🆕 อัพเดทล่าสุด (Feb 2026)

### 🔥 Major Updates
- ✅ **Firebase Firestore Integration** - เปลี่ยนจาก localStorage เป็น Cloud Database
- ✅ **4 Document Types** - WI, WP, POLICY, WAITING TIME
- ✅ **13 Departments** - เพิ่มจาก 11 เป็น 13 แผนก
- ✅ **Environment Variables** - ใช้ `.env.local` สำหรับ Firebase config (ปลอดภัย)
- ✅ **Performance Optimizations**:
  - Next.js Font Optimization (FCP ลด 71%)
  - CSS Minification (cssnano)
  - Dynamic Import XLSX (Dashboard ลด 93.6 KB!)
  - ลด Font Weights จาก 7 → 4 weights
  - ลด Firebase queries จาก 20+ → 1 query per page

### 🎨 UI/UX Improvements
- 🌓 **Dark Mode** - รองรับโหมดมืดเต็มรูปแบบ
- 🪟 **Glassmorphism Design** - UI แบบกระจกฝ้าทันสมัย
- 📱 **Mobile First & Responsive** - ใช้งานลื่นทุกอุปกรณ์
- 🔔 **Toast Notifications** - แจ้งเตือนพร้อม Progress Bar
- 📅 **Beautiful Calendar Picker** - เลือกวันที่แบบสองเดือน

### 🚀 Performance Results
- **FCP**: 0.7s → **0.2s** (↓71%)
- **LCP**: 0.8s → **0.4s** (↓50%)
- **CLS**: 0.007 → **0.002** (↓71%)
- **Speed Index**: 1.1s → **0.9s** (↓18%)
- **Dashboard Bundle**: 99.3 KB → **5.68 KB** (↓94%)

### 🔒 Security
- 🔐 **Environment Variables** - Firebase credentials ไม่ hardcode
- 🛡️ **Security Guide** - มีคู่มือการตั้งค่า Security ใน [SECURITY_ALERT.md](SECURITY_ALERT.md)
- 📋 **Deployment Guide** - มีคู่มือ Deploy Vercel ใน [DEPLOYMENT.md](DEPLOYMENT.md)

## 🏢 แผนกที่รองรับ (13 แผนก)

1. **GI** - แผนกทางเดินอาหาร
2. **CHK** - แผนกตรวจสุภาพ
3. **PHY** - แผนกกายภาพ
4. **ENT** - แผนกหู, คอ, จมูก
5. **EYE** - แผนกตา
6. **DENT** - แผนกทันตกรรม
7. **SKIN** - แผนกผิวหนัง
8. **OBG** - แผนกสูตินารี
9. **NIGHT OBG** - คลินิกกลางคืนสูตินารี
10. **NIGHT MED** - คลินิกกลางคืนอายุรกรรม
11. **MED** - แผนกอายุรกรรม
12. **PED** - แผนกกุมารเวช
13. **NIGHT PED** - คลินิกกลางคืนกุมารเวช

## 📑 ประเภทเอกสาร (4 ประเภท)

1. **WI** - Work Instruction (คำสั่งการทำงาน)
2. **WP** - Work Procedure (ขั้นตอนการทำงาน)
3. **POLICY** - นโยบาย
4. **WAITING TIME** - เวลารอคอย

## 🛠️ เทคโนโลジี

### Frontend
- **Framework**: Next.js 15.5.9 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.1
- **Fonts**: Sarabun (Google Fonts - Optimized)
- **UI Components**: Custom (Toast, Calendar, Cards)

### Backend & Database
- **Database**: Firebase Firestore
- **Storage**: Cloud-based (Real-time sync)
- **Authentication**: Firebase SDK

### Build & Performance
- **Minification**: CSS (cssnano), JS (SWC)
- **Code Splitting**: Dynamic Imports
- **Font Optimization**: Next.js Font System
- **Bundle Size**: Optimized with tree-shaking

### Libraries
- **xlsx**: Excel export (Dynamic Import)
- **Firebase**: v11.x (Firestore)
- **React**: v19 (Canary)

## 📦 การติดตั้ง

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/document-tracking-system.git
cd document-tracking-system
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` (คัดลอกจาก `.env.example`):

```bash
cp .env.example .env.local
```

แก้ไขไฟล์ `.env.local` ใส่ Firebase credentials ของคุณ (ดูโครงสร้างใน `.env.example`)

⚠️ **คำเตือน**: **อย่า commit ไฟล์ `.env.local`** - มี credentials จริงของคุณ!

### 4. รัน Development Server

```bash
npm run dev
```

เปิด browser ที่ [http://localhost:3000](http://localhost:3000)

### 5. Build Production

```bash
npm run build
npm start
```

## 🚀 การ Deploy

### Vercel (แนะนำ)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- ไปที่ [vercel.com](https://vercel.com/new)
- Import repository
- Add Environment Variables (จาก `.env.local`)

3. **Deploy!**
- Vercel จะ build และ deploy อัตโนมัติ

ดูคู่มือฉบับเต็มที่ [DEPLOYMENT.md](DEPLOYMENT.md)

## 📁 โครงสร้างโปรเจค

```
document-tracking-system/
├── app/                          # Next.js App Router
│   ├── charts/                   # หน้าแผนภูมิ
│   ├── dashboard/                # หน้า Dashboard
│   ├── manage/                   # หน้าจัดการเอกสาร
│   ├── submit/                   # หน้าส่งเอกสาร
│   ├── track/                    # หน้าติดตามเอกสาร
│   ├── fonts.ts                  # Next.js Font Optimization
│   ├── globals.css               # Global Styles
│   └── layout.tsx                # Root Layout
├── src/
│   ├── application/              # Application Layer
│   │   └── services/             # Business Logic Services
│   ├── domain/                   # Domain Layer
│   │   ├── entities/             # Domain Entities & Types
│   │   └── repositories/         # Repository Interfaces
│   ├── infrastructure/           # Infrastructure Layer
│   │   ├── firebase/             # Firebase Config & Services
│   │   └── persistence/          # Data Persistence
│   ├── presentation/             # Presentation Layer
│   │   ├── components/           # React Components
│   │   ├── contexts/             # React Contexts
│   │   └── hooks/                # Custom Hooks
│   └── shared/                   # Shared Utilities
│       ├── constants/            # Constants (Departments, etc.)
│       ├── utils/                # Helper Functions
│       └── validation/           # Validation Logic
├── utils/                        # Backward Compatibility
│   └── storage.ts                # Storage Wrapper
├── .env.local                    # Environment Variables (Git ignored)
├── .env.example                  # Environment Template
├── DEPLOYMENT.md                 # Deployment Guide
├── SECURITY_ALERT.md            # Security Guide
└── README.md                     # This file
```

## 🔧 การตั้งค่า Firebase

### 1. สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. สร้าง Project ใหม่
3. เพิ่ม Web App

### 2. ตั้งค่า Firestore

1. ไปที่ **Firestore Database**
2. สร้าง Database (Start in **production mode**)
3. ตั้งค่า Security Rules (ตัวอย่าง - ปรับตามความต้องการ):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{document} {
      // ตัวอย่างเบื้องต้น: อ่านได้ทุกคน, เขียนต้อง authenticate
      allow read: if true;
      allow write: if request.auth != null;
      
      // แนะนำ: ปรับ Rules ตามโครงสร้างองค์กรของคุณ
      // เช่น จำกัดการแก้ไขเฉพาะแผนกเจ้าของเอกสาร
    }
  }
}
```

⚠️ **สำคัญ**: Security Rules ด้านบนเป็นเพียงตัวอย่าง! ควรปรับให้เหมาะกับระบบจริงของคุณ

### 3. คัดลอก Config

จาก **Project Settings** → **Your apps** → **SDK setup and configuration**

## 🔒 Security Best Practices

### ⚠️ คำเตือนสำคัญ
- **อย่า commit** ไฟล์ `.env.local` ขึ้น Git (ตรวจสอบ `.gitignore`)
- **อย่าแชร์** API Keys หรือ Firebase Credentials บน README/GitHub
- **อย่าใช้** Firestore Rules แบบ `allow read, write: if true;` ใน Production

### 🛡️ Best Practices

1. ✅ **ใช้ Environment Variables** - ไม่ hardcode credentials ในโค้ด
2. ✅ **Rotate API Keys** - เปลี่ยน key ทันทีหลัง exposed
3. ✅ **ตั้งค่า Firestore Rules** - จำกัดการเข้าถึงตาม role/department
4. ✅ **Enable Firebase App Check** - ยืนยัน requests มาจาก app จริง
5. ✅ **Monitor Usage** - ตรวจสอบ Firebase Dashboard สม่ำเสมอ
6. ✅ **ตรวจสอบ .gitignore** - ต้องมี `.env.local` และ `.env*.local`
7. ✅ **Code Review** - ตรวจสอบก่อน commit ทุกครั้ง

📖 ดูรายละเอียดและขั้นตอนแก้ไขเมื่อเกิด Security Incident ใน [SECURITY_ALERT.md](SECURITY_ALERT.md)

## 📚 เอกสารเพิ่มเติม

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## 🤝 Contributing

Contributions, issues และ feature requests ยินดีต้อนรับ!

## 📝 License

This project is [MIT](LICENSE) licensed.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Next.js Team
- Firebase Team
- Tailwind CSS Team
- Open Source Community

---

**Made with ❤️ in Thailand**
2. ไปที่ [vercel.com](https://vercel.com)
3. Import repository และ Deploy!

## 📝 License

MIT License

---

อัปเดตล่าสุด: 4 February 2026
