export default function AdminDashboardPlaceholder() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <p className="text-sm text-neutral-500">
        Admin dashboard — built in Sprint 5. This route is protected by
        middleware + server-side role checks (see lib/auth/roles.ts).
      </p>
    </main>
  );
}
