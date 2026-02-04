import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/src/presentation/components/Navbar";
import { ToastProvider } from "@/src/presentation/contexts/ToastContext";
import { sarabun } from "./fonts";

export const metadata: Metadata = {
  title: "ระบบติดตามเอกสาร - Document Tracking System",
  description: "ระบบติดตามสถานะเอกสารออนไลน์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={sarabun.className}>
      <body>
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
