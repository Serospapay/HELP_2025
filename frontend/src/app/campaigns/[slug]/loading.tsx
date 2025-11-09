export default function CampaignDetailLoading() {
  return (
    <article className="space-y-12 pb-20" aria-busy="true" role="status">
      <header className="border-b border-white/10 bg-slate-900/60 py-12">
        <div className="container space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-6 w-20 rounded-full bg-slate-800 animate-pulse" />
            <span className="inline-flex h-6 w-24 rounded-full bg-slate-800 animate-pulse" />
          </div>
          <div className="h-10 w-3/4 rounded-full bg-slate-800 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full max-w-2xl rounded-full bg-slate-800 animate-pulse" />
            <div className="h-4 w-3/4 max-w-2xl rounded-full bg-slate-800 animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex h-12 w-48 rounded-full bg-slate-800 animate-pulse" />
            <span className="inline-flex h-12 w-48 rounded-full bg-slate-800 animate-pulse" />
          </div>
        </div>
      </header>

      <section className="container space-y-10">
        <div className="h-40 rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <div className="h-full w-full rounded-2xl bg-slate-800/60 animate-pulse" />
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-3"
            >
              <div className="h-3 w-24 rounded-full bg-slate-800 animate-pulse" />
              <div className="h-5 w-32 rounded-full bg-slate-800 animate-pulse" />
              <div className="h-3 w-20 rounded-full bg-slate-800 animate-pulse" />
            </div>
          ))}
        </div>

        <section className="space-y-4">
          <div className="h-5 w-40 rounded-full bg-slate-800 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-4 w-full rounded-full bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="h-5 w-44 rounded-full bg-slate-800 animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="h-4 w-1/3 rounded-full bg-slate-800 animate-pulse" />
                <div className="h-3 w-2/3 rounded-full bg-slate-800 animate-pulse" />
                <div className="h-3 w-1/2 rounded-full bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="h-5 w-40 rounded-full bg-slate-800 animate-pulse" />
            <span className="inline-flex h-10 w-40 rounded-full bg-slate-800 animate-pulse" />
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="grid gap-4 border-b border-white/10 bg-slate-950/60 p-4 last:border-b-0 md:grid-cols-4"
              >
                <div className="h-4 w-full rounded-full bg-slate-800 animate-pulse md:col-span-2" />
                <div className="h-4 w-32 rounded-full bg-slate-800 animate-pulse" />
                <div className="h-4 w-24 rounded-full bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <div className="h-3 w-24 rounded-full bg-slate-800 animate-pulse" />
              <div className="h-4 w-32 rounded-full bg-slate-800 animate-pulse" />
              <div className="h-3 w-20 rounded-full bg-slate-800 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

