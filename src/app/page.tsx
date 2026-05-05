"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Gamepad2, Zap, LayoutDashboard, ScrollText, RefreshCw, Globe, Wallet, ClipboardList, Video, CreditCard, Check, Sparkles, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 glass-strong">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Gamepad2 className="w-8 h-8 text-[var(--qb-primary)]" />
            <span className="text-xl font-bold gradient-text">
              QueueBareng
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  Masuk
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Mulai Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
            style={{ background: "radial-gradient(circle, var(--qb-primary), transparent)" }}
          />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="badge badge-live mb-6 mx-auto">
              <span className="w-2 h-2 rounded-full bg-[var(--qb-danger)] animate-pulse" />
              LIVE
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Kelola Antrian{" "}
              <span className="gradient-text">Main Bareng</span>
              <br />
              Tanpa Ribet
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Platform otomatis untuk live streamer Mobile Legends.
              Auto-detect nominal donasi, antrian real-time, game log
              anti-dispute — semua dalam satu dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn btn-primary btn-lg">
                🚀 Coba Gratis 7 Hari
              </Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">
                Lihat Harga
              </Link>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="text-center text-[var(--text-secondary)] mb-14 max-w-xl mx-auto">
              Dari input order sampai game log, QueueBareng mengurus semuanya.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="card group hover:border-[var(--qb-primary)] animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-20 px-6 bg-[var(--bg-surface)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-14">
              Cara Kerja
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((s, i) => (
                <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-14 h-14 rounded-full bg-[var(--bg-glass)] border border-[var(--border-default)] flex items-center justify-center text-2xl mx-auto mb-4">
                    {s.icon}
                  </div>
                  <div className="text-xs font-semibold text-[var(--qb-primary-light)] mb-1">
                    STEP {i + 1}
                  </div>
                  <h3 className="font-semibold mb-1">{s.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="py-20 px-6 relative" id="pricing">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold mb-4">
                Pilih Paket <span className="gradient-text">QueueBareng</span>
              </h2>
              <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                Tingkatkan efisiensi manajemen antrian mabar Anda dengan platform profesional.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
              {TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative glass-strong rounded-[var(--radius-xl)] p-8 transition-all hover:-translate-y-2 ${
                    tier.border
                  } ${tier.popular ? `scale-105 ${tier.shadow}` : ""}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--qb-fast-track)] text-[var(--bg-base)] text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                      Paling Laris
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-xl bg-[var(--bg-elevated)] ${tier.color}`}>
                      <tier.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-bold">
                      Rp {(tier.price / 1000).toLocaleString("id-ID")}k
                    </span>
                    <span className="text-[var(--text-muted)]">/bulan</span>
                  </div>

                  <div className="space-y-4 mb-8">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 shrink-0 ${tier.color}`} />
                        <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/register?tier=${tier.id}`}
                    className={`w-full py-3 px-4 rounded-[var(--radius-md)] font-bold transition-all flex items-center justify-center gap-2 ${
                      tier.popular
                        ? "bg-[var(--qb-fast-track)] text-[var(--bg-base)] hover:bg-[rgba(253,203,110,0.9)] shadow-[0_4px_15px_rgba(253,203,110,0.3)]"
                        : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.1)] border border-[var(--border-default)]"
                    }`}
                  >
                    Pilih {tier.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* ── CTA ── */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Siap Upgrade Antrian Kamu?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8">
              Daftar sekarang dan nikmati 7 hari gratis. Tanpa kartu kredit.
            </p>
            <Link href="/register" className="btn btn-accent btn-lg">
              Mulai Sekarang →
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-[var(--border-default)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[var(--qb-primary-light)]" />
            <span className="font-semibold gradient-text">QueueBareng</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} QueueBareng. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Static data ──

const features = [
  {
    icon: <Zap className="w-8 h-8 text-[var(--qb-fast-track)]" />,
    title: "Auto-Detect Nominal",
    desc: "Input nominal donasi, sistem otomatis mendeteksi paket dan jalur antrian. Tidak perlu hitung manual.",
  },
  {
    icon: <LayoutDashboard className="w-8 h-8 text-[var(--qb-accent)]" />,
    title: "Queue Real-Time",
    desc: "Dashboard dua jalur (Fast Track & Normal) yang update otomatis tanpa refresh.",
  },
  {
    icon: <ScrollText className="w-8 h-8 text-[var(--qb-primary-light)]" />,
    title: "Game Log Anti-Dispute",
    desc: "Setiap game tercatat dengan timestamp. Tidak ada lagi customer yang bisa bohong.",
  },
  {
    icon: <RefreshCw className="w-8 h-8 text-[var(--qb-success)]" />,
    title: "Carry-Over Otomatis",
    desc: "Sisa game tersimpan dan muncul otomatis di sesi live berikutnya.",
  },
  {
    icon: <Globe className="w-8 h-8 text-[var(--qb-normal)]" />,
    title: "Public Queue Page",
    desc: "Link antrian yang bisa di-share ke penonton. Real-time dan mobile-friendly.",
  },
  {
    icon: <Wallet className="w-8 h-8 text-[var(--qb-warning)]" />,
    title: "Paket Harga Fleksibel",
    desc: "Atur sendiri paket harga, termasuk bundle. Sistem auto-mapping dari nominal.",
  },
];

const steps = [
  {
    icon: <ClipboardList className="w-6 h-6 text-[var(--qb-normal)]" />,
    title: "Setup Paket",
    desc: "Atur daftar harga paket main bareng kamu.",
  },
  {
    icon: <Video className="w-6 h-6 text-[var(--qb-primary)]" />,
    title: "Mulai Sesi",
    desc: "Buka sesi live baru saat mulai streaming.",
  },
  {
    icon: <CreditCard className="w-6 h-6 text-[var(--qb-accent)]" />,
    title: "Input Donasi",
    desc: "Masukkan nominal & ML ID, antrian terbentuk otomatis.",
  },
  {
    icon: <Gamepad2 className="w-6 h-6 text-[var(--qb-success)]" />,
    title: "Main!",
    desc: "Klik mulai & selesai game. Log otomatis tercatat.",
  },
];

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    price: 150000,
    features: [
      "Maksimal 20 antrian per sesi",
      "Game Log 7 hari terakhir",
      "Basic Auto-detect nominal",
      "Dukungan komunitas",
    ],
    icon: Zap,
    color: "text-[var(--qb-normal)]",
    bg: "bg-[var(--qb-normal)]",
    border: "border-[rgba(116,185,255,0.3)]",
    shadow: "shadow-[0_0_15px_rgba(116,185,255,0.15)]",
  },
  {
    id: "pro",
    name: "Pro",
    price: 300000,
    features: [
      "Antrian tidak terbatas",
      "Game Log 30 hari terakhir",
      "Smart Auto-detect & Anomaly",
      "Prioritas dukungan tim",
    ],
    icon: Sparkles,
    color: "text-[var(--qb-fast-track)]",
    bg: "bg-[var(--qb-fast-track)]",
    border: "border-[var(--qb-fast-track)]",
    shadow: "shadow-[0_0_20px_rgba(253,203,110,0.3)]",
    popular: true,
  },
  {
    id: "pro_plus",
    name: "Pro+",
    price: 500000,
    features: [
      "Semua fitur Pro",
      "Game Log permanen",
      "Kustomisasi tema public queue",
      "Akses API (Post-MVP)",
    ],
    icon: ShieldCheck,
    color: "text-[var(--qb-accent)]",
    bg: "bg-[var(--qb-accent)]",
    border: "border-[rgba(0,206,201,0.3)]",
    shadow: "shadow-[0_0_15px_rgba(0,206,201,0.15)]",
  },
];
