"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PremiumBackground from "@/components/ui/PremiumBackground";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        // Wait until we are absolutely sure about the loading state
        if (!isLoading) {
            console.log("Admin Check - User:", user?.email);
            if (!user) {
                console.log("No user found, redirecting home...");
                router.push("/");
            } else if (!user.is_admin) {
                console.log("User is not an admin, access denied");
                setIsAuthorized(false);
            } else {
                console.log("User authorized for admin view");
                setIsAuthorized(true);
            }
        }
    }, [user, isLoading, router]);

    // Fallback: if it stays loading too long, it's likely a session fetch failure
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoading && !user) {
                console.log("Auth timeout - assuming not logged in");
                router.push("/");
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [isLoading, user, router]);

    if (isLoading || isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <PremiumBackground />
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl max-w-md">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-white/60">
                        This area is restricted to administrators only. Your attempt has been logged.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white relative">
            <PremiumBackground />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
