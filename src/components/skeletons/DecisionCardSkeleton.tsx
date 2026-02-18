export function DecisionCardSkeleton() {
    return (
        <div className="bg-bg-secondary border border-border rounded-lg p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="h-6 bg-bg-primary rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-bg-primary rounded w-1/4"></div>
                </div>
                <div className="h-6 w-20 bg-bg-primary rounded-full"></div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="h-3 bg-bg-primary rounded w-full"></div>
                <div className="h-3 bg-bg-primary rounded w-5/6"></div>
                <div className="h-3 bg-bg-primary rounded w-4/6"></div>
            </div>

            <div className="flex gap-2">
                <div className="h-8 bg-bg-primary rounded w-24"></div>
                <div className="h-8 bg-bg-primary rounded w-24"></div>
            </div>
        </div>
    );
}
