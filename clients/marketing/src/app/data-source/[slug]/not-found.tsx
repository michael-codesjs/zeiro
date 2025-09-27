import Link from 'next/link';
import { ArrowLeft } from 'iconsax-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">Data Source Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The data source you're looking for doesn't exist or may have been moved.
        </p>
        <Link 
          href="/features"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
        >
          <ArrowLeft size={16} color="currentColor" variant="Outline" />
          View All Data Sources
        </Link>
      </div>
    </div>
  );
}
