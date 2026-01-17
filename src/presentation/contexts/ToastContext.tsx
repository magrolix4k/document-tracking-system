'use client';

import { createContext, useContext, useState, ReactNode, useRef, useCallback } from 'react';
import Toast, { ToastType } from '../components/Toast';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  // สร้าง id ที่ไม่ซ้ำแน่นอน
  const showToast = (message: string, type: ToastType = 'info') => {
    toastIdRef.current += 1;
    const id = `${Date.now()}-${toastIdRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // ลบเฉพาะ toast ที่ปิด ไม่ลบทั้งหมด
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = (message: string) => showToast(message, 'success');
  const error = (message: string) => showToast(message, 'error');
  const info = (message: string) => showToast(message, 'info');
  const warning = (message: string) => showToast(message, 'warning');

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast Container */}
      <div className="toast-container-fixed-right" style={{top: '72px'}}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
