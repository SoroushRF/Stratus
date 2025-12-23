import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    title: "Stratus | Smart Schedule & Attire Sync",
    description: "Personalized daily commute and clothing advice based on your academic schedule and real-time weather.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground overflow-x-hidden`}>
                {/* Background Elements */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-20" />
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                </div>

                <main className="relative flex min-h-screen flex-col">
                    <Navbar />
                    <div className="flex-1">
                        {children}
                    </div>
                    <Footer />
                </main>
            </body>
        </html>
    );
}
