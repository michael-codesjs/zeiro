import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "../components/layout/navigation";
import "./globals.css";
import ConfigureAmplifyClientSide from "./amplify.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zeiro Dashboard - Make Data Simple As Zero",
  description: "Zero coding. Zero complexity. Zero learning curve. Query your data with natural language and transform your database experience instantly.",
  keywords: ["database", "dashboard", "data management", "SQL", "analytics", "zeiro"],
  authors: [{ name: "Zeiro Team" }],
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
        <div className="flex h-screen bg-slate-50">
          <Navigation />
          <main className="flex-1 flex items-center justify-center">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
