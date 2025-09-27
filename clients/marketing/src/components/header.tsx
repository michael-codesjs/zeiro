import Link from 'next/link';
import { buttonVariants } from './Button';

interface HeaderProps {
  currentPage?: 'home' | 'features' | 'pricing' | 'integrations' | 'blog' | 'careers' | 'contact' | 'help' | 'status' | 'privacy' | 'terms' | 'security';
}

export default function Header({ currentPage = 'home' }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-foreground hover:text-muted-foreground transition-colors">
            zeiro
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/features" 
            className={`transition-colors ${
              currentPage === 'features' 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Features
          </Link>
          <Link 
            href="/pricing" 
            className={`transition-colors ${
              currentPage === 'pricing' 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pricing
          </Link>
          <Link 
            href="/integrations" 
            className={`transition-colors ${
              currentPage === 'integrations' 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'
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
