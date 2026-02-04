'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Document, Department } from '@/src/domain/entities';
import { getDocumentById, getAllDocuments } from '@/utils/storage';
import { useToast } from '@/src/presentation/contexts';
import { DEPARTMENT_LABELS } from '@/src/shared/constants';

function TrackPageContent() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const [documentId, setDocumentId] = useState('');
  const [document, setDocument] = useState<Document | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<string[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    senderName: '',
    department: 'all' as 'all' | Department,
    dateFrom: '',
    dateTo: '',
  });
  const [searchMode, setSearchMode] = useState<'quick' | 'advanced'>('quick');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setDocumentId(id);
      handleSearch(id);
    }
    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadAllData = async () => {
    const allDocs = await getAllDocuments();
    
    // Recent documents - 10 most recently submitted
    const sorted = allDocs
      .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
      .slice(0, 10)
      .map(doc => doc.id);
    setRecentDocuments(sorted);
    
    // Pending documents
    const pending = allDocs.filter(doc => {
      return doc.status === 'pending' || doc.status === 'processing';
    });
    pending.sort((a, b) => new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime());
    setPendingDocuments(pending);
  };

  const handleSearch = async (id?: string) => {
    const searchId = id || documentId;
    if (!searchId.trim()) {
      toast.warning('กรุณากรอกเลขที่เอกสาร');
      return;
    }

    const doc = await getDocumentById(searchId.trim());
    if (doc) {
      setDocument(doc);
      setNotFound(false);
      setSearchMode('quick');
      toast.success(`พบเอกสาร ${searchId.trim()}`);
      await loadAllData();
    } else {
      setDocument(null);
      setNotFound(true);
      toast.error(`ไม่พบเอกสารหมายเลข ${searchId.trim()}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอดำเนินการ';
      case 'processing':
        return 'กำลังดำเนินการ';
      case 'completed':
        return 'เสร็จสิ้น/ส่งคืนแล้ว';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysAgoText = (dateString: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (24 * 60 * 60 * 1000));
    if (days === 0) {
      return `วันนี้ (${formatShortDate(dateString)})`;
    } else if (days === 1) {
      return `เมื่อวาน (${formatShortDate(dateString)})`;
    } else {
      return `${days} วันแล้ว (${formatShortDate(dateString)})`;
    }
  };

  const handleAdvancedSearch = async () => {
    const allDocs = await getAllDocuments();
    const filtered = allDocs.filter(doc => {
      const nameMatch = !advancedFilters.senderName || doc.senderName.toLowerCase().includes(advancedFilters.senderName.toLowerCase());
      const deptMatch = advancedFilters.department === 'all' || doc.department === advancedFilters.department;
      const dateFromMatch = !advancedFilters.dateFrom || new Date(doc.submittedDate) >= new Date(advancedFilters.dateFrom);
      const dateToMatch = !advancedFilters.dateTo || new Date(doc.submittedDate) <= new Date(advancedFilters.dateTo);
      return nameMatch && deptMatch && dateFromMatch && dateToMatch;
    });
    setSearchResults(filtered);
    setSearchMode('advanced');
    if (filtered.length > 0) {
      toast.success(`พบ ${filtered.length} เอกสาร`);
    } else {
      toast.warning('ไม่พบเอกสารที่ตรงกัน');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 py-6 px-4">
      <div className="container mx-auto max-w-[1600px]">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔍</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1">
              ติดตามสถานะเอกสาร
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              กรอกเลขที่เอกสารเพื่อตรวจสอบสถานะ
            </p>
          </div>

          {/* Recent Documents */}
          {/* Recent & Pending Documents - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Recent Documents */}
            {recentDocuments.length > 0 && (
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-900/30 dark:to-blue-800/10 backdrop-blur-sm border border-blue-300/40 dark:border-blue-700/40 rounded-xl p-4 hover:border-blue-300/60 dark:hover:border-blue-600/60 transition-colors">
                <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3 text-sm flex items-center gap-2">
                  <span>🔔</span> ล่าสุด
                </h3>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {recentDocuments.map((docId) => (
                    <button
                      key={docId}
                      onClick={() => {
                        setDocumentId(docId);
                        handleSearch(docId);
                      }}
                      className={`px-2 py-1 rounded-md text-xs font-mono font-semibold transition-all flex-shrink-0 ${
                        document?.id === docId
                          ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md ring-1 ring-blue-400'
                          : 'bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 border border-blue-300/60 dark:border-blue-600/40 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {document?.id === docId && '✓ '}
                      {docId.substring(0, 12)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pending/Overdue Documents */}
            {pendingDocuments.length > 0 && (
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-900/30 dark:to-amber-800/10 backdrop-blur-sm border border-amber-300/40 dark:border-amber-700/40 rounded-xl p-4 hover:border-amber-300/60 dark:hover:border-amber-600/60 transition-colors">
                <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-3 text-sm flex items-center gap-2">
                  <span>⚠️</span> ค้างอยู่
                </h3>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {pendingDocuments.slice(0, 10).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setDocumentId(doc.id);
                        handleSearch(doc.id);
                      }}
                      className={`px-2 py-1 rounded-md text-xs font-mono font-semibold transition-all flex-shrink-0 ${
                        document?.id === doc.id
                          ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md ring-1 ring-amber-400'
                          : 'bg-white dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-slate-600 border border-amber-300/60 dark:border-amber-600/40 text-amber-700 dark:text-amber-300'
                      }`}
                      title={getDaysAgoText(doc.submittedDate)}
                    >
                      {document?.id === doc.id && '✓ '}
                      {doc.id.substring(0, 12)}
                    </button>
                  ))}
                  {pendingDocuments.length > 10 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center">+{pendingDocuments.length - 10}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search Form */}
          <div className="mb-6 max-w-lg mx-auto">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 transition-colors outline-none text-sm"
                placeholder="เช่น DOC-20260116-001"
              />
              <button
                onClick={() => handleSearch()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                ค้นหา
              </button>
            </div>
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-semibold"
            >
              {showAdvancedSearch ? '🔽 ซ่อนการค้นหาขั้นสูง' : '🔎 ค้นหาขั้นสูง'}
            </button>
            
            {showAdvancedSearch && (
              <div className="mt-3 p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg space-y-2">
                <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2 text-sm">⚙️ ค้นหาขั้นสูง</h3>
                <input
                  type="text"
                  placeholder="ชื่อผู้ส่ง"
                  value={advancedFilters.senderName}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, senderName: e.target.value})}
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 transition-colors outline-none text-sm"
                />
                <select
                  value={advancedFilters.department}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, department: e.target.value as 'all' | Department})}
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors outline-none text-sm"
                >
                  <option value="all">ทุกแผนก</option>
                  {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={advancedFilters.dateFrom}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, dateFrom: e.target.value})}
                    className="px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors outline-none text-sm"
                  />
                  <input
                    type="date"
                    value={advancedFilters.dateTo}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, dateTo: e.target.value})}
                    className="px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors outline-none text-sm"
                  />
                </div>
                <button
                  onClick={handleAdvancedSearch}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-3 rounded text-xs"
                >
                  ค้นหา ({searchResults.length} ผลลัพธ์)
                </button>
                
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {searchResults.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => {setDocument(doc); setNotFound(false); setShowAdvancedSearch(false);}}
                        className="p-2 bg-white dark:bg-slate-800 rounded cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{doc.id}</p>
                            <p className="text-gray-700 dark:text-slate-300">{doc.senderName} | {doc.department}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(doc.status)}`}>
                            {getStatusText(doc.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Not Found */}
          {notFound && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4 text-center max-w-lg mx-auto">
              <div className="text-4xl mb-2">❌</div>
              <p className="text-red-700 dark:text-red-400 text-sm font-semibold">
                ไม่พบเอกสารหมายเลข: {documentId}
              </p>
              <p className="text-red-600 dark:text-red-500 text-xs mt-1">
                กรุณาตรวจสอบเลขที่เอกสารอีกครั้ง
              </p>
            </div>
          )}

          {/* Document Details */}
          {document && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className={`border-2 rounded-lg p-4 text-center ${getStatusColor(document.status)}`}>
                <p className="text-xs font-semibold mb-1">สถานะปัจจุบัน</p>
                <p className="text-2xl font-bold">{getStatusText(document.status)}</p>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3">📊 Timeline</h3>
                <div className="space-y-3">
                  {/* Submitted */}
                  <div className="flex items-start gap-4">
                    <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">ส่งเอกสาร</p>
                      <p className="text-gray-600 dark:text-slate-400 text-xs">
                        {formatDate(document.submittedDate)}
                      </p>
                    </div>
                  </div>

                  {/* Received */}
                  {document.receivedDate && (
                    <div className="flex items-start gap-4">
                      <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        ✓
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">รับเอกสาร</p>
                        <p className="text-gray-600 dark:text-slate-400 text-xs">
                          {formatDate(document.receivedDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Completed */}
                  {document.completedDate ? (
                    <div className="flex items-start gap-4">
                      <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        ✓
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">เสร็จสิ้น</p>
                        <p className="text-gray-600 dark:text-slate-400 text-xs">
                          {formatDate(document.completedDate)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-300 dark:bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        ⋯
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-500 dark:text-gray-400 text-sm">เสร็จสิ้น</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">รอดำเนินการ</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Info */}
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border dark:border-slate-700 space-y-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3">
                  📋 ข้อมูลเอกสาร
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 text-xs font-semibold">เลขที่เอกสาร</p>
                    <p className="font-semibold text-gray-900 dark:text-slate-100 break-all mt-1">{document.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 text-xs font-semibold">ชื่อผู้ส่ง</p>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">
                      {document.senderName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 text-xs font-semibold">แผนก</p>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">
                      {document.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 text-xs font-semibold">ประเภทเอกสาร</p>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">
                      {document.weekRange}
                    </p>
                  </div>
                </div>
                {document.details && (
                  <div className="pt-2">
                    <p className="text-gray-600 dark:text-slate-400 text-xs font-semibold">รายละเอียด</p>
                    <p className="text-gray-900 dark:text-slate-300 text-xs">{document.details}</p>
                  </div>
                )}
              </div>

              {/* History Log */}
              {document.history && document.history.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-800 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-3">
                    📝 ประวัติการดำเนินการ
                  </h3>
                  <div className="space-y-2">
                    {document.history.map((entry, index) => (
                      <div key={index} className="flex items-start gap-2 pb-2 border-b border-purple-200 dark:border-purple-700 last:border-0">
                        <div className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 text-xs">
                          <p className="font-semibold text-purple-900 dark:text-purple-300">
                            {entry.action === 'created' && '📤 สร้างเอกสาร'}
                            {entry.action === 'received' && '📥 รับเอกสาร'}
                            {entry.action === 'completed' && '✅ เสร็จสิ้น'}
                            {entry.action === 'note_added' && '📝 เพิ่มหมายเหตุ'}
                            {entry.action === 'note_updated' && '✏️ แก้ไขหมายเหตุ'}
                          </p>
                          {entry.staffName && (
                            <p className="text-purple-700 dark:text-purple-400">
                              โดย: {entry.staffName}
                            </p>
                          )}
                          <p className="text-purple-600 dark:text-purple-500">
                            {formatDate(entry.timestamp)}
                          </p>
                          {entry.note && (
                            <p className="text-purple-800 dark:text-purple-300 mt-1">{entry.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Staff Note */}
              {document.staffNote && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-300 dark:border-indigo-800 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2">
                    💬 หมายเหตุจากเจ้าหน้าที่
                  </h3>
                  <p className="text-indigo-800 dark:text-indigo-400 text-sm">{document.staffNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 py-6 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 dark:text-slate-400">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  );
}
