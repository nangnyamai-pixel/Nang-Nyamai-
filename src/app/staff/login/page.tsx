import type { Metadata } from "next";
import { StaffLoginForm } from "@/components/staff/staff-login-form";

export const metadata: Metadata = { title: "Staff Access | NangNyamai" };

export default function StaffLoginPage() {
  return (
    <main className="staff-login-shell">
      <div className="staff-login-ambient" aria-hidden="true" />
      <section className="staff-login-card" aria-labelledby="staff-login-title">
        <div className="staff-brand-mark" aria-hidden="true">N</div>
        <p className="staff-wordmark">NangNyamai</p>
        <h1 id="staff-login-title">Staff Access</h1>
        <p className="staff-login-subtitle">Please sign in to continue</p>
        <StaffLoginForm />
        <p className="staff-authorized-note"><LockIcon /> Access for authorized staff only</p>
      </section>
    </main>
  );
}

function LockIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2m-9 0h8a2 2 0 0 1 2 2v7H6v-7a2 2 0 0 1 2-2Z" /></svg>; }
