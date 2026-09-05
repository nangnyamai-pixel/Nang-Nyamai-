"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function StaffLoginForm() {
  const supabase = createClient();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setPending(true);
    const formData = new FormData(event.currentTarget);
    try {
      const rawStaffId = String(formData.get("staffId") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const staffId = rawStaffId.toUpperCase();
      const email = `${staffId.toLowerCase()}@staff.nangnyamai.invalid`;
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError || !data.user) { setError("Invalid Staff ID or password."); return; }

      const { data: profile, error: profileError } = await supabase
        .from("staff_profiles")
        .select("staff_id, is_active")
        .eq("auth_user_id", data.user.id)
        .maybeSingle();

      if (profileError || !profile || profile.staff_id !== staffId) {
        await supabase.auth.signOut();
        setError("Invalid Staff ID or password.");
        return;
      }
      if (!profile.is_active) {
        await supabase.auth.signOut();
        setError("Your staff account is currently inactive. Please contact an administrator.");
        return;
      }
      const { data: currentSession } = await supabase.auth.getSession();
      if (!currentSession.session) {
        await supabase.auth.signOut();
        setError("Unable to establish session. Please try again.");
        return;
      }
      const handoffResponse = await fetch("/api/staff/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: currentSession.session.access_token,
          refreshToken: currentSession.session.refresh_token,
        }),
      });
      if (!handoffResponse.ok) {
        await supabase.auth.signOut();
        setError("Unable to establish session. Please try again.");
        return;
      }
      window.location.assign("/staff/orders");
    } catch { setError("Unable to reach the server. Please check your connection."); }
    finally { setPending(false); }
  }

  return (
    <form className="staff-login-form" onSubmit={handleSubmit}>
      {error && <div className="staff-login-error" role="alert">{error}</div>}
      <label htmlFor="staff-id">Staff ID</label>
      <div className="staff-input-wrap"><UserIcon /><input id="staff-id" name="staffId" autoComplete="username" placeholder="e.g. STF001" required /></div>
      <label htmlFor="staff-password">Password</label>
      <div className="staff-input-wrap"><KeyIcon /><input id="staff-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required /><button className="staff-password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div>
      <button className="staff-sign-in" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      <button className="staff-forgot" type="button" onClick={() => setShowHelp((value) => !value)}>Forgot password?</button>
      {showHelp && <p className="staff-help" role="status">Please ask your administrator to reset your staff password.</p>}
    </form>
  );
}

function UserIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" /></svg>; }
function KeyIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 7a5 5 0 1 1-4.4 7.4L3 22v-4l2-2h3l1.6-1.6M17 7h.01" /></svg>; }
