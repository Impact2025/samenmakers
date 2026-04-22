export default function BerichtenLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-40 bg-surface-container-high mb-6" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border border-hairline">
            <div className="w-12 h-12 rounded-full bg-surface-container-high shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-surface-container-high" />
              <div className="h-3 w-48 bg-surface-container-high" />
            </div>
            <div className="h-3 w-12 bg-surface-container-high" />
          </div>
        ))}
      </div>
    </div>
  );
}
