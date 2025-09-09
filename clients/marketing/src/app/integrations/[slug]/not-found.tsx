import Link from 'next/link';
import { ArrowLeft } from 'iconsax-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Integration Not Found</h1>
        <p className="text-gray-400 mb-8">The integration you're looking for doesn't exist.</p>
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          <ArrowLeft size={16} color="currentColor" variant="Outline" />
          Back to integrations
        </Link>
      </div>
    </div>
  );
}
