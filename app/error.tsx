
'use client';
import Link from 'next/link';

export default function Error500() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900">
      <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-2">เกิดข้อผิดพลาดภายในระบบ</h2>
      <p className="text-gray-600 dark:text-slate-400 mb-6">ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง</p>
      <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">กลับหน้าหลัก</Link>
    </div>
  );
}
