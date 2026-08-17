export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[var(--charcoal)] p-6 text-[var(--warm-ivory)] sm:p-10">
      <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full border-[28px] border-[var(--sarawak-red)]/30" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-20 left-8 h-40 w-40 border border-[var(--heritage-yellow)]/20" aria-hidden="true" />
      <header className="relative flex items-center justify-between text-xs font-bold uppercase tracking-[0.25em]"><span>NangNyamai</span><span className="text-[var(--heritage-yellow)]">Kuching, Sarawak</span></header>
      <section className="relative mx-auto w-full max-w-xl py-20">
        <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[var(--heritage-yellow)]">Taste of Sarawak</p>
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">Local flavour.<br /><span className="text-[var(--sarawak-red)]">Modern table.</span></h1>
        <p className="mt-6 max-w-md text-base leading-7 text-[var(--soft-sand)]">Authentic heritage recipes, prepared fresh at Budaya Restaurant.</p>
        <a href="/order" className="mt-9 inline-flex min-h-12 items-center rounded-full bg-[var(--sarawak-red)] px-6 text-sm font-bold text-white transition hover:bg-[#b9151b]">Explore menu</a>
      </section>
      <footer className="relative text-xs text-[var(--secondary-text)]">Authentic · Local · Heritage</footer>
    </main>
  );
}
