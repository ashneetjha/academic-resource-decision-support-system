"use client";

function SkeletonBlock({ className = "" }: { className?: string }) {
    return (
        <div
            className={`shimmer rounded-xl ${className}`}
            aria-hidden="true"
        />
    );
}

export function StatsCardSkeleton() {
    return (
        <div className="glass p-5 space-y-3">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-8 w-16" />
            <SkeletonBlock className="h-3 w-32" />
        </div>
    );
}

export function AlertSkeleton() {
    return (
        <div className="glass p-4 space-y-2 animate-fade-in">
            <div className="flex items-center gap-3">
                <SkeletonBlock className="h-4 w-12" />
                <SkeletonBlock className="h-3 flex-1" />
            </div>
            <SkeletonBlock className="h-3 w-3/4" />
        </div>
    );
}

export function ProposalSkeleton() {
    return (
        <div className="glass p-5 space-y-4">
            <div className="flex items-center justify-between">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-16" />
            </div>
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-5/6" />
            <div className="flex gap-2 pt-2">
                <SkeletonBlock className="h-8 w-20" />
                <SkeletonBlock className="h-8 w-20" />
                <SkeletonBlock className="h-8 w-20" />
            </div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="glass p-5 space-y-3">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-52 w-full" />
        </div>
    );
}

export function LoadingSkeleton({ variant = "generic", count = 1 }: { variant?: "stats" | "alert" | "proposal" | "chart" | "generic"; count?: number }) {
    const items = Array.from({ length: count });
    return (
        <>
            {items.map((_, i) => (
                <div key={i} aria-busy="true" aria-label="Loading...">
                    {variant === "stats" && <StatsCardSkeleton />}
                    {variant === "alert" && <AlertSkeleton />}
                    {variant === "proposal" && <ProposalSkeleton />}
                    {variant === "chart" && <ChartSkeleton />}
                    {variant === "generic" && <SkeletonBlock className="h-20 w-full" />}
                </div>
            ))}
        </>
    );
}
