export default function HomePage() {
  return (
    <main
      className="min-h-screen px-6 py-16 text-slate-100"
      style={{
        background:
          "radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 40%), linear-gradient(180deg, #07111f 0%, #0b1220 100%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
            FinTrack
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
            Personal finance tracker dengan fondasi Next.js dan Supabase.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Struktur awal proyek sudah siap untuk App Router, Tailwind CSS v4,
            serta utilitas client Supabase untuk browser dan server.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["App Router", "Struktur folder siap untuk auth, dashboard, dan data layer."],
            ["Tailwind v4", "Styling berbasis CSS via `app/globals.css` dan `@theme`."],
            ["Supabase", "Client browser dan server sudah disiapkan untuk integrasi berikutnya."],
          ].map(([title, description]) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
            >
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
