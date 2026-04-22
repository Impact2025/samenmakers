export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-24 bg-surface-container-high" />
        <div className="h-8 w-64 bg-surface-container-high" />
      </div>

      {/* Content skeletons */}
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-hairline p-6 space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-container-high rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-40 bg-surface-container-high" />
                <div className="h-3 w-24 bg-surface-container-high" />
              </div>
            </div>
            <div className="h-3 w-full bg-surface-container-high" />
            <div className="h-3 w-3/4 bg-surface-container-high" />
          </div>
        ))}
      </div>
    </div>
  );
}
