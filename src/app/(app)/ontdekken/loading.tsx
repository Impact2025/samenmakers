export default function OntdekkenLoading() {
  return (
    <div className="animate-pulse">
      {/* Filter bar skeleton */}
      <div className="mb-6 flex flex-wrap gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-container-high h-9 w-28" />
        ))}
      </div>
      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest shadow-card space-y-4 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="bg-surface-container-high h-14 w-14 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-surface-container-high h-4 w-28" />
                <div className="bg-surface-container-high h-3 w-20" />
              </div>
            </div>
            <div className="bg-surface-container-high h-3 w-full" />
            <div className="bg-surface-container-high h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
