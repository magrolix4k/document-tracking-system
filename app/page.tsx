'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 py-6 px-4">
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
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hi-tech-shadow p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer h-full border border-blue-500/20 dark:border-blue-500/30 hover:border-blue-500/50 group">
              <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">📤</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                ส่งเอกสาร
              </h3>
              <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                กรอกข้อมูลและส่งเอกสาร รับเลขที่เอกสารทันที
              </p>
            </div>
          </Link>

          <Link href="/track">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hi-tech-shadow p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer h-full border border-blue-500/20 dark:border-blue-500/30 hover:border-blue-500/50 group">
              <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                ติดตามสถานะ
              </h3>
              <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                ตรวจสอบควากคืบหน้าของเอกสาร
              </p>
            </div>
          </Link>

          <Link href="/manage">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hi-tech-shadow p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer h-full border border-blue-500/20 dark:border-blue-500/30 hover:border-blue-500/50 group">
              <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">⚙️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                จัดการเอกสาร
              </h3>
              <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                สำหรับเจ้าหน้าที่: รับและดำเนินการ
              </p>
            </div>
          </Link>

          <Link href="/dashboard">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hi-tech-shadow p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer h-full border border-blue-500/20 dark:border-blue-500/30 hover:border-blue-500/50 group">
              <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">📊</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Dashboard
              </h3>
              <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                ภาพรวมและสถิติการทำงาน
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
