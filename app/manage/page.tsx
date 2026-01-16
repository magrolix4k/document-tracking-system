'use client';

import { useState, useEffect } from 'react';
import { Department, Document, DocumentStatus } from '@/src/domain/entities';
import { updateDocument, getDocumentsByStatus } from '@/utils/storage';
import { useToast } from '@/src/presentation/contexts';

const departments: Department[] = ['NIGHT MED', 'MED', 'PED', 'NIGHT PED', 'OBG', 'ENT', 'EYE', 'SKIN', 'CHK', 'ER', 'SUR'];

export default function ManagePage() {
  const toast = useToast();
  const [selectedDept, setSelectedDept] = useState<Department | 'ทั้งหมด'>('ทั้งหมด');
  const [activeTab, setActiveTab] = useState<DocumentStatus>('processing');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [editingSenderName, setEditingSenderName] = useState('');
  const [editingDetails, setEditingDetails] = useState('');
  const [statusCounts, setStatusCounts] = useState<Record<DocumentStatus, number>>({
    pending: 0,
    processing: 0,
    completed: 0,
  });

  useEffect(() => {
    loadDocuments();
    updateStatusCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDept, activeTab]);

  const updateStatusCounts = () => {
    const counts: Record<DocumentStatus, number> = {
      pending: 0,
      processing: 0,
      completed: 0,
    };

    (['pending', 'processing', 'completed'] as DocumentStatus[]).forEach(status => {
      if (selectedDept === 'ทั้งหมด') {
        counts[status] = departments.reduce((sum, dept) => sum + getDocumentsByStatus(dept, status).length, 0);
      } else {
        counts[status] = getDocumentsByStatus(selectedDept, status).length;
      }
    });

    setStatusCounts(counts);
  };

  const loadDocuments = () => {
    if (selectedDept === 'ทั้งหมด') {
      // ดึงเอกสารจากทุกแผนก
      const allDocs = departments.flatMap(dept => getDocumentsByStatus(dept, activeTab));
      setDocuments(allDocs);
    } else {
      const docs = getDocumentsByStatus(selectedDept, activeTab);
      setDocuments(docs);
    }
  };

  const handleCompleteDocument = (docId: string) => {
    if (confirm('ยืนยันการรับคืนเอกสารนี้?')) {
      updateDocument(
        docId,
        {
          status: 'completed',
          completedDate: new Date().toISOString(),
        }
      );
      toast.success(`รับคืนเอกสาร ${docId} สำเร็จ`);
      loadDocuments();
      updateStatusCounts();
    }
  };

  const handleSaveEdit = (docId: string) => {
    if (!editingSenderName.trim()) {
      toast.error('กรุณาระบุชื่อผู้ส่ง');
      return;
    }

    updateDocument(
      docId,
      {
        senderName: editingSenderName.trim(),
        details: editingDetails.trim(),
      }
    );
    toast.success('แก้ไขเอกสารสำเร็จ');
    setEditingDoc(null);
    loadDocuments();
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

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      case 'processing':
        return { label: 'ส่งเอกสาร', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'completed':
        return { label: 'รับเอกสารคืน', color: 'bg-green-100 text-green-800 border-green-300' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 py-6 px-4">
      <div className="container mx-auto max-w-[1600px]">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">⚙️</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1">
              จัดการเอกสาร
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              รับและดำเนินการเอกสารในแผนกของคุณ
            </p>
          </div>

          {/* Department Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-slate-300 font-semibold mb-2 text-sm">
              🏢 เลือกแผนก
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button
                onClick={() => setSelectedDept('ทั้งหมด')}
                className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                  selectedDept === 'ทั้งหมด'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
              >
                ทั้งหมด
              </button>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                    selectedDept === dept
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mb-6 border-b border-gray-300 dark:border-slate-600">
            <div className="flex gap-1">
              {(['processing', 'completed'] as DocumentStatus[]).map((status) => {
                const badge = getStatusBadge(status);
                return (
                  <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    className={`py-2 px-4 font-semibold transition-colors rounded-t-lg text-sm ${
                      activeTab === status
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {badge.label}
                    <span className="ml-2 bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs">
                      {statusCounts[status]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-2">📭</div>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  ไม่มีเอกสารในสถานะนี้
                </p>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border-2 border-gray-200 dark:border-slate-700"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {doc.id}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(doc.id);
                            toast.success('คัดลอกเลขที่เอกสารแล้ว');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded text-xs transition-colors"
                          title="คัดลอกเลขที่เอกสาร"
                        >
                          📋
                        </button>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            getStatusBadge(doc.status).color
                          }`}
                        >
                          {getStatusBadge(doc.status).label}
                        </span>
                      </div>

                      {/* Edit Mode */}
                      {editingDoc === doc.id ? (
                        <div className="space-y-2 mb-2">
                          <div>
                            <label className="text-xs text-gray-600 dark:text-slate-400 block mb-1">
                              ผู้ส่ง
                            </label>
                            <input
                              type="text"
                              value={editingSenderName}
                              onChange={(e) => setEditingSenderName(e.target.value)}
                              className="w-full px-2 py-1.5 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg dark:bg-slate-700 dark:text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 dark:text-slate-400 block mb-1">
                              รายละเอียด
                            </label>
                            <textarea
                              value={editingDetails}
                              onChange={(e) => setEditingDetails(e.target.value)}
                              className="w-full px-2 py-1.5 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg dark:bg-slate-700 dark:text-white text-sm"
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(doc.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors text-xs"
                            >
                              บันทึก
                            </button>
                            <button
                              onClick={() => setEditingDoc(null)}
                              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-1.5 px-3 rounded-lg transition-colors text-xs"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid md:grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600 dark:text-slate-400">ผู้ส่ง: </span>
                              <span className="font-semibold text-gray-900 dark:text-slate-100">
                                {doc.senderName}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-slate-400">สัปดาห์: </span>
                              <span className="font-semibold text-gray-900 dark:text-slate-100">
                                {doc.weekRange}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-slate-400">วันที่ส่ง: </span>
                              <span className="font-semibold text-gray-900 dark:text-slate-100">
                                {formatDate(doc.submittedDate)}
                              </span>
                            </div>
                          </div>
                          {doc.details && (
                            <p className="text-gray-600 dark:text-slate-400 mt-2 text-xs">
                              รายละเอียด: {doc.details}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {editingDoc !== doc.id && (
                      <div className="flex flex-col gap-1.5 min-w-[140px]">
                        {doc.status === 'processing' && (
                          <button
                            onClick={() => handleCompleteDocument(doc.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors text-sm"
                          >
                            รับคืน
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {doc.staffNote && (
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        หมายเหตุ: <span className="text-gray-900 dark:text-white">{doc.staffNote}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
