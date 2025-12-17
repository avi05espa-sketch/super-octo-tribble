import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/footer";
import { FirebaseProvider } from "@/firebase/provider";
import "./globals.css";
import { PT_Sans } from 'next/font/google';

export const metadata: Metadata = {
  title: "Tijuana Marketplace",
  description: "Your local marketplace for everything in Tijuana.",
};

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ptSans.variable} font-body antialiased`}>
        <FirebaseProvider>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            {/* <Footer /> */}
          </div>
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
