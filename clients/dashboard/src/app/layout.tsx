import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "@/components/layout/navigation";
import "./globals.css";
import ConfigureAmplifyClientSide from "./amplify.config";
import { Toaster } from 'react-hot-toast';
import QueryProvider from "../providers/query-client-provider";
import { WebSocketConnection } from "@/providers/websocket-connection";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zeiro",
  description: "Make Data Simple As Zero",
  keywords: ["database", "dashboard", "data management", "SQL", "analytics", "zeiro"],
  authors: [{ name: "zeiro" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConfigureAmplifyClientSide />
        <QueryProvider>
          <WebSocketConnection />
          <div className="flex h-screen bg-slate-50">
            <Navigation />
            <main className="flex-1 flex items-center justify-center overflow-hidden">
              {children}
            </main>
          </div>
        </QueryProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              duration: 5000,
              iconTheme: {
                primary: '#10B981',
                secondary: 'white',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
