import Link from "next/link";
import { Cloud, User } from "lucide-react";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full glass-border bg-background/60 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                            <Cloud className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-glow">
                            STRATUS
                        </span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Dashboard
                    </Link>
                    <Link href="/schedule" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Schedule
                    </Link>
                    <Link href="/weather" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Weather
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full glass hover:bg-white/10 transition-all">
                        <User className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>
            </div>
        </header>
    );
}
