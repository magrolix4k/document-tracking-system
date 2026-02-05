'use client';

import { useState, useEffect } from 'react';
import { Department, Document, DocumentStatus } from '@/src/domain/entities';
import { updateDocument, getDocumentsByStatus } from '@/utils/storage';
import { useToast } from '@/src/presentation/contexts';
import { DEPARTMENTS, DEPARTMENT_LABELS } from '@/src/shared/constants';
import { logger } from '@/src/shared/services';
import { Search, Settings, FileText, CheckCircle2, XCircle, Building2, Globe, X, Inbox, Calendar, Clock, User, FileType, MapPin, Info, Edit2 } from 'lucide-react';
import { formatThaiDate } from '@/src/shared/utils';

// SearchableSelectButton Component
function SearchableSelectButton({ onSelect }: { onSelect: (dept: Department) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredDepartments = DEPARTMENTS.filter((dept) => {
    const label = DEPARTMENT_LABELS[dept].toLowerCase();
    const search = searchTerm.toLowerCase();
    return dept.toLowerCase().includes(search) || label.includes(search);
  });

  const handleSelect = (dept: Department) => {
    onSelect(dept);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredDepartments.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredDepartments[highlightedIndex]) {
          handleSelect(filteredDepartments[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark
              key={index}
              className="bg-yellow-200 dark:bg-yellow-600/50 text-gray-900 dark:text-white font-semibold"
            >
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-lg flex items-center gap-2"
      >
        <Search className="w-4 h-4" /> เลือกแผนก
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setSearchTerm('');
            }}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-700 border-2 border-indigo-500 dark:border-indigo-400 rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-slate-600">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="ค้นหาแผนก..."
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 outline-none text-sm"
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                ใช้ ↑ ↓ เพื่อเลือก, Enter เพื่อยืนยัน
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept, index) => (
                  <div
                    key={dept}
                    onClick={() => handleSelect(dept)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                      index === highlightedIndex
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    {highlightText(DEPARTMENT_LABELS[dept], searchTerm)}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-slate-400 text-center">
                  ไม่พบแผนกที่ค้นหา
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ManagePage() {
  const toast = useToast();
  const [selectedDept, setSelectedDept] = useState<Department | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<DocumentStatus | 'cancelled'>('processing');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [editingSenderName, setEditingSenderName] = useState('');
  const [editingDetails, setEditingDetails] = useState('');
  const [statusCounts, setStatusCounts] = useState<Record<DocumentStatus | 'cancelled', number>>({
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDept, activeTab]);

  const loadAllData = async () => {
    try {
      // ดึงข้อมูลจาก Firebase ตาม status
      const allDocsArrays = await Promise.all(
        DEPARTMENTS.map(dept => getDocumentsByStatus(dept, activeTab as DocumentStatus))
      );
      const allDocs = allDocsArrays.flat();

      // Filter ตาม department
      const filteredDocs = selectedDept === 'ALL' 
        ? allDocs 
        : allDocs.filter(doc => doc.department === selectedDept);
      
      setDocuments(filteredDocs);

      // คำนวณ status counts
      const counts: Record<DocumentStatus | 'cancelled', number> = {
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
      };

      // นับเอกสารแต่ละสถานะ
      for (const status of ['pending', 'processing', 'completed', 'cancelled'] as DocumentStatus[]) {
        const statusDocsArrays = await Promise.all(
          DEPARTMENTS.map(dept => getDocumentsByStatus(dept, status))
        );
        const statusDocs = statusDocsArrays.flat();
        counts[status] = selectedDept === 'ALL' 
          ? statusDocs.length 
          : statusDocs.filter(doc => doc.department === selectedDept).length;
      }

      setStatusCounts(counts);
    } catch (error) {
      logger.error('Failed to load documents', error instanceof Error ? error : undefined, 'manage');
      toast.error('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleCompleteDocument = async (docId: string) => {
    if (confirm('ยืนยันการรับคืนเอกสารนี้?')) {
      try {
        await updateDocument(
          docId,
          {
            status: 'completed',
            completedDate: new Date().toISOString(),
          }
        );
        toast.success(`รับคืนเอกสาร ${docId} สำเร็จ`);
        await loadAllData();
      } catch (error) {
        logger.error('Failed to complete document', error instanceof Error ? error : undefined, 'manage', { docId });
        toast.error('ไม่สามารถรับคืนเอกสารได้');
      }
    }
  };

  const handleCancelDocument = async (docId: string) => {
    const reason = prompt('ระบุเหตุผลการยกเลิก:');
    if (reason !== null) {
      try {
        await updateDocument(
          docId,
          {
            status: 'cancelled',
            cancelledDate: new Date().toISOString(),
            cancelReason: reason.trim() || 'ไม่ระบุ',
          }
        );
        toast.success(`ยกเลิกเอกสาร ${docId} แล้ว`);
        await loadAllData();
      } catch (error) {
        logger.error('Failed to cancel document', error instanceof Error ? error : undefined, 'manage', { docId });
        toast.error('ไม่สามารถยกเลิกเอกสารได้');
      }
    }
  };

  const handleSaveEdit = async (docId: string) => {
    if (!editingSenderName.trim()) {
      toast.error('กรุณาระบุชื่อผู้ส่ง');
      return;
    }

    try {
      await updateDocument(
        docId,
        {
          senderName: editingSenderName.trim(),
          details: editingDetails.trim(),
        }
      );
      toast.success('แก้ไขเอกสารสำเร็จ');
      setEditingDoc(null);
      await loadAllData();
    } catch (error) {
      logger.error('Failed to edit document', error instanceof Error ? error : undefined, 'manage', { docId });
      toast.error('ไม่สามารถแก้ไขเอกสารได้');
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

  const getStatusBadge = (status: DocumentStatus | 'cancelled') => {
    switch (status) {
      case 'pending':
        return { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400' };
      case 'processing':
        return { label: 'ส่งเอกสาร', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'completed':
        return { label: 'รับเอกสารคืน', color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400' };
      case 'cancelled':
        return { label: 'ยกเลิก', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 py-6 px-4">
      <div className="container mx-auto max-w-[1600px]">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3 flex justify-center">
              <Settings className="w-20 h-20 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1">
              จัดการเอกสาร
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              รับและดำเนินการเอกสารในแผนกของคุณ
            </p>
          </div>

          {/* Department Selection - Searchable */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-slate-300 font-semibold mb-2 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" /> เลือกแผนก
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDept('ALL')}
                className={`py-2 px-4 rounded-lg font-semibold transition-all text-sm shadow-sm ${
                  selectedDept === 'ALL'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-1" /> ทั้งหมด
              </button>
              <div className="flex-1">
                {selectedDept !== 'ALL' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-500 dark:border-indigo-400 rounded-lg px-4 py-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">แผนกที่เลือก:</span>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                            {DEPARTMENT_LABELS[selectedDept]}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedDept('ALL')}
                          className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors"
                          title="ยกเลิก"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-center">
                    <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center justify-center gap-2">
                      <Search className="w-4 h-4" /> คลิกปุ่มด้านล่างเพื่อกรองตามแผนก
                    </p>
                  </div>
                )}
              </div>
              <SearchableSelectButton
                onSelect={(dept) => setSelectedDept(dept)}
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mb-6 border-b border-gray-300 dark:border-slate-600">
            <div className="flex gap-1 overflow-x-auto">
              {(['processing', 'completed', 'cancelled'] as (DocumentStatus | 'cancelled')[]).map((status) => {
                const badge = getStatusBadge(status);
                return (
                  <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    className={`py-2 px-4 font-semibold transition-colors rounded-t-lg text-sm whitespace-nowrap ${
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
                <div className="text-5xl mb-2 flex justify-center">
                  <Inbox className="w-20 h-20 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  ไม่มีเอกสารในสถานะนี้
                </p>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md"
                >
                  {/* Header with ID and Status */}
                  <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-base">
                        {doc.id}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(doc.id);
                          toast.success('คัดลอกเลขที่เอกสารแล้ว');
                        }}
                        className="bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg transition-colors"
                        title="คัดลอกเลขที่เอกสาร"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${
                        getStatusBadge(doc.status).color
                      }`}
                    >
                      {getStatusBadge(doc.status).label}
                    </span>
                  </div>

                  {/* Edit Mode */}
                  {editingDoc === doc.id ? (
                    <div className="space-y-4 mb-5">
                      <div>
                        <label className="text-sm text-gray-700 dark:text-slate-300 font-semibold flex items-center gap-2 mb-2">
                          <User className="w-3.5 h-3.5" /> ผู้ส่ง
                        </label>
                        <input
                          type="text"
                          value={editingSenderName}
                          onChange={(e) => setEditingSenderName(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 dark:text-slate-300 font-semibold flex items-center gap-1 mb-1.5">
                          <Info className="w-3.5 h-3.5" /> รายละเอียด
                        </label>
                        <textarea
                          value={editingDetails}
                          onChange={(e) => setEditingDetails(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors outline-none resize-none text-sm"
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleSaveEdit(doc.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> บันทึก
                        </button>
                        <button
                          onClick={() => setEditingDoc(null)}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" /> ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Document Information Grid */}
                      <div className="grid md:grid-cols-2 gap-6 mb-5">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">ผู้ส่ง</div>
                              <div className="font-semibold text-gray-900 dark:text-slate-100 text-sm truncate">
                                {doc.senderName}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">แผนก</div>
                              <div className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                                {DEPARTMENT_LABELS[doc.department]}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <FileType className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">ประเภทเอกสาร</div>
                              <div className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                                {doc.documentType}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">สัปดาห์</div>
                              <div className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                                {doc.weekRange}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">วันที่ส่ง</div>
                              <div className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                                {formatThaiDate(doc.submittedDate)}
                              </div>
                            </div>
                          </div>

                          {doc.receivedDate && (
                            <div className="flex items-start gap-3">
                              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">วันที่รับ</div>
                                <div className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                                  {formatThaiDate(doc.receivedDate)}
                                </div>
                              </div>
                            </div>
                          )}

                          {doc.completedDate && (
                            <div className="flex items-start gap-3">
                              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">วันที่เสร็จสิ้น</div>
                                <div className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                                  {formatThaiDate(doc.completedDate)}
                                </div>
                              </div>
                            </div>
                          )}

                          {doc.cancelledDate && (
                            <div className="flex items-start gap-3">
                              <Clock className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">วันที่ยกเลิก</div>
                                <div className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                                  {formatThaiDate(doc.cancelledDate)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details Section */}
                      {doc.details && (
                        <div className="mb-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1.5">รายละเอียด</div>
                              <div className="text-sm text-blue-900 dark:text-blue-100">
                                {doc.details}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Staff Note */}
                      {doc.staffNote && (
                        <div className="mb-5 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold mb-1.5">หมายเหตุจากเจ้าหน้าที่</div>
                              <div className="text-sm text-purple-900 dark:text-purple-100">
                                {doc.staffNote}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Action Buttons - New Design */}
                  {editingDoc !== doc.id && (
                    <div className="flex items-center gap-3 pt-4 mt-1 border-t border-gray-200 dark:border-slate-700">
                      {doc.status === 'processing' && (
                        <>
                          <button
                            onClick={() => handleCompleteDocument(doc.id)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>รับคืนเรียบร้อย</span>
                          </button>
                          <button
                            onClick={() => handleCancelDocument(doc.id)}
                            className="flex-1 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                          >
                            <XCircle className="w-5 h-5" />
                            <span>ยกเลิกเอกสาร</span>
                          </button>
                        </>
                      )}
                      {(doc.status === 'pending' || doc.status === 'processing') && (
                        <button
                          onClick={() => {
                            setEditingDoc(doc.id);
                            setEditingSenderName(doc.senderName);
                            setEditingDetails(doc.details);
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>แก้ไข</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Cancel Info */}
                  {doc.status === 'cancelled' && doc.cancelReason && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1.5">เหตุผลที่ยกเลิก</div>
                          <div className="text-sm text-red-900 dark:text-red-100">
                            {doc.cancelReason}
                          </div>
                        </div>
                      </div>
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
