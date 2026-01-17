'use client';

import { useEffect, useState } from 'react';
import { Document } from '@/src/domain/entities';
import { Department } from '@/src/domain/entities';

interface DepartmentStats {
  department: Department;
  processing: number;
  completedToday: number;
}
import { 
  getAllDocuments, 
  getDocumentsByDepartment, 
  getCompletedToday,
  getCompletedThisWeek,
  getCompletedThisMonth,
  getCompletedThisYear
} from '@/utils/storage';
import { DEPARTMENTS } from '@/src/shared/constants';
import * as XLSX from 'xlsx';

const departments: Department[] = DEPARTMENTS;

export default function DashboardPage() {
  const [stats, setStats] = useState<DepartmentStats[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'processing' | 'completed'>('all');
  const [filterDepartment, setFilterDepartment] = useState<'all' | Department>('all');
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  const [monthlyCompleted, setMonthlyCompleted] = useState(0);
  const [yearlyCompleted, setYearlyCompleted] = useState(0);
  const [dailyStats, setDailyStats] = useState<{date: string, count: number}[]>([]);

  useEffect(() => {
    loadStats();
    loadAllDocuments();
    loadPeriodStats();
    loadDailyStats();
  }, []);

  const loadDailyStats = () => {
    const docs = getAllDocuments();
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

  const loadPeriodStats = () => {
    setWeeklyCompleted(getCompletedThisWeek());
    setMonthlyCompleted(getCompletedThisMonth());
    setYearlyCompleted(getCompletedThisYear());
  };

  const loadAllDocuments = () => {
    setAllDocuments(getAllDocuments());
  };

  const loadStats = () => {
    const departmentStats: DepartmentStats[] = departments.map((dept) => {
      const allDocs = getDocumentsByDepartment(dept);
      const processing = allDocs.filter((d) => d.status === 'processing').length;
      const completedToday = getCompletedToday(dept);

      return {
        department: dept,
        processing,
        completedToday,
      };
    });

    setStats(departmentStats);
  };

  const totalProcessing = stats.reduce((sum, s) => sum + s.processing, 0);
  const totalCompletedToday = stats.reduce((sum, s) => sum + s.completedToday, 0);

  const filteredDocuments = allDocuments.filter((doc) => {
    const statusMatch = filterStatus === 'all' || doc.status === filterStatus;
    const deptMatch = filterDepartment === 'all' || doc.department === filterDepartment;
    return statusMatch && deptMatch;
  });

  const totalDocs = allDocuments.length;
  const processingCount = allDocuments.filter(d => d.status === 'processing').length;
  const completedCount = allDocuments.filter(d => d.status === 'completed').length;
  const processingPercent = totalDocs > 0 ? (processingCount / totalDocs) * 100 : 0;
  const completedPercent = totalDocs > 0 ? (completedCount / totalDocs) * 100 : 0;
  const maxDeptCount = Math.max(...stats.map(s => s.processing + s.completedToday), 1);
  const maxDailyCount = Math.max(...dailyStats.map(s => s.count), 1);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return 'ส่งเอกสาร';
      case 'completed':
        return 'รับเอกสารคืน';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToExcel = () => {
    const excelData = filteredDocuments.map((doc) => ({
      'เลขที่เอกสาร': doc.id,
      'ชื่อผู้ส่ง': doc.senderName,
      'แผนก': doc.department,
      'สัปดาห์': doc.weekRange,
      'สถานะ': getStatusText(doc.status),
      'วันที่ส่ง': formatDate(doc.submittedDate),
      'วันที่รับ': doc.receivedDate ? formatDate(doc.receivedDate) : '-',
      'วันที่เสร็จสิ้น': doc.completedDate ? formatDate(doc.completedDate) : '-',
      'รายละเอียด': doc.details || '-',
      'หมายเหตุ': doc.staffNote || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = [
      { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'เอกสาร');

    const fileName = `รายงานเอกสาร_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportStatsToExcel = () => {
    const statsData: Array<Record<string, string | number>> = stats.map((stat) => ({
      'แผนก': stat.department,
      'ส่งเอกสาร': stat.processing,
      'รับคืนวันนี้': stat.completedToday,
    }));

    statsData.push({
      'แผนก': 'รวมทั้งหมด',
      'ส่งเอกสาร': totalProcessing,
      'รับคืนวันนี้': totalCompletedToday,
    });

    const ws = XLSX.utils.json_to_sheet(statsData);
    ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'สถิติ');

    const fileName = `สถิติแผนก_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 py-6 px-4">
      <div className="container mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1 flex items-center gap-2">
            <span className="text-3xl">📊</span> Dashboard & Analytics
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            ภาพรวมและสถิติการทำงานแบบเรียลไทม์
          </p>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-3 border-l-4 border-blue-500">
            <p className="text-xs text-gray-600 dark:text-slate-300 mb-1">ส่งเอกสาร</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{totalProcessing}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-3 border-l-4 border-green-500">
            <p className="text-xs text-gray-600 dark:text-slate-300 mb-1">รับคืนวันนี้</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">{totalCompletedToday}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg shadow p-3 border dark:border-purple-700/30">
            <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">สัปดาห์นี้</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">{weeklyCompleted}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg shadow p-3 border dark:border-pink-700/30">
            <p className="text-xs text-pink-700 dark:text-pink-300 mb-1">เดือนนี้</p>
            <p className="text-2xl font-bold text-pink-600 dark:text-pink-300">{monthlyCompleted}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg shadow p-3 border dark:border-teal-700/30">
            <p className="text-xs text-teal-700 dark:text-teal-300 mb-1">ปีนี้</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-300">{yearlyCompleted}</p>
          </div>
        </div>

        {/* Main Content Grid - 2 Columns */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* LEFT COLUMN - Charts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pie Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span>📈</span> สัดส่วนสถานะ
              </h2>
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-4">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" 
                      strokeDasharray={`${processingPercent * 2.51} ${251 - processingPercent * 2.51}`} 
                      className="transition-all duration-500" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" 
                      strokeDasharray={`${completedPercent * 2.51} ${251 - completedPercent * 2.51}`} 
                      strokeDashoffset={`${-processingPercent * 2.51}`} 
                      className="transition-all duration-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{totalDocs}</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">ทั้งหมด</p>
                  </div>
                </div>
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-gray-700 dark:text-slate-300">ส่งเอกสาร</span>
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{processingCount} ({processingPercent.toFixed(0)}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-gray-700 dark:text-slate-300">รับคืนแล้ว</span>
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400">{completedCount} ({completedPercent.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Line Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span>📈</span> 7 วันย้อนหลัง
              </h2>
              <div className="relative h-40 flex items-end justify-between gap-1">
                {dailyStats.map((stat, index) => {
                  const height = (stat.count / maxDailyCount) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{stat.count}</span>
                      <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all duration-500"
                        style={{ height: `${Math.max(height, 5)}%`, minHeight: '10px' }}></div>
                      <span className="text-[9px] text-gray-600 dark:text-slate-400">
                        {new Date(stat.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Department Stats & Export */}
          <div className="lg:col-span-2 space-y-6">
            {/* Department Bar Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                  <span>📊</span> สถิติแต่ละแผนก
                </h2>
                <button onClick={exportStatsToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs shadow">
                  📊 Export
                </button>
              </div>
              <div className="space-y-2">
                {stats.map((stat) => (
                  <div key={stat.department} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{stat.department}</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {stat.processing + stat.completedToday} รายการ
                      </span>
                    </div>
                    <div className="relative h-8 bg-gray-200 dark:bg-slate-700 rounded overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${(stat.processing / maxDeptCount) * 100}%` }}>
                        {stat.processing > 0 && <span className="text-[10px] font-bold text-white">{stat.processing}</span>}
                      </div>
                      <div className="absolute top-0 h-full bg-green-500 transition-all duration-500 flex items-center justify-center"
                        style={{ left: `${(stat.processing / maxDeptCount) * 100}%`, width: `${(stat.completedToday / maxDeptCount) * 100}%` }}>
                        {stat.completedToday > 0 && <span className="text-[10px] font-bold text-white">{stat.completedToday}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-3 justify-center text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded"></div>
                  <span className="text-gray-700 dark:text-slate-300">ส่งเอกสาร</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded"></div>
                  <span className="text-gray-700 dark:text-slate-300">รับคืนวันนี้</span>
                </div>
              </div>
            </div>

            {/* Department Performance Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span>🎯</span> ประสิทธิภาพแผนก
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-gray-300 dark:border-slate-600">
                      <th className="text-left py-2 px-2 text-gray-700 dark:text-slate-300">แผนก</th>
                      <th className="text-center py-2 px-2 text-gray-700 dark:text-slate-300">ส่งเอกสาร</th>
                      <th className="text-center py-2 px-2 text-gray-700 dark:text-slate-300">รับคืนวันนี้</th>
                      <th className="text-center py-2 px-2 text-gray-700 dark:text-slate-300">ภาระงาน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat) => {
                      const workload = stat.processing + stat.completedToday;
                      const workloadLevel = workload > 10 ? '🔴 สูง' : workload > 5 ? '🟡 ปานกลาง' : '🟢 ต่ำ';
                      return (
                        <tr key={stat.department} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                          <td className="py-2 px-2 font-semibold text-gray-900 dark:text-slate-100">{stat.department}</td>
                          <td className="text-center py-2 px-2">
                            <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded font-bold">
                              {stat.processing}
                            </span>
                          </td>
                          <td className="text-center py-2 px-2">
                            <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded font-bold">
                              {stat.completedToday}
                            </span>
                          </td>
                          <td className="text-center py-2 px-2">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-gray-900 dark:text-slate-100">{workload}</span>
                              <span className="text-[10px] text-gray-700 dark:text-slate-300">{workloadLevel}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 flex flex-wrap gap-3 text-[10px] text-gray-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">ภาระงาน:</span>
                  <span>🟢 ต่ำ (≤5)</span>
                  <span>🟡 ปานกลาง (6-10)</span>
                  <span>🔴 สูง ({'>'}10)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents List Section - Full Width */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span>📄</span> รายการเอกสารทั้งหมด
            </h2>
            <button onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs shadow">
              📥 Export รายการ
            </button>
          </div>

          {/* Filters - Compact */}
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-gray-700 dark:text-slate-200 font-medium mb-1 text-sm">
                สถานะ
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'processing' | 'completed')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors outline-none text-sm"
              >
                <option value="all">ทั้งหมด</option>
                <option value="processing">ส่งเอกสาร</option>
                <option value="completed">รับคืนแล้ว</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-slate-200 font-medium mb-1 text-sm">
                แผนก
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value as 'all' | Department)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors outline-none text-sm"
              >
                <option value="all">ทั้งหมด</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-3 text-sm">
            <span className="text-gray-600 dark:text-slate-300">แสดง </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-300">{filteredDocuments.length}</span>
            <span className="text-gray-600 dark:text-slate-300"> รายการ จากทั้งหมด {allDocuments.length} รายการ</span>
          </div>

          {/* Desktop Table - More Compact */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-slate-700">
                  <th className="text-left py-2 px-2 font-semibold text-gray-900 dark:text-slate-100 text-xs">
                    เลขที่เอกสาร
                  </th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-900 dark:text-slate-100 text-xs">
                    ผู้ส่ง
                  </th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-900 dark:text-slate-100 text-xs">
                    แผนก
                  </th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-900 dark:text-slate-100 text-xs">
                    ประเภท
                  </th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-900 dark:text-slate-100 text-xs">
                    สถานะ
                  </th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-900 dark:text-slate-100 text-xs">
                    วันที่ส่ง
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500 dark:text-slate-400 text-sm">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc, index) => (
                    <tr
                      key={doc.id}
                      className={`border-b border-gray-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors ${
                        index % 2 === 0 ? '' : 'bg-gray-50 dark:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-2 px-2 font-mono text-xs text-indigo-600 dark:text-indigo-300 font-medium">
                        {doc.id}
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-900 dark:text-slate-100">
                        {doc.senderName}
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-700 dark:text-slate-300">
                        {doc.department}
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-700 dark:text-slate-300">
                        {doc.weekRange}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            doc.status
                          )}`}
                        >
                          {getStatusText(doc.status)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-600 dark:text-slate-400">
                        {new Date(doc.submittedDate).toLocaleDateString('th-TH', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards - Compact */}
          <div className="lg:hidden space-y-2">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-slate-400 text-sm">ไม่พบข้อมูล</div>
            ) : (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-slate-600"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-300 font-bold">
                      {doc.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        doc.status
                      )}`}
                    >
                      {getStatusText(doc.status)}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <p className="text-gray-900 dark:text-slate-100">
                      <span className="font-medium">ผู้ส่ง:</span> {doc.senderName}
                    </p>
                    <p className="text-gray-700 dark:text-slate-300">
                      <span className="font-medium">แผนก:</span> {doc.department} | {doc.weekRange}
                    </p>
                    <p className="text-gray-600 dark:text-slate-400">
                      {new Date(doc.submittedDate).toLocaleDateString('th-TH', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              loadStats();
              loadAllDocuments();
              loadPeriodStats();
              loadDailyStats();
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm shadow-md"
          >
            🔄 รีเฟรชข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
}
