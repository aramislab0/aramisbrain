export function EventCardSkeleton() {
    return (
        <div className="bg-bg-secondary border border-border rounded-lg p-4 animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-bg-primary rounded-full"></div>
                <div className="flex-1">
                    <div className="h-4 bg-bg-primary rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-bg-primary rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-bg-primary rounded w-2/3"></div>
                </div>
                <div className="h-3 w-20 bg-bg-primary rounded"></div>
            </div>
        </div>
    );
}
