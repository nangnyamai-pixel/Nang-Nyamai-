export default function StaffDashboardPlaceholder() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <p className="text-sm text-neutral-500">
        Staff dashboard — built in Sprint 2. This route is protected by
        middleware + server-side role checks (see lib/auth/roles.ts).
      </p>
    </main>
  );
}
