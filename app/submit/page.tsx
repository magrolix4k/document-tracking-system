'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, ClipboardList, Check, Send, Calendar, X, ChevronDown } from 'lucide-react';
import { Department, DocumentType } from '@/src/domain/entities';
import { generateDocumentId, saveDocument } from '@/utils/storage';
import { useToast } from '@/src/presentation/contexts';
import { getWeekDateRange } from '@/src/shared/utils/weekDateRange';
import { GenericSearchableSelect } from '@/src/presentation/components';
import { DOCUMENT_ACTIONS, DEPARTMENTS, DEPARTMENT_LABELS } from '@/src/shared/constants';
import { logger } from '@/src/shared/services';

const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

const departmentOptions = DEPARTMENTS.map(dept => ({
  value: dept,
  label: DEPARTMENT_LABELS[dept]
}));

const documentTypeOptions = [
  { value: 'WI' as DocumentType, label: 'WI (Work Instruction)' },
  { value: 'WP' as DocumentType, label: 'WP (Work Procedure)' },
  { value: 'POLICY' as DocumentType, label: 'POLICY (นโยบาย)' },
  { value: 'WAITING TIME' as DocumentType, label: 'WAITING TIME (เวลารอคอย)' },
  { value: 'FORM' as DocumentType, label: 'FORM (แบบฟอร์ม)' },
];

