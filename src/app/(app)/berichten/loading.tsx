export default function BerichtenLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-surface-container-high mb-6 h-8 w-40" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest shadow-card flex items-center gap-4 rounded-2xl p-4"
          >
            <div className="bg-surface-container-high h-12 w-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="bg-surface-container-high h-4 w-32" />
              <div className="bg-surface-container-high h-3 w-48" />
            </div>
            <div className="bg-surface-container-high h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
