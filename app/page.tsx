import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 py-6 px-4">
      <main className="container mx-auto max-w-[1600px]">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-slate-100 mb-3">
            ระบบติดตามเอกสาร
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-slate-400">
            ส่งเอกสาร ตรวจสอบสถานะ และจัดการเอกสารได้ง่ายๆ ในที่เดียว
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/submit">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border dark:border-slate-700">
              <div className="text-4xl mb-3">📤</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                ส่งเอกสาร
              </h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                กรอกข้อมูลและส่งเอกสาร รับเลขที่เอกสารทันที
              </p>
            </div>
          </Link>

          <Link href="/track">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border dark:border-slate-700">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                ติดตามสถานะ
              </h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                ตรวจสอบความคืบหน้าของเอกสาร
              </p>
            </div>
          </Link>

          <Link href="/manage">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border dark:border-slate-700">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                จัดการเอกสาร
              </h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                สำหรับเจ้าหน้าที่: รับและดำเนินการ
              </p>
            </div>
          </Link>

          <Link href="/dashboard">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer h-full border dark:border-slate-700">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                Dashboard
              </h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                ภาพรวมและสถิติการทำงาน
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
