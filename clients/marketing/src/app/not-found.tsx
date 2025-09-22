import Link from 'next/link';
import { Home } from 'iconsax-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="font-bold text-white text-2xl hover:text-gray-300 transition-colors">
            zeiro
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-white mb-4">404</h1>
            <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Page Not Found</h2>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              <Home size={18} color="currentColor" variant="Outline" />
              <span>Back to Home</span>
            </Link>
            <Link 
              href="/features" 
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
            >
              <span>Explore Features</span>
            </Link>
          </div>
          
          <div className="mt-12 text-sm text-gray-500">
            <p>Need help? <Link href="/contact" className="text-white hover:text-gray-300 transition-colors">Contact us</Link></p>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Zeiro. All rights reserved.
        </div>
      </footer>
    </div>
  )
} 