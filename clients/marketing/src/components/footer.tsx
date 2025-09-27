import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-foreground font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/integrations" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-foreground font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          
         <div>
           <h3 className="text-foreground font-semibold mb-4">Resources</h3>
           <ul className="space-y-3">
             <li><Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
             <li><Link href="/status" className="text-muted-foreground hover:text-foreground transition-colors">Status</Link></li>
           </ul>
         </div>
          
          <div>
            <h3 className="text-foreground font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              <li><Link href="/security" className="text-muted-foreground hover:text-foreground transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center justify-center mb-4 md:mb-0">
            <Link href="/" className="text-xl font-bold text-foreground mr-8 hover:text-muted-foreground transition-colors">
              zeiro
            </Link>
            <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} Zeiro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
