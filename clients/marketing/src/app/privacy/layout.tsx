import Header from '@/components/header';
import Footer from '@/components/footer';

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header currentPage="privacy" />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
