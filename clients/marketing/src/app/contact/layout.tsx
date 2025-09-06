import Header from '@/components/header';
import Footer from '@/components/footer';

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header currentPage="contact" />
      {children}
      <Footer />
    </div>
  );
}