export default function SubmitPage() {
  const toast = useToast();
  const pickerRef = useRef<HTMLDivElement>(null);
  const [senderName, setSenderName] = useState('');
  const [department, setDepartment] = useState<Department>('PUR');
  const [documentType, setDocumentType] = useState<DocumentType>('WI');
  const [details, setDetails] = useState('');
  const [submittedDoc, setSubmittedDoc] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(getWeekDateRange().monday);
  const [selectedEndDate, setSelectedEndDate] = useState(getWeekDateRange().sunday);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  // Generate week label from selected dates
  const generateWeekLabel = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startMonth = englishMonths[startDate.getMonth()];
    const endMonth = englishMonths[endDate.getMonth()];
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    // If same month and year
    if (startDate.getMonth() === endDate.getMonth() && startYear === endYear) {
      return `${startDate.getDate()} - ${endDate.getDate()} ${startMonth} ${startYear}`;
    }
    
    // If different months but same year
    if (startYear === endYear) {
      return `${startDate.getDate()} ${startMonth} - ${endDate.getDate()} ${endMonth} ${startYear}`;
    }
    
    // If different years
    return `${startDate.getDate()} ${startMonth} ${startYear} - ${endDate.getDate()} ${endMonth} ${endYear}`;
  };

  const weekLabel = generateWeekLabel(selectedStartDate, selectedEndDate);

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const isDateInRange = (dateStr: string): boolean => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return dateStr >= selectedStartDate && dateStr <= selectedEndDate;
  };

  const isStartDate = (dateStr: string): boolean => dateStr === selectedStartDate;
  const isEndDate = (dateStr: string): boolean => dateStr === selectedEndDate;

  // Format date to YYYY-MM-DD using local timezone
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (day: number, monthDate?: Date) => {
    const targetMonth = monthDate || displayMonth;
    const dateStr = `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Simple logic: First click = start, Second click = end
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start fresh selection
      setSelectedStartDate(dateStr);
      setSelectedEndDate('');
    } else {
      // Second click = end date (auto-sort if needed)
      if (dateStr < selectedStartDate) {
        // Swap if end is before start
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(dateStr);
      } else {
        setSelectedEndDate(dateStr);
      }
      setTimeout(() => setShowDatePicker(false), 300);
    }
  };

  const renderCalendar = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation
    const trimmedName = senderName.trim();
    if (!trimmedName) {
      toast.error('กรุณากรอกชื่อผู้ส่ง');
      return;
    }

    if (trimmedName.length > 100) {
      toast.error('ชื่อผู้ส่งยาวเกินไป (สูงสุด 100 ตัวอักษร)');
      return;
    }

    if (details.trim().length > 500) {
      toast.error('รายละเอียดยาวเกินไป (สูงสุด 500 ตัวอักษร)');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const docId = await generateDocumentId();
      const newDocument = {
        id: docId,
        senderName: senderName.trim(),
        department,
        documentType,
        weekRange: weekLabel,
        details: details.trim(),
        status: 'processing' as const,
        submittedDate: new Date().toISOString(),
        receivedDate: new Date().toISOString(),
        history: [
          {
            timestamp: new Date().toISOString(),
            action: DOCUMENT_ACTIONS.CREATED,
            note: `เอกสารของสัปดาห์ ${weekLabel} ถูกส่งโดย ${senderName.trim()}`,
          },
        ],
      };

      await saveDocument(newDocument);
      setSubmittedDoc(docId);
      setShowSuccess(true);
      toast.success(`ส่งเอกสารสำเร็จ! หมายเลข: ${docId}`);

      // Reset form
      setSenderName('');
      setDetails('');
    } catch (error) {
      logger.error('Failed to submit document', error instanceof Error ? error : undefined, 'submit', { weekLabel });
      toast.error('เกิดข้อผิดพลาดในการส่งเอกสาร กรุณาลองอีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            </div>
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
                  onClick={async () => {
                    try {
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(submittedDoc!);
                      } else {
                        // Fallback for non-HTTPS or older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = submittedDoc!;
                        textArea.style.position = 'fixed';
                        textArea.style.opacity = '0';
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                      }
                      toast.success('คัดลอกเลขที่เอกสารแล้ว');
                    } catch (error) {
                      console.error('Copy failed:', error);
                      toast.error('ไม่สามารถคัดลอกได้');
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                  title="คัดลอกเลขที่เอกสาร"
                >
                  <ClipboardList className="w-5 h-5" />
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
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3 flex justify-center">
              <Send className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">
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
                maxLength={100}
                title="กรุณากรอกชื่อผู้ส่ง (สูงสุด 100 ตัวอักษร)"
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 transition-colors outline-none text-sm"
                placeholder="กรอกชื่อ-นามสกุล"
                required
              />
            </div>

            {/* Department - Searchable */}
            <GenericSearchableSelect
              value={department}
              onChange={setDepartment}
              options={departmentOptions}
              label="แผนกที่ต้องการส่ง"
              required
              placeholder="ค้นหาแผนก... (พิมพ์รหัสหรือชื่อ)"
            />

            {/* Document Type - Searchable */}
            <GenericSearchableSelect
              value={documentType}
              onChange={setDocumentType}
              options={documentTypeOptions}
              label="ประเภทเอกสาร"
              required
              placeholder="ค้นหาประเภทเอกสาร..."
            />

            {/* Week Range Display with Beautiful Calendar Picker */}
            <div>
              <label className="block text-gray-700 dark:text-slate-200 font-semibold mb-1 text-sm">
                เลือกช่วงวันที่
              </label>
              <div className="relative" ref={pickerRef}>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 flex items-center justify-between transition-colors shadow-sm text-sm"
                >
                  <span className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {weekLabel}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                </button>

                {/* Beautiful Calendar Picker Dropdown */}
                {showDatePicker && (
                  <div className="fixed sm:absolute bottom-0 left-0 right-0 sm:bottom-auto sm:top-full sm:mt-2 bg-white dark:bg-slate-800 border-2 border-indigo-300 dark:border-indigo-600 rounded-t-lg sm:rounded-lg shadow-2xl z-50 overflow-hidden sm:w-[90%] sm:max-w-4xl sm:left-1/2 sm:-translate-x-1/2">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 px-4 py-3 text-white flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-sm mb-1">เลือกช่วงวันที่</h3>
                        <p className="text-indigo-100 text-xs flex items-center gap-1">
                          {selectedStartDate && !selectedEndDate && (
                            <>
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                              เลือกวันที่ 1 แล้ว - คลิกวันที่ 2
                            </>
                          )}
                          {selectedStartDate && selectedEndDate && (
                            <>
                              <Check className="w-3 h-3" />
                              {new Date(selectedStartDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })} - {new Date(selectedEndDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                            </>
                          )}
                          {!selectedStartDate && 'คลิกเพื่อเลือกวันที่เริ่มต้น'}
                        </p>
                      </div>
                      {/* Close button for mobile */}
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="sm:hidden text-white hover:bg-indigo-600 p-2 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-4 space-y-3 max-h-[calc(100vh-150px)] sm:max-h-none overflow-y-auto sm:overflow-visible">
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-3">
                        <button
                          type="button"
                          onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1))}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm"
                        >
                          ◀
                        </button>
                        <h4 className="font-bold text-center text-gray-900 dark:text-white text-sm flex-1">
                          {monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1))}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm"
                        >
                          ▶
                        </button>
                      </div>

                      {/* Two Month Calendar - Hidden on mobile, visible on sm and up */}
                      <div className="hidden sm:grid grid-cols-2 gap-4">
                        {/* First Month */}
                        <div>
                          <h5 className="font-semibold text-xs text-gray-700 dark:text-slate-300 mb-2 text-center">
                            {monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}
                          </h5>
                          {/* Day Names */}
                          <div className="grid grid-cols-7 gap-1 mb-1">
                            {dayNames.map((day) => (
                              <div key={day} className="h-5 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-slate-400">
                                {day}
                              </div>
                            ))}
                          </div>
                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {renderCalendar(displayMonth).map((day, index) => {
                              const dateStr = day 
                                ? `${displayMonth.getFullYear()}-${String(displayMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                : null;
                              
                              const isInRange = dateStr ? isDateInRange(dateStr) : false;
                              const isStart = dateStr ? isStartDate(dateStr) : false;
                              const isEnd = dateStr ? isEndDate(dateStr) : false;

                              return (
                                <div key={index} className="h-7">
                                  {day ? (
                                    <button
                                      type="button"
                                      onClick={() => handleDateClick(day)}
                                      className={`w-full h-full rounded-lg font-semibold text-xs transition-all ${
                                        isStart || isEnd
                                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                                          : isInRange
                                          ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200'
                                          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      {day}
                                    </button>
                                  ) : (
                                    <div className="w-full h-full" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Second Month */}
                        <div>
                          {(() => {
                            const nextMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1);
                            return (
                              <>
                                <h5 className="font-semibold text-xs text-gray-700 dark:text-slate-300 mb-2 text-center">
                                  {monthNames[nextMonth.getMonth()]} {nextMonth.getFullYear()}
                                </h5>
                                {/* Day Names */}
                                <div className="grid grid-cols-7 gap-1 mb-1">
                                  {dayNames.map((day) => (
                                    <div key={day} className="h-5 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-slate-400">
                                      {day}
                                    </div>
                                  ))}
                                </div>
                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                  {renderCalendar(nextMonth).map((day, index) => {
                                    const dateStr = day 
                                      ? `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                      : null;
                                    
                                    const isInRange = dateStr ? isDateInRange(dateStr) : false;
                                    const isStart = dateStr ? isStartDate(dateStr) : false;
                                    const isEnd = dateStr ? isEndDate(dateStr) : false;

                                    return (
                                      <div key={index} className="h-7">
                                        {day ? (
                                          <button
                                            type="button"
                                            onClick={() => handleDateClick(day, nextMonth)}
                                            className={`w-full h-full rounded-lg font-semibold text-xs transition-all ${
                                              isStart || isEnd
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                                                : isInRange
                                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200'
                                                : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                            }`}
                                          >
                                            {day}
                                          </button>
                                        ) : (
                                          <div className="w-full h-full" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Single Month Calendar - Visible on mobile only */}
                      <div className="sm:hidden">
                        <div>
                          {/* Day Names */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map((day) => (
                              <div key={day} className="h-6 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-slate-400">
                                {day}
                              </div>
                            ))}
                          </div>
                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {renderCalendar(displayMonth).map((day, index) => {
                              const dateStr = day 
                                ? `${displayMonth.getFullYear()}-${String(displayMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                : null;
                              
                              const isInRange = dateStr ? isDateInRange(dateStr) : false;
                              const isStart = dateStr ? isStartDate(dateStr) : false;
                              const isEnd = dateStr ? isEndDate(dateStr) : false;

                              return (
                                <div key={index} className="h-8">
                                  {day ? (
                                    <button
                                      type="button"
                                      onClick={() => handleDateClick(day)}
                                      className={`w-full h-full rounded-lg font-semibold text-xs transition-all ${
                                        isStart || isEnd
                                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                                          : isInRange
                                          ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200'
                                          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      {day}
                                    </button>
                                  ) : (
                                    <div className="w-full h-full" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200 dark:border-slate-700 mt-3">
                        <p className="text-xs font-bold text-gray-600 dark:text-slate-400 mb-3 uppercase">
                          เลือกด่วน
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const today = new Date();
                              const startOfLastWeek = new Date(today);
                              const day = today.getDay();
                              const diff = today.getDate() - day - 7 + (day === 0 ? -6 : 1);
                              startOfLastWeek.setDate(diff);
                              
                              const endOfLastWeek = new Date(startOfLastWeek);
                              endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
                              
                              setSelectedStartDate(formatDateToString(startOfLastWeek));
                              setSelectedEndDate(formatDateToString(endOfLastWeek));
                              setTimeout(() => setShowDatePicker(false), 200);
                            }}
                            className="text-xs bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-1 px-2 rounded-lg transition-all"
                          >
                            สัปดาห์ก่อน
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentWeek = getWeekDateRange();
                              setSelectedStartDate(currentWeek.monday);
                              setSelectedEndDate(currentWeek.sunday);
                              setTimeout(() => setShowDatePicker(false), 200);
                            }}
                            className="text-xs bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-1 px-2 rounded-lg transition-all"
                          >
                            สัปดาห์นี้
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const today = new Date();
                              const startOfNextWeek = new Date(today);
                              const day = today.getDay();
                              const diff = today.getDate() - day + (day === 0 ? 1 : 8);
                              startOfNextWeek.setDate(diff);
                              
                              const endOfNextWeek = new Date(startOfNextWeek);
                              endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
                              
                              setSelectedStartDate(formatDateToString(startOfNextWeek));
                              setSelectedEndDate(formatDateToString(endOfNextWeek));
                              setTimeout(() => setShowDatePicker(false), 200);
                            }}
                            className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-1 px-2 rounded-lg transition-all"
                          >
                            สัปดาห์หน้า
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const today = new Date();
                              const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                              const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                              
                              setSelectedStartDate(formatDateToString(startOfMonth));
                              setSelectedEndDate(formatDateToString(endOfMonth));
                              setTimeout(() => setShowDatePicker(false), 200);
                            }}
                            className="text-xs bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-1 px-2 rounded-lg transition-all"
                          >
                            เดือนนี้
                          </button>
                        </div>
                      </div>

                      {/* Clear Button */}
                      {(selectedStartDate || selectedEndDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentWeek = getWeekDateRange();
                            setSelectedStartDate(currentWeek.monday);
                            setSelectedEndDate(currentWeek.sunday);
                            setDisplayMonth(new Date());
                          }}
                          className="w-full text-xs bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 font-semibold py-1 rounded-lg transition-colors"
                        >
                          รีเซ็ต
                        </button>
                      )}
                    </div>
                  </div>
                )}
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
                maxLength={500}
                title="รายละเอียดเพิ่มเติม (สูงสุด 500 ตัวอักษร)"
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 transition-colors outline-none resize-none text-sm"
                rows={3}
                placeholder="กรอกรายละเอียดเพิ่มเติม (ถ้ามี)"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{details.length}/500 ตัวอักษร</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'กำลังส่ง...' : 'ส่งเอกสาร'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

}
