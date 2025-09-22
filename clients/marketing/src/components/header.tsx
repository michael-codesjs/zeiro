import Link from 'next/link';
import { buttonVariants } from './button';

interface HeaderProps {
  currentPage?: 'home' | 'features' | 'pricing' | 'integrations' | 'blog' | 'careers' | 'contact' | 'help' | 'status' | 'privacy' | 'terms' | 'security';
}

export default function Header({ currentPage = 'home' }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-white hover:text-gray-300 transition-colors">
            zeiro
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/features" 
            className={`transition-colors ${
              currentPage === 'features' 
                ? 'text-white font-medium' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Features
          </Link>
          <Link 
            href="/pricing" 
            className={`transition-colors ${
              currentPage === 'pricing' 
                ? 'text-white font-medium' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pricing
          </Link>
          <Link 
            href="/integrations" 
            className={`transition-colors ${
              currentPage === 'integrations' 
                ? 'text-white font-medium' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Integrations
          </Link>
        </nav>
        
        <div className="flex items-center space-x-6">
          <Link href="/auth/in" className={buttonVariants({ variant: "ghost" })}>
            Sign in
          </Link>
          <Link href="/auth/up" className={buttonVariants({ variant: "primary" })}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
