export default function KennisLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-surface-container-high mb-8 h-8 w-48" />
      <div className="mb-6 flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-container-high h-8 w-24" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest shadow-card space-y-3 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2">
              <div className="bg-surface-container-high h-4 w-16" />
              <div className="bg-surface-container-high h-4 w-32" />
            </div>
            <div className="bg-surface-container-high h-6 w-3/4" />
            <div className="bg-surface-container-high h-4 w-full" />
            <div className="bg-surface-container-high h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
