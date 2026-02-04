'use client';

import { useEffect, useState } from 'react';
import { Department, Document } from '@/src/domain/entities';
import { getAllDocuments } from '@/utils/storage';
import { DEPARTMENTS } from '@/src/shared/constants';

const departments: Department[] = DEPARTMENTS;

export default function ChartsPage() {
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [deptStats, setDeptStats] = useState<{dept: Department, count: number, pending: number, processing: number, completed: number}[]>([]);
  const [dailyStats, setDailyStats] = useState<{date: string, count: number}[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // ดึงข้อมูลครั้งเดียว แล้วคำนวณทุกอย่างจากข้อมูลเดียวกัน
    const docs = await getAllDocuments();
    setAllDocs(docs);

    // Department statistics - คำนวณจาก docs ที่ได้มา
    const stats = departments.map(dept => {
      const deptDocs = docs.filter(d => d.department === dept);
      return {
        dept,
        count: deptDocs.length,
        pending: deptDocs.filter(d => d.status === 'pending').length,
        processing: deptDocs.filter(d => d.status === 'processing').length,
        completed: deptDocs.filter(d => d.status === 'completed').length,
      };
    });
    setDeptStats(stats);

    // Daily statistics (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = docs.filter(d => d.submittedDate.startsWith(dateStr)).length;
      last7Days.push({ date: dateStr, count });
    }
    setDailyStats(last7Days);
  };

  const maxDeptCount = Math.max(...deptStats.map(s => s.count), 1);
  const maxDailyCount = Math.max(...dailyStats.map(s => s.count), 1);

  const totalDocs = allDocs.length;
  const pendingCount = allDocs.filter(d => d.status === 'pending').length;
  const processingCount = allDocs.filter(d => d.status === 'processing').length;
  const completedCount = allDocs.filter(d => d.status === 'completed').length;

  const pendingPercent = totalDocs > 0 ? (pendingCount / totalDocs) * 100 : 0;
  const processingPercent = totalDocs > 0 ? (processingCount / totalDocs) * 100 : 0;
  const completedPercent = totalDocs > 0 ? (completedCount / totalDocs) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
            <span className="text-4xl">📊</span> กราฟและสถิติ
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            วิเคราะห์ข้อมูลด้วยกราฟและแผนภูมิ
          </p>
        </div>

        {/* Status Pie Chart (using CSS) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6 border dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            📈 สัดส่วนสถานะเอกสาร
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Pie Chart Visual */}
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {/* Yellow - Pending */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="20"
                  strokeDasharray={`${pendingPercent * 2.51} ${251 - pendingPercent * 2.51}`}
                  className="transition-all duration-500"
                />
                {/* Blue - Processing */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  strokeDasharray={`${processingPercent * 2.51} ${251 - processingPercent * 2.51}`}
                  strokeDashoffset={`${-pendingPercent * 2.51}`}
                  className="transition-all duration-500"
                />
                {/* Green - Completed */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${completedPercent * 2.51} ${251 - completedPercent * 2.51}`}
                  strokeDashoffset={`${-(pendingPercent + processingPercent) * 2.51}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{totalDocs}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">รายการ</p>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-lg"></div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-slate-100">รอดำเนินการ</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{pendingPercent.toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg"></div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-slate-100">กำลังดำเนินการ</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{processingCount}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{processingPercent.toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg"></div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-slate-100">เสร็จสิ้น</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCount}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{completedPercent.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6 border dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            📊 จำนวนเอกสารแต่ละแผนก
          </h2>
          <div className="space-y-3">
            {deptStats.map((stat) => (
              <div key={stat.dept} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{stat.dept}</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stat.count} รายการ</span>
                </div>
                <div className="relative h-10 bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                  {/* Pending */}
                  <div
                    className="absolute left-0 top-0 h-full bg-yellow-400 transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${(stat.pending / maxDeptCount) * 100}%` }}
                  >
                    {stat.pending > 0 && <span className="text-xs font-bold text-yellow-900">{stat.pending}</span>}
                  </div>
                  {/* Processing */}
                  <div
                    className="absolute top-0 h-full bg-blue-500 transition-all duration-500 flex items-center justify-center"
                    style={{
                      left: `${(stat.pending / maxDeptCount) * 100}%`,
                      width: `${(stat.processing / maxDeptCount) * 100}%`
                    }}
                  >
                    {stat.processing > 0 && <span className="text-xs font-bold text-white">{stat.processing}</span>}
                  </div>
                  {/* Completed */}
                  <div
                    className="absolute top-0 h-full bg-green-500 transition-all duration-500 flex items-center justify-center"
                    style={{
                      left: `${((stat.pending + stat.processing) / maxDeptCount) * 100}%`,
                      width: `${(stat.completed / maxDeptCount) * 100}%`
                    }}
                  >
                    {stat.completed > 0 && <span className="text-xs font-bold text-white">{stat.completed}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 justify-center text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span className="text-gray-700 dark:text-slate-300">รอดำเนินการ</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-700 dark:text-slate-300">กำลังดำเนินการ</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-700 dark:text-slate-300">เสร็จสิ้น</span>
            </div>
          </div>
        </div>

        {/* Daily Line Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            📈 แนวโน้มการส่งเอกสาร (7 วันย้อนหลัง)
          </h2>
          <div className="relative h-64 flex items-end justify-between gap-2 px-4">
            {dailyStats.map((stat, index) => {
              const height = (stat.count / maxDailyCount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex flex-col items-center">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">{stat.count}</span>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 hover:from-indigo-700 hover:to-indigo-500"
                      style={{ height: `${Math.max(height, 5)}%`, minHeight: '20px' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-slate-400 text-center">
                    {new Date(stat.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={loadData}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm shadow-md"
          >
            🔄 รีเฟรชข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
}
