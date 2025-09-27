import Header from '@/components/header';
import Footer from '@/components/footer';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header currentPage="blog" />
      {children}
      <Footer />
    </div>
  );
}
