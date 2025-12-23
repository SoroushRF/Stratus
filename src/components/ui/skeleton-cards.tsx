"use client";

export function SkeletonCards() {
    return (
        <div className="grid gap-6 w-full max-w-4xl mx-auto animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="glass p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5" />
                            <div className="h-6 w-48 bg-white/5 rounded-lg" />
                        </div>
                        <div className="flex gap-6">
                            <div className="h-4 w-32 bg-white/5 rounded-lg" />
                            <div className="h-4 w-24 bg-white/5 rounded-lg" />
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/5" />
                </div>
            ))}
        </div>
    );
}

export function RecommendationSkeleton() {
    return (
        <div className="glass p-8 rounded-[40px] w-full max-w-5xl mx-auto space-y-8 animate-pulse text-center">
            <div className="mx-auto w-32 h-6 bg-white/5 rounded-full" />
            <div className="mx-auto w-[60%] h-16 bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-white/5 rounded-3xl" />
                ))}
            </div>
        </div>
    );
}
