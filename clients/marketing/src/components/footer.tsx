import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
         <div>
           <h3 className="text-white font-semibold mb-4">Resources</h3>
           <ul className="space-y-3">
             <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
             <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
           </ul>
         </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center justify-center mb-4 md:mb-0">
            <Link href="/" className="text-xl font-bold text-white mr-8 hover:text-gray-300 transition-colors">
              zeiro
            </Link>
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Zeiro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
