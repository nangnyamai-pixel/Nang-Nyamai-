export default function OrderLoading() {
  return (
    <main className="heritage-pattern mx-auto min-h-screen max-w-5xl px-5 py-8 sm:px-8" aria-label="Memuatkan menu" aria-busy="true">
      <div className="h-56 animate-pulse rounded-[var(--radius-xl)] bg-[var(--charcoal)]/10" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-52 animate-pulse rounded-[var(--radius-lg)] bg-white" />)}
      </div>
    </main>
  );
}
