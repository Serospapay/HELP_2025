export function CampaignCardSkeleton() {
  return (
    <article
      className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-16 rounded-full bg-slate-800 animate-pulse" />
        <span className="h-4 w-24 rounded-full bg-slate-800 animate-pulse" />
      </div>
      <div className="mt-4 h-6 w-3/4 rounded-full bg-slate-800 animate-pulse" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded-full bg-slate-800 animate-pulse" />
        <div className="h-3 w-5/6 rounded-full bg-slate-800 animate-pulse" />
        <div className="h-3 w-2/3 rounded-full bg-slate-800 animate-pulse" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-3 w-20 rounded-full bg-slate-800 animate-pulse" />
            <div className="h-4 w-24 rounded-full bg-slate-700 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className="h-3 w-16 rounded-full bg-slate-800 animate-pulse" />
          <span className="h-3 w-10 rounded-full bg-slate-800 animate-pulse" />
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-800 animate-pulse" />
      </div>

      <div className="mt-auto flex flex-wrap gap-3 pt-6">
        <span className="inline-flex h-9 w-28 rounded-full bg-slate-800 animate-pulse" />
        <span className="inline-flex h-9 w-32 rounded-full bg-slate-800 animate-pulse" />
      </div>
    </article>
  );
}

