'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'หน้าแรก' },
    { href: '/submit', label: 'ส่งเอกสาร' },
    { href: '/track', label: 'ติดตามสถานะ' },
    { href: '/manage', label: 'จัดการเอกสาร' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="flex justify-center items-center py-3 sm:py-4">
          {/* Menu - แสดงตลอดเวลาทุกขนาดจอ */}
          <div className="flex items-center gap-2 md:gap-3 xl:gap-4 flex-wrap justify-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 md:px-4 rounded-lg transition-colors text-xs sm:text-sm xl:text-base whitespace-nowrap ${
                  isActive(link.href)
                    ? 'bg-indigo-700 font-semibold'
                    : 'hover:bg-indigo-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
