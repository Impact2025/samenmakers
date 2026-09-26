export default function AppLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="bg-surface-container h-3 w-24 rounded-full" />
        <div className="bg-surface-container h-8 w-64 rounded-full" />
      </div>

      {/* Content skeletons */}
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest shadow-card space-y-3 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-surface-container-high h-12 w-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-surface-container h-4 w-40 rounded-full" />
                <div className="bg-surface-container h-3 w-24 rounded-full" />
              </div>
            </div>
            <div className="bg-surface-container h-3 w-full rounded-full" />
            <div className="bg-surface-container h-3 w-3/4 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
