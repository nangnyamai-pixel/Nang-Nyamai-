"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { StaffRole } from "@/types/database";

export function StaffSidebar({ staffName, staffRole }: { staffName: string; staffRole: StaffRole }) {
  const pathname = usePathname(); const router = useRouter();
  const [open, setOpen] = useState(false); const [signingOut, setSigningOut] = useState(false);
  async function logout() { setSigningOut(true); await createClient().auth.signOut(); router.replace("/staff/login"); router.refresh(); }
  return <>
    <header className="staff-mobile-header"><span className="staff-mobile-brand">NangNyamai <small>STAFF</small></span><button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="staff-navigation">Menu</button></header>
    <aside id="staff-navigation" className={`staff-sidebar ${open ? "is-open" : ""}`}>
      <div><Link href="/staff/orders" className="staff-sidebar-brand" onClick={() => setOpen(false)}><span className="staff-sidebar-mark">N</span><span>NangNyamai<small>Staff workspace</small></span></Link>
        <nav aria-label="Staff navigation"><p>Workspace</p><Link className={pathname.startsWith("/staff/orders") ? "active" : ""} href="/staff/orders" onClick={() => setOpen(false)}><QueueIcon /> Order Queue</Link><span className="staff-nav-disabled" aria-disabled="true"><CardIcon /> Payment Process <small>Soon</small></span></nav>
      </div>
      <div className="staff-sidebar-footer"><div className="staff-profile-chip"><span>{staffName.charAt(0).toUpperCase()}</span><p>{staffName}<small>{staffRole}</small></p></div><button type="button" onClick={logout} disabled={signingOut}><LogoutIcon /> {signingOut ? "Signing out…" : "Logout"}</button></div>
    </aside>
    {open && <button className="staff-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setOpen(false)} />}
  </>;
}

function QueueIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5zM8 9h8M8 13h5" /></svg>; }
function CardIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3zM3 10h18" /></svg>; }
function LogoutIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5M14 8l4 4-4 4m4-4H9" /></svg>; }
