import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-2">ไม่พบหน้าที่คุณต้องการ</h2>
      <p className="text-gray-600 dark:text-slate-400 mb-6">ขออภัย ไม่พบหน้าหรือเนื้อหานี้ในระบบ</p>
      <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">กลับหน้าหลัก</Link>
    </div>
  );
}
