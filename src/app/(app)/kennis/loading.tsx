export default function KennisLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-surface-container mb-8 h-8 w-48 rounded-full" />
      <div className="mb-6 flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-container h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest shadow-card space-y-3 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2">
              <div className="bg-surface-container h-4 w-16 rounded-full" />
              <div className="bg-surface-container h-4 w-32 rounded-full" />
            </div>
            <div className="bg-surface-container h-6 w-3/4 rounded-full" />
            <div className="bg-surface-container h-4 w-full rounded-full" />
            <div className="bg-surface-container h-4 w-2/3 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
