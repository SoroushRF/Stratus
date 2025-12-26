import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "sonner";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stratus | Lean Parser",
  description: "Schedule processing engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-[#050505] text-white`}>
        <GlobalErrorBoundary>
          <AuthProvider>
            <Navbar />
            {children}
            <Toaster position="top-right" richColors theme="dark" />
          </AuthProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
