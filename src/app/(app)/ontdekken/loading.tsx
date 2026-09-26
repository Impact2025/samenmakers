export default function OntdekkenLoading() {
  return (
    <div
      className="flex animate-pulse flex-col gap-5"
      aria-busy="true"
      aria-label="Laden"
    >
      <div className="bg-surface-container h-8 w-56 rounded-xl" />
      <div className="bg-surface-container-low h-[50px] rounded-xl" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-low h-8 w-24 shrink-0 rounded-full"
          />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest shadow-card flex flex-col gap-3 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-surface-container h-12 w-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-surface-container h-4 w-32 rounded-full" />
                <div className="bg-surface-container h-3 w-20 rounded-full" />
              </div>
            </div>
            <div className="bg-surface-container h-3 w-full rounded-full" />
            <div className="bg-surface-container h-3 w-4/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
