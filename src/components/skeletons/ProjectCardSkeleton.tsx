export function ProjectCardSkeleton() {
    return (
        <div className="bg-bg-secondary/80 border border-border rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div className="flex-1">
                    <div className="h-4 animate-shimmer rounded-md w-3/4 mb-2" />
                    <div className="h-2.5 animate-shimmer rounded-md w-1/4" />
                </div>
                <div className="h-5 w-16 animate-shimmer rounded-full" />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                    <div className="h-2 animate-shimmer rounded-md w-1/2 mb-2" />
                    <div className="h-7 animate-shimmer rounded-md w-2/3 mb-2.5" />
                    <div className="h-1 animate-shimmer rounded-full w-full" />
                </div>
                <div>
                    <div className="h-2 animate-shimmer rounded-md w-1/2 mb-2" />
                    <div className="h-7 animate-shimmer rounded-md w-2/3 mb-2.5" />
                    <div className="flex gap-0.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="h-1 flex-1 animate-shimmer rounded-full" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border/60">
                <div className="h-2 animate-shimmer rounded-md w-1/4 mb-2" />
                <div className="h-3 animate-shimmer rounded-md w-5/6" />
            </div>
        </div>
    );
}
