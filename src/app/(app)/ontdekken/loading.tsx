export default function OntdekkenLoading() {
  return (
    <div className="animate-pulse">
      {/* Filter bar skeleton */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-28 bg-surface-container-high" />
        ))}
      </div>
      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="border border-hairline p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-surface-container-high shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 bg-surface-container-high" />
                <div className="h-3 w-20 bg-surface-container-high" />
              </div>
            </div>
            <div className="h-3 w-full bg-surface-container-high" />
            <div className="h-3 w-4/5 bg-surface-container-high" />
          </div>
        ))}
      </div>
    </div>
  );
}
