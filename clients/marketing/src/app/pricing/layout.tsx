import Header from '@/components/header';
import Footer from '@/components/footer';

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header currentPage="pricing" />
      {children}
      <Footer />
    </div>
  );
}
