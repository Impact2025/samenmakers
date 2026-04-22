export default function KennisLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-surface-container-high mb-8" />
      <div className="flex gap-2 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-surface-container-high" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border border-hairline p-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-surface-container-high" />
              <div className="h-4 w-32 bg-surface-container-high" />
            </div>
            <div className="h-6 w-3/4 bg-surface-container-high" />
            <div className="h-4 w-full bg-surface-container-high" />
            <div className="h-4 w-2/3 bg-surface-container-high" />
          </div>
        ))}
      </div>
    </div>
  );
}
