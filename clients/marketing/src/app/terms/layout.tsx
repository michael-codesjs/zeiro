import Header from '@/components/header';
import Footer from '@/components/footer';

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header currentPage="terms" />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
