'use client';

import { useState } from 'react';
import { Department } from '@/src/domain/entities';
import { generateDocumentId, saveDocument } from '@/utils/storage';
import { useToast } from '@/src/presentation/contexts';
import { getCurrentWeekLabel } from '@/src/shared/utils/weekDateRange';

const departments: Department[] = ['NIGHT MED', 'MED', 'PED', 'NIGHT PED', 'OBG', 'ENT', 'EYE', 'SKIN', 'CHK', 'ER', 'SUR'];

export default function SubmitPage() {
  const toast = useToast();
  const [senderName, setSenderName] = useState('');
  const [department, setDepartment] = useState<Department>('NIGHT MED');
  const [details, setDetails] = useState('');
  const [submittedDoc, setSubmittedDoc] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const weekLabel = getCurrentWeekLabel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderName.trim()) {
      toast.error('กรุณากรอกชื่อผู้ส่ง');
      return;
    }

    const docId = generateDocumentId();
    const newDocument = {
      id: docId,
      senderName: senderName.trim(),
      department,
      weekRange: weekLabel,
      details: details.trim(),
      status: 'processing' as const,
      submittedDate: new Date().toISOString(),
      receivedDate: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'created',
          note: `เอกสารของสัปดาห์ ${weekLabel} ถูกส่งโดย ${senderName.trim()}`,
        },
      ],
    };

    saveDocument(newDocument);
    setSubmittedDoc(docId);
    setShowSuccess(true);
    toast.success(`ส่งเอกสารสำเร็จ! หมายเลข: ${docId}`);

    // Reset form
    setSenderName('');
    setDetails('');
  };

  const resetForm = () => {
    setShowSuccess(false);
    setSubmittedDoc(null);
  };

  if (showSuccess && submittedDoc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-950 dark:to-slate-900 py-6 px-4">
        <div className="container mx-auto max-w-[1600px]">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center border dark:border-slate-700 max-w-lg mx-auto">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              ส่งเอกสารสำเร็จ!
            </h2>
            <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-slate-300 mb-1 text-sm">เลขที่เอกสาร</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {submittedDoc}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(submittedDoc!);
                    toast.success('คัดลอกเลขที่เอกสารแล้ว');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                  title="คัดลอกเลขที่เอกสาร"
                >
                  📋
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-slate-400 mb-6 text-sm">
              กรุณาจดเลขที่เอกสารนี้ไว้สำหรับติดตามสถานะ
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`/track?id=${submittedDoc}`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
              >
                ติดตามสถานะ
              </a>
              <button
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
              >
                ส่งเอกสารอีก
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 py-6 px-4">
      <div className="container mx-auto max-w-[1600px]">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border dark:border-slate-700 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📤</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1">
              ส่งเอกสาร
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              กรอกข้อมูลเพื่อส่งเอกสารของคุณ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sender Name */}
            <div>
              <label className="block text-gray-700 dark:text-slate-200 font-semibold mb-1 text-sm">
                ชื่อผู้ส่ง <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 transition-colors outline-none"
                placeholder="กรอกชื่อ-นามสกุล"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-gray-700 dark:text-slate-200 font-semibold mb-1 text-sm">
                แผนกที่ต้องการส่ง <span className="text-red-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors outline-none"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="bg-white dark:bg-slate-700">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Week Range Display */}
            <div>
              <label className="block text-gray-700 dark:text-slate-200 font-semibold mb-1 text-sm">
                สัปดาห์
              </label>
              <div className="w-full px-3 py-2 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                <p className="text-indigo-900 dark:text-indigo-300 font-semibold text-sm">
                  📅 {weekLabel}
                </p>
              </div>
            </div>
            {/* Details */}
            <div>
              <label className="block text-gray-700 dark:text-slate-200 font-semibold mb-1 text-sm">
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 transition-colors outline-none resize-none"
                rows={3}
                placeholder="กรอกรายละเอียดเพิ่มเติม (ถ้ามี)"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-base transition-colors shadow-lg"
            >
              ส่งเอกสาร
            </button>
          </form>
        </div>
      </div>
    </div>
  );

}
