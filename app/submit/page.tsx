'use client';

import { useState, useRef, useEffect } from 'react';
import { Department } from '@/src/domain/entities';
import { generateDocumentId, saveDocument } from '@/utils/storage';
import { useToast } from '@/src/presentation/contexts';
import { getCurrentWeekLabel, getWeekDateRange, formatDateThai } from '@/src/shared/utils/weekDateRange';

const departments: Department[] = ['NIGHT MED', 'MED', 'PED', 'NIGHT PED', 'OBG', 'ENT', 'EYE', 'SKIN', 'CHK', 'ER', 'SUR'];

const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export default function SubmitPage() {
  const toast = useToast();
  const pickerRef = useRef<HTMLDivElement>(null);
  const [senderName, setSenderName] = useState('');
  const [department, setDepartment] = useState<Department>('NIGHT MED');
  const [details, setDetails] = useState('');
  const [submittedDoc, setSubmittedDoc] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
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

  const handleDateClick = (day: number) => {
    const dateStr = `${displayMonth.getFullYear()}-${String(displayMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate && dateStr < selectedStartDate)) {
      setSelectedStartDate(dateStr);
      setSelectedEndDate('');
    } else if (selectedStartDate && !selectedEndDate) {
      if (dateStr >= selectedStartDate) {
        setSelectedEndDate(dateStr);
        setTimeout(() => setShowDatePicker(false), 300);
      } else {
        setSelectedStartDate(dateStr);
        setSelectedEndDate('');
      }
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
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">📤</div>
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
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 transition-colors outline-none text-sm"
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
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors outline-none text-sm"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="bg-white dark:bg-slate-700">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

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
                  <span className="text-gray-900 dark:text-white font-semibold">
                    📅 {weekLabel}
                  </span>
                  <span className={`text-indigo-600 dark:text-indigo-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Beautiful Calendar Picker Dropdown */}
                {showDatePicker && (
                  <div className="fixed sm:absolute bottom-0 left-0 right-0 sm:bottom-auto sm:top-full sm:mt-2 bg-white dark:bg-slate-800 border-2 border-indigo-300 dark:border-indigo-600 rounded-t-lg sm:rounded-lg shadow-2xl z-50 overflow-hidden sm:w-[90%] sm:max-w-4xl sm:left-1/2 sm:-translate-x-1/2">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 px-4 py-3 text-white flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-sm mb-1">เลือกช่วงวันที่</h3>
                        {selectedStartDate && selectedEndDate && (
                          <p className="text-indigo-100 text-xs">
                            {new Date(selectedStartDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })} - {new Date(selectedEndDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                      {/* Close button for mobile */}
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="sm:hidden text-white hover:bg-indigo-600 p-2 rounded-lg"
                      >
                        ✕
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
                                            onClick={() => {
                                              const dateStrForNextMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                              
                                              if (!selectedStartDate || (selectedStartDate && selectedEndDate && dateStrForNextMonth < selectedStartDate)) {
                                                setSelectedStartDate(dateStrForNextMonth);
                                                setSelectedEndDate('');
                                              } else if (selectedStartDate && !selectedEndDate) {
                                                if (dateStrForNextMonth >= selectedStartDate) {
                                                  setSelectedEndDate(dateStrForNextMonth);
                                                  setTimeout(() => setShowDatePicker(false), 300);
                                                } else {
                                                  setSelectedStartDate(dateStrForNextMonth);
                                                  setSelectedEndDate('');
                                                }
                                              }
                                            }}
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
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 transition-colors outline-none resize-none text-sm"
                rows={3}
                placeholder="กรอกรายละเอียดเพิ่มเติม (ถ้ามี)"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-lg"
            >
              ส่งเอกสาร
            </button>
          </form>
        </div>
      </div>
    </div>
  );

}
