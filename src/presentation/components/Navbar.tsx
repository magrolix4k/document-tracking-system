'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const links = [
    { href: '/', label: 'หน้าแรก', icon: '🏠' },
    { href: '/submit', label: 'ส่งเอกสาร', icon: '📤' },
    { href: '/track', label: 'ติดตามสถานะ', icon: '🔍' },
    { href: '/manage', label: 'จัดการเอกสาร', icon: '📋' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* System Name - Left side - Now clickable */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-sm sm:text-base lg:text-lg font-semibold whitespace-nowrap">
              ระบบติดตามเอกสาร
            </span>
          </Link>
          
          {/* Desktop Menu - Only show when NOT mobile */}
          {!isMobile && (
            <div className="flex items-center gap-3 xl:gap-4 flex-1 mx-4 justify-center">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 lg:px-4 rounded-lg transition-colors text-sm xl:text-base whitespace-nowrap ${
                    isActive(link.href)
                      ? 'bg-indigo-700 font-semibold'
                      : 'hover:bg-indigo-500'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Mobile Menu Button - Only show when mobile */}
          {isMobile && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-indigo-500 transition-colors"
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

        {/* Mobile Dropdown Menu - Shows when hamburger is clicked and mobile */}
        {isMobile && isOpen && (
          <div className="pb-3 space-y-1 border-t border-indigo-500 pt-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'bg-indigo-700 font-semibold'
                    : 'hover:bg-indigo-500'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
