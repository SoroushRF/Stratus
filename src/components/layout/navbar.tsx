"use client";

import Link from "next/link";
import { Cloud, User, LogIn, LogOut } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
    const { user, isLoading, logout } = useAuth();

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

                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="h-10 w-10 rounded-full glass animate-pulse" />
                    ) : user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-medium text-white">
                                    {user.name || user.email}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {user.email}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex h-10 w-10 items-center justify-center rounded-full glass hover:bg-white/10 transition-all">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </button>
                                <button 
                                    onClick={logout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/10 transition-all text-sm font-medium"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden md:inline">Logout</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link 
                            href="/api/auth/login"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 transition-all text-sm font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                        >
                            <LogIn className="h-4 w-4" />
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
