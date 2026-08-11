export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-xl font-semibold">Sign-in failed</h1>
      <p className="text-sm text-neutral-500">
        Something went wrong while signing you in with Google. Please try
        again, or continue as a guest.
      </p>
    </main>
  );
}
