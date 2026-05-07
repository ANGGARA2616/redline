"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { daysRemaining } from "@/lib/utils";
import { Gamepad2, LayoutDashboard, Settings, ScrollText, History, AlertTriangle, Sparkles, LogOut, Crown } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Subscription guard — allow settings page even if expired
  useEffect(() => {
    if (user && user.subscription) {
      const expiresAt = user.subscription.expiresAt;
      const expiresDate = expiresAt?.toDate ? expiresAt.toDate() : new Date(expiresAt as any);
      const expired =
        user.subscription.tier !== "trial" &&
        expiresDate < new Date();
      const isExpiredTier = user.subscription.tier === "expired";

      if ((expired || isExpiredTier) && pathname !== "/dashboard/settings") {
        router.replace("/pricing");
      }
    }
  }, [user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Gamepad2 className="w-10 h-10 text-[var(--qb-primary-light)]" />
          <p className="text-[var(--text-secondary)]">Memuat...</p>
        </div>
      </div>
    );
  }

  // Calculate trial days remaining
  const trialDays =
    user.subscription.tier === "trial"
      ? daysRemaining(
          user.subscription.expiresAt?.toDate
            ? user.subscription.expiresAt.toDate()
            : new Date(user.subscription.expiresAt as any)
        )
      : null;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/dashboard/settings", label: "Paket Antrian", icon: <Settings className="w-4 h-4" /> },
    { href: "/dashboard/log", label: "Game Log", icon: <ScrollText className="w-4 h-4" /> },
    { href: "/dashboard/history", label: "Riwayat", icon: <History className="w-4 h-4" /> },
    { href: "/pricing", label: "Langganan", icon: <Crown className="w-4 h-4 text-[var(--qb-warning)]" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Trial Banner */}
      {trialDays !== null && (
        <div
          className={`px-4 py-2 text-center text-sm font-medium ${
            trialDays <= 1
              ? "bg-[rgba(255,107,107,0.15)] text-[var(--qb-danger)]"
              : trialDays <= 3
                ? "bg-[rgba(253,203,110,0.15)] text-[var(--qb-warning)]"
                : "bg-[rgba(108,92,231,0.1)] text-[var(--qb-primary-light)]"
          }`}
        >
          <span className="inline-flex items-center">
            {trialDays === 0
              ? <><AlertTriangle className="w-4 h-4 inline mr-1" /> Trial kamu sudah habis hari ini! </>
              : <><Sparkles className="w-4 h-4 inline mr-1" /> Free trial — {trialDays} hari lagi. </>}
          </span>
          <Link
            href="/pricing"
            className="underline font-semibold hover:no-underline"
          >
            Upgrade sekarang
          </Link>
        </div>
      )}

      {/* Navbar */}
      <nav className="glass-strong border-b border-[var(--border-default)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo + Nav links */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 shrink-0"
            >
              <Gamepad2 className="w-6 h-6 text-[var(--qb-primary)]" />
              <span className="text-lg font-bold lp-gradient-text hidden sm:inline">
                RedLine
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-[var(--bg-glass)] text-[var(--text-primary)] border border-[var(--border-default)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)]"
                    }`}
                  >
                    <span className="text-base hidden sm:inline">
                      {link.icon}
                    </span>
                    <span className="hidden md:inline">{link.label}</span>
                    <span className="md:hidden text-base">{link.icon}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side: username + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium leading-tight">
                  {user.displayName}
                </p>
                <span className={`px-1.5 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider ${
                  user.subscription?.tier === 'trial' ? 'bg-[var(--text-muted)] text-white' :
                  user.subscription?.tier === 'starter' ? 'bg-[var(--qb-normal)] text-[var(--bg-base)]' :
                  user.subscription?.tier === 'pro' ? 'bg-[var(--qb-fast-track)] text-[var(--bg-base)]' :
                  user.subscription?.tier === 'pro_plus' ? 'bg-[var(--qb-accent)] text-[var(--bg-base)]' :
                  'bg-[var(--qb-danger)] text-white'
                }`}>
                  {user.subscription?.tier === 'pro_plus' ? 'Pro+' : user.subscription?.tier || 'Expired'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-tight">
                @{user.username}
              </p>
            </div>

            <button onClick={logout} className="btn btn-ghost btn-sm" title="Logout">
              <LogOut className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
