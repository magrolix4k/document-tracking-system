'use client';

import { useState, useRef, useEffect } from 'react';
import { Department } from '@/src/domain/entities';
import { DEPARTMENTS, DEPARTMENT_LABELS } from '@/src/shared/constants';

interface SearchableSelectProps {
  value: Department;
  onChange: (value: Department) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export default function SearchableSelect({
  value,
  onChange,
  label = 'แผนกที่ต้องการส่ง',
  required = false,
  placeholder = 'ค้นหาแผนก...',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Filter departments based on search term
  const filteredDepartments = DEPARTMENTS.filter((dept) => {
    const label = DEPARTMENT_LABELS[dept].toLowerCase();
    const search = searchTerm.toLowerCase();
    return dept.toLowerCase().includes(search) || label.includes(search);
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && optionsRef.current) {
      const highlightedElement = optionsRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Reset highlighted index when search term changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  const handleSelect = (dept: Department) => {
    onChange(dept);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

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
      case 'Tab':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  // Highlight matching text
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
    <div>
      {label && (
        <label className="block text-gray-700 dark:text-slate-200 font-semibold mb-1 text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div ref={containerRef} className="relative">
        {/* Input Field */}
        <div
          className={`w-full px-3 py-2 border-2 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer ${
            isOpen
              ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-500/50'
              : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
          }`}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 text-sm"
              autoComplete="off"
            />
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-900 dark:text-white">
                {DEPARTMENT_LABELS[value]}
              </span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div
            ref={optionsRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-700 border-2 border-indigo-500 dark:border-indigo-400 rounded-lg shadow-xl max-h-60 overflow-y-auto"
          >
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept, index) => (
                <div
                  key={dept}
                  onClick={() => handleSelect(dept)}
                  className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                    index === highlightedIndex
                      ? 'bg-indigo-600 text-white'
                      : dept === value
                      ? 'bg-indigo-50 dark:bg-slate-600 text-gray-900 dark:text-white'
                      : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-600'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
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
        )}
      </div>

      {/* Helper text */}
      {isOpen && filteredDepartments.length > 0 && (
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          ใช้ ↑ ↓ เพื่อเลือก, Enter เพื่อยืนยัน, Esc เพื่อปิด
        </p>
      )}
    </div>
  );
}
