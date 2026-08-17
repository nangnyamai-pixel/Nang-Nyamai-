export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">NangNyamai</h1>
      <p className="max-w-md text-sm text-neutral-500">
        This application is designed to be opened via a table QR code
        (e.g. <code>/order?table=T12&amp;token=…</code>). Sprint 0 sets up
        the project foundation only — the customer ordering flow is built in
        Sprint 1.
      </p>
    </main>
  );
}
