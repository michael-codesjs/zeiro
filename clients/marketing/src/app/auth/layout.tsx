import type { Metadata } from "next";
import Link from 'next/link';
import { ArrowLeft } from 'iconsax-react';

export const metadata: Metadata = {
  title: "Zeiro - Authentication",
  description: "Sign in or create your Zeiro account to get started with AI-powered data analysis",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white hover:text-gray-300 transition-colors">
              zeiro
            </Link>
          </div>
          
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} color="currentColor" variant="Outline" />
            <span>Back to home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
