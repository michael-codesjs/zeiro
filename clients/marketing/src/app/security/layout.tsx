import Header from '@/components/header';
import Footer from '@/components/footer';

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header currentPage="security" />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
