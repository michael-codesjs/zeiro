import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#111] text-[#333] dark:text-white p-8">
      <div className="flex items-center space-x-2 mb-8">
        <Image src="/zeiro-logo.svg" alt="Zeiro Logo" width={40} height={40} />
        <span className="text-2xl font-bold">Zeiro</span>
      </div>
      
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-medium mb-8">Page Not Found</h2>
      
      <p className="text-center max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Link 
        href="/" 
        className="px-6 py-3 bg-[#ff5533] text-white rounded-full hover:bg-[#e64a2e] transition duration-200"
      >
        Return Home
      </Link>
    </div>
  );
} 