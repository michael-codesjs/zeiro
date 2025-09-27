import Header from '@/components/header';
import Footer from '@/components/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <Header currentPage="home" />
      {children}
      <Footer />
    </div>
  );
}
