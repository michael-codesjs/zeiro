import Header from '@/components/header';
import Footer from '@/components/footer';

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header currentPage="status" />
      {children}
      <Footer />
    </div>
  );
}
