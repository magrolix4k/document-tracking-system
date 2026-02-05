'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Home, Send, Search, FileText, BarChart3, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();


  // Ensure darkMode state matches DOM and localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navConfig = [
    { href: '/', label: 'หน้าแรก', icon: Home },
    { href: '/submit', label: 'ส่งเอกสาร', icon: Send },
    { href: '/track', label: 'ติดตามสถานะ', icon: Search },
    { href: '/manage', label: 'จัดการเอกสาร', icon: FileText },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 hi-tech-shadow text-white shadow-lg sticky top-0 z-50 backdrop-blur-md border-b border-blue-500/20">
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* System Name - Left side - Now clickable */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-all duration-300 hover:scale-105 group">
            <div className="text-2xl bg-gradient-to-br from-blue-400 to-indigo-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-400/50 transition-all duration-300">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-bold whitespace-nowrap bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              ระบบติดตามเอกสาร
            </span>
          </Link>
          {/* Desktop Menu - Only show when NOT mobile */}
          {!isMobile && (
            <div className="flex items-center gap-2 xl:gap-3 flex-1 mx-4 justify-center">
              {navConfig.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative px-3 py-2 lg:px-4 rounded-xl transition-all duration-300 text-sm xl:text-base whitespace-nowrap flex items-center gap-2 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow-lg shadow-blue-500/50 scale-105'
                        : 'hover:bg-white/10 hover:shadow-md hover:shadow-blue-400/20 hover:scale-105 backdrop-blur-sm'
                    }`}
                  >
                    {isActive(item.href) && (
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse -z-10"></span>
                    )}
                    <IconComponent className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
          
          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/30 hover:scale-110 backdrop-blur-sm border border-white/10"
              aria-label="Toggle dark mode"
              title={darkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
            >
              {darkMode ? (
                <Moon className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
              ) : (
                <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
              )}
            </button>
            
            {/* Mobile Menu Button - Only show when mobile */}
            {isMobile && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 hover:shadow-md hover:shadow-blue-400/30 hover:scale-105 backdrop-blur-sm border border-white/10"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Mobile Dropdown Menu - Shows when hamburger is clicked and mobile */}
        {isMobile && isOpen && (
          <div className="pb-3 space-y-2 border-t border-blue-400/30 pt-3 animate-slide-in">
            {navConfig.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow-lg shadow-blue-500/30'
                      : 'hover:bg-white/10 hover:shadow-md hover:shadow-blue-400/20 backdrop-blur-sm'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
