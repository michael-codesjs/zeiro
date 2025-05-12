import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      <header className="px-6 py-4 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="font-bold text-gray-900 text-2xl">
            zeiro
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-yellow-400">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-6">Page Not Found</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto">
            We cannot find the page you&apos;re looking for. The page might have been moved or deleted.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors font-medium shadow-lg shadow-yellow-300/30"
          >
            <span>Return to Home</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </main>

      <footer className="px-6 py-4 bg-transparent">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Zeiro. All rights reserved.
        </div>
      </footer>
    </div>
  )
} 