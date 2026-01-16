'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
          {/* System Name - Left side */}
          <div className="flex items-center">
            <span className="text-sm sm:text-base lg:text-lg font-semibold whitespace-nowrap">
              ระบบติดตามเอกสาร
            </span>
          </div>
          
          {/* Desktop Menu - Always visible on all screens */}
          <div className="flex items-center gap-2 md:gap-3 xl:gap-4 flex-wrap justify-center flex-1 mx-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 sm:px-3 py-2 md:px-4 rounded-lg transition-colors text-xs sm:text-sm xl:text-base whitespace-nowrap ${
                  isActive(link.href)
                    ? 'bg-indigo-700 font-semibold'
                    : 'hover:bg-indigo-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button - Always visible */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-indigo-500 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
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
        </div>

        {/* Mobile Dropdown Menu - Shows when hamburger is clicked */}
        {isOpen && (
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
